// hooks/useLoyaltyPhone.ts
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const useLoyaltyBarPhone = () => {
  const [loyaltyBarPhone, setLoyaltyBarPhone] = useState("");

  useEffect(() => {
    const loadPhone = async () => {
      const storedKeys = await SecureStore.getItemAsync("order_keys");
      const keys = storedKeys ? JSON.parse(storedKeys) : [];
      if (keys.length === 0) return;

      const phoneCounts: Record<string, number> = {};

      for (const key of keys.slice(-10)) {
        const rawOrder = await SecureStore.getItemAsync(key);
        if (rawOrder) {
          const order = JSON.parse(rawOrder);
          if (order.phone) {
            phoneCounts[order.phone] = (phoneCounts[order.phone] || 0) + 1;
          }
        }
      }

      const mostFrequent = Object.keys(phoneCounts).reduce(
        (a, b) => (phoneCounts[a] > phoneCounts[b] ? a : b),
        ""
      );

      setLoyaltyBarPhone(mostFrequent);
    };

    loadPhone();
  }, []);

  return loyaltyBarPhone;
};