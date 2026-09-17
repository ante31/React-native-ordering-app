import { useCart } from "../app/cartContext";
import { usePushNotifications } from "../app/services/usePushNotifications";
import { useGeneral } from "../app/generalContext";
import { isCroatian } from "../app/services/languageChecker";
import { checkTimeValidity } from "../app/services/checkTimeValidity";
import { useEffect, useMemo, useState } from "react";
import { useCoupons } from "./useCoupons";
import { useOrderSubmit } from "./useOrderSubmit";
import { useOrderStorage } from "./useOrderStorage";

export default function useOrdersHook({
  cartState,
  storageOrder,
  isDelivery,
  navigation,
}: {
  cartState: any;
  storageOrder: any;
  isDelivery: boolean;
  navigation: any;
}) {
  const { expoPushToken } = usePushNotifications();

  const { dispatch } = useCart();

  const { general } = useGeneral();

  const isCroatianLang = isCroatian();

  // -----------------------------
  // LAST ORDER
  // -----------------------------
  const { lastOrder } = useOrderStorage();

  // -----------------------------
  // INITIAL VALUES
  // -----------------------------
  const initialOrderData = useMemo(
    () => ({
      name:
        storageOrder?.name ||
        lastOrder?.name ||
        "",

      phone:
        storageOrder?.phone ||
        lastOrder?.phone ||
        "",

      address:
        storageOrder?.address ||
        lastOrder?.address ||
        "",

      zone:
        storageOrder?.zone ||
        lastOrder?.zone ||
        "",

      note:
        storageOrder?.note ||
        lastOrder?.note ||
        "",
    }),
    [storageOrder, lastOrder]
  );

  // -----------------------------
  // FORM STATE
  // -----------------------------
  const [orderData, setOrderData] =
    useState(initialOrderData);

  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      ...initialOrderData,
    }));
  }, [initialOrderData]);

  const [errors, setErrors] =
    useState({
      name: "",
      phone: "",
      address: "",
      zone: "",
    });

  const [saveData, setSaveData] =
    useState(false);

  // isSlidRight = true znači Preuzimanje, false znači Dostava
  // isDelivery=true → isSlidRight=false, isDelivery=false → isSlidRight=true
  const [isSlidRight, setIsSlidRight] =
    useState(!isDelivery);

  const [
    selectedDeliveryOption,
    setSelectedDeliveryOption,
  ] = useState<
    "standard" | "custom"
  >("standard");

  const [timeString, setTimeString] =
    useState("null");

  // -----------------------------
  // UI
  // -----------------------------
  const [ui, setUi] = useState({
    showPicker: false,

    isSubmitting: false,

    displayMessage: false,

    displaySecondMessage: false,

    displayWorkTimeMessage: false,

    displayDeliveryClosedMessage: false,
  });

  const setUiValue = (
    key: keyof typeof ui,
    value: boolean
  ) => {
    setUi(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // -----------------------------
  // COUPONS
  // -----------------------------

  const {
    coupons,
    selectedCoupon,
    useCoupon,
    revokeCoupon,
  } = useCoupons();

  // -----------------------------
  // DERIVED VALUES
  // -----------------------------

  const orderPrice =
    cartState.items.reduce(
      (sum: number, item: any) =>
        sum +
        item.quantity * item.price,
      0
    );

  const totalPrice =
    orderPrice +
    (!isSlidRight
      ? general?.deliveryPrice || 0
      : 0);

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    if (
      timeString !==
        "undefined:undefined" &&
      timeString !== "null"
    ) {
      checkTimeValidity(
        {
          hours: Number(
            timeString.split(":")[0]
          ),

          minutes: Number(
            timeString.split(":")[1]
          ),
        },

        setTimeString,

        (v: boolean) =>
          setUiValue(
            "displayMessage",
            v
          ),

        (v: boolean) =>
          setUiValue(
            "displayWorkTimeMessage",
            v
          ),

        (v: boolean) =>
          setUiValue(
            "showPicker",
            v
          ),

        isSlidRight,

        general
      );
    }
  }, [
    timeString,
    isSlidRight,
    general,
  ]);

  useEffect(() => {
    setOrderData(prev => ({
      ...prev,

      isDelivery: !isSlidRight,
    }));
  }, [isSlidRight]);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const {
    handleSubmit
  } = useOrderSubmit({
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
  });


  return {
    orderData,
    setOrderData,

    errors,
    setErrors,

    saveData,
    setSaveData,

    coupons,

    selectedCoupon,

    useCoupon,

    isSlidRight,
    setIsSlidRight,

    selectedDeliveryOption,
    setSelectedDeliveryOption,

    timeString,
    setTimeString,

    ui,
    setUiValue,

    orderPrice,
    totalPrice,

    handleSubmit,
    isCroatianLang,
  };
}