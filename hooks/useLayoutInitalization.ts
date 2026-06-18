// hooks/useAppInitialization.ts
import { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { safeFetch } from '../app/services/safeFetch';
import { backendUrl } from '../localhostConf';

export const useAppInitialization = (setShowNetworkError: (val: boolean) => void) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener(n => console.log(n));
    const responseSub = Notifications.addNotificationResponseReceivedListener(r => console.log(r));

    safeFetch(`${backendUrl}/cjenik`)
      .then((res: Response) => res.json())
      .then(setMenu)
      .catch((err: any) => console.error('Menu error:', err));

    safeFetch(`${backendUrl}/kategorije`)
      .then(res => res.json())
      .then(data => {
        const list = Object.keys(data).map(key => ({
          title: key.split('|')[0],
          titleEn: key.split('|')[1],
          ...data[key]
        }));
        setCategories(list);
      })
      .catch(() => setShowNetworkError(true));
    

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  return { menu, categories };
};