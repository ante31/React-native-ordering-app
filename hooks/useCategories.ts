import { useState, useEffect } from "react";
import { backendUrl } from "../localhostConf";
import { safeFetch } from "../app/services/safeFetch";

export const useCategories = (setShowNetworkError: any) => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
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
  }, []);

  return categories;
};