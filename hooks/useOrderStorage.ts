import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { StorageModel } from "../app/models/storageModel";

export function useOrderStorage() {
  const [lastOrder, setLastOrder] = useState<StorageModel | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const storedKeys = await SecureStore.getItemAsync("order_keys");
        const keys = storedKeys ? JSON.parse(storedKeys) : [];

        if (!keys.length) return;

        const lastKey = keys[keys.length - 1];
        const last = await SecureStore.getItemAsync(lastKey);

        if (last) {
          setLastOrder({ id: lastKey, ...JSON.parse(last) });
        }
      } catch (e) {
        console.error("OrderStorage error:", e);
      }
    };

    load();
  }, []);

  return { lastOrder };
}
