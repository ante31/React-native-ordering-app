import { useState, useEffect } from "react";
import { safeFetch } from "../app/services/safeFetch";
import { backendUrl } from "../localhostConf";

export const useExtras = (setShowNetworkError: (val: boolean) => void) => {
  const [extras, setExtras] = useState<any>({});

  useEffect(() => {
    safeFetch(`${backendUrl}/extras`)
      .then((response: Response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setExtras(data))
      .catch(error => {
        setShowNetworkError(true);
        console.log('Greška pri dohvaćanju priloga:', error);
      });
  }, []);

  return extras;
};