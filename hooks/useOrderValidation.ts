import { useState } from "react";

import validateForm from "../app/services/validateForm";
import { isDeliveryClosed } from "../app/services/isAppClosed";
import {
  getDayOfTheWeek,
  getLocalTime,
} from "../app/services/getLocalTime";

export function useOrderValidation({
  orderData,
  isSlidRight,
  general,
  isCroatianLang,
}: any) {
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
    zone: "",
  });

  const [flags, setFlags] = useState({
    displayMessage: false,
    displaySecondMessage: false,
    displayWorkTimeMessage: false,
    displayDeliveryClosedMessage: false,
  });

  const dayOfWeek = getDayOfTheWeek(
    getLocalTime(),
    general?.holidays
  );

  const validate = () => {
    if (!general?.workTime) {
      throw new Error("Missing workTime");
    }

    if (
      isDeliveryClosed(general.workTime[dayOfWeek]) &&
      !isSlidRight
    ) {
      setFlags((prev) => ({
        ...prev,
        displayWorkTimeMessage: true,
      }));

      throw new Error("Delivery closed");
    }

    // FORM VALIDATION
    const isValid = validateForm(
      orderData,
      isSlidRight,
      orderData.totalPrice,
      setErrors,
      general?.minOrder,
      isCroatianLang
    );

    if (!isValid) {
      throw new Error("Validation failed");
    }

    return true;
  };

  return {
    errors,
    setErrors,
    flags,
    setFlags,
    validate,
  };
}