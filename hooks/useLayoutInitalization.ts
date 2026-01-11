// hooks/useAppInitialization.ts
import { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { safeFetch } from '../app/services/safeFetch';
import { backendUrl } from '../localhostConf';

export const useAppInitialization = () => {
  const [specials, setSpecials] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);

  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener(n => console.log(n));
    const responseSub = Notifications.addNotificationResponseReceivedListener(r => console.log(r));

    // Dodaj : Response za tipizaciju
    safeFetch(`${backendUrl}/cjenik/Posebno`)
      .then((res: Response) => res.json())
      .then((data: any) => setSpecials(Object.entries(data).map(([key, val]) => ({ id: key, ...(val as object) }))))
      .catch((err: any) => console.error('Specials error:', err));

    safeFetch(`${backendUrl}/cjenik/Piće`)
      .then((res: Response) => res.json())
      .then(setDrinks)
      .catch((err: any) => console.error('Drinks error:', err));

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  return { specials, drinks };
};