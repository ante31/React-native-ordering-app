import { useRef, useState, version } from "react";
import { Alert } from "react-native";
import * as Sentry from "@sentry/react-native";
import { getVersion } from "@/app/services/checkVersion";
import { backendUrl } from "../localhostConf";
import { isDeliveryClosed, onlyCustomOrders } from '../app/services/isAppClosed';
import { safeFetch } from "../app/services/safeFetch";
import { storeData } from "../app/services/storageService";
import { updateMealPopularity } from "../app/services/updateMealPopularity";
import {
  getDayOfTheWeek,
  getLocalTime,
  setTimeInISOString,
} from "../app/services/getLocalTime";
import validateForm from "@/app/services/validateForm";

export function useOrderSubmit({
  orderData,
  totalPrice,
  setUiValue,
  isSlidRight,
  selectedDeliveryOption,
  timeString,
  expoPushToken,
  selectedCoupon,
  general,
  revokeCoupon,
  dispatch,
  navigation,
  isCroatianLang,
  setErrors,
  cartState,
}: any) {

  // useRef čuva isti ključ kroz re-rendere i neuspjele pokušaje (da izbjegnemo duplanje)
  const idempotencyKeyRef = useRef<string | null>(null);

  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  
  const submitOrder = async () => {
    if (!general?.workTime) {
      throw new Error("Missing workTime");
    }

    if (isDeliveryClosed(general.workTime[dayOfWeek]) && !isSlidRight && selectedDeliveryOption !== 'custom') {
      setUiValue("displayWorkTimeMessage", true);
      return;
    }

    const isValid = validateForm(
      orderData,
      isSlidRight,
      totalPrice,
      setErrors,
      general?.minOrder,
      isCroatianLang
    );

    if (!isValid) return;

    // Ako nemamo ključ (ovo je prvi pokušaj), generiraj ga
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    const now = getLocalTime();
    let deadline = "";

    if (selectedDeliveryOption === "standard") {
      const additionalTime = !isSlidRight
        ? general?.deliveryTime || 0
        : general?.pickUpTime || 0;

      const d = new Date(now);
      d.setMinutes(d.getMinutes() + additionalTime);
      deadline = d.toISOString();
    }

    if (selectedDeliveryOption === "custom") {
      if (!timeString || !timeString.includes(":")) {
        setUiValue("displaySecondMessage", true);
        return;
      }

      const [hours, minutes] = timeString.split(":").map(Number);
      deadline = setTimeInISOString(now.toISOString(), hours, minutes);
    }

    const payload = {
      ...orderData,
      idempotencyKey: idempotencyKeyRef.current,
      version: getVersion(),
      cartItems: cartState.items,
      isDelivery: !isSlidRight,
      totalPrice: totalPrice,
      coupon: selectedCoupon?.value || null,
      token: expoPushToken?.data || null,
      timeOption: selectedDeliveryOption,
      time: now,
      deadline,
      status: "pending",
      language: isCroatianLang ? "hr" : "en",
      zone: !isSlidRight ? orderData.zone : "",
    };

    const response = await safeFetch(`${backendUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Server error");
    }

    const data = await response.json();

    if (!data?.id) {
      throw new Error("Missing order ID");
    }

    // USPJEH - Brišemo ključ iz ref-a kako bi iduća nova narudžba dobila svježi ključ
    idempotencyKeyRef.current = null;

    await storeData(data.id, payload);
    updateMealPopularity(cartState.items);

    if (selectedCoupon) {
      revokeCoupon(selectedCoupon.id);
    }

    dispatch({ type: "CLEAR_CART" });

    navigation.navigate("ThankYouScreen", { 
      isCroatianLang, 
      orderId: data.id, 
      orderDate: now.toISOString(),
      notificationResult: data.notificationResult ?? null,
      isPreOrder: onlyCustomOrders(general.workTime[dayOfWeek]),
    });
  };

  const executeWithTimeout = () => {
    return Promise.race([
      submitOrder(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);
  };

  const handleSubmit = async () => {
    Sentry.setUser({ id: orderData.phone });
    Sentry.setTag("feature", "checkout");
    Sentry.setContext("cart", {
      itemsCount: cartState.items?.length,
      totalPrice: orderData.totalPrice,
      isDelivery: !isSlidRight,
      zone: orderData.zone,
      coupon: selectedCoupon?.value || null,
    });

    setUiValue("isSubmitting", true);

    try {
      // PRVI POKUŠAJ
      await executeWithTimeout();
    } catch (err: any) {
      console.warn("Prvi pokušaj propao, provjeravam za automatski retry...", err.message);

      // AUTOMATSKI RETRY: Ako je pukla mreža ili je bio timeout, probaj odmah još jednom s ISTIM ključem
      const isNetworkError = err.message?.includes("Network request failed") || err.message === "Request timeout";
      
      if (isNetworkError) {
        try {
          console.log("Pokrećem automatski retry s istim idempotency ključem...");
          await executeWithTimeout();
          return; // Ako upali iz drugog pokušaja, prekini funkciju ovdje (sve je super)
        } catch (retryErr: any) {
          err = retryErr; // Ako i drugi put pukne, baci tu novu grešku u finalni catch dolje
        }
      }

      // KONAČNI FAIL (Ako ni retry nije uspio)
      console.error(err);
      Sentry.captureException(err);

      alert(
        err.message === "Request timeout"
          ? isCroatianLang
            ? "Slaba veza. Pokušajte ponovno."
            : "Weak connection. Please try again."
          : isCroatianLang
          ? "Greška u izvršavanju narudžbe. Pokušajte ponovo."
          : "Error submitting order. Please try again."
      );
    } finally {
      setUiValue("isSubmitting", false);
    }
  };

  return {
    handleSubmit
  };
}