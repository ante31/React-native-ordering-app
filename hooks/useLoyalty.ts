// hooks/useLoyalty.ts
import { useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import { LoyaltyCheck } from "../app/services/loyaltyCheck";
import { backendUrl } from "../localhostConf";

export const useLoyalty = (general: any) => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loyaltyBarPhone, setLoyaltyBarPhone] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const storedKeys = await SecureStore.getItemAsync('order_keys');
      const keys = storedKeys ? JSON.parse(storedKeys) : [];
      if (keys.length === 0) return;

      const phoneCounts: Record<string, number> = {};
      for (const key of keys.slice(-10)) {
        const rawOrder = await SecureStore.getItemAsync(key);
        if (rawOrder) {
          const order = JSON.parse(rawOrder);
          if (order.phone) phoneCounts[order.phone] = (phoneCounts[order.phone] || 0) + 1;
        }
      }

      const mostFrequent = Object.keys(phoneCounts).reduce((a, b) => phoneCounts[a] > phoneCounts[b] ? a : b, "");
      
      if (mostFrequent) {
        setLoyaltyBarPhone(mostFrequent);
        const points = await LoyaltyCheck({ backendUrl, general, loyaltyBarPhone: mostFrequent });
        setCurrentPoints(points ?? 0);
      }
    };
    loadOrders();
  }, [general]);

  return { currentPoints, setCurrentPoints, loyaltyBarPhone };
};