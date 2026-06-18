import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { safeFetch } from "../app/services/safeFetch";
import { backendUrl } from "../localhostConf";
import { Meal } from '../app/models/mealModel';

export const useCategoryMeals = (menu: any, title: string) => {
  const mapData = (data: any) => 
    Object.entries(data).map(([key, obj]: [string, any]) => ({
      id: key,
      ime: obj.ime || '',
      ime_en: obj.ime_en || '',
      opis: obj.opis || '',
      opis_en: obj.opis_en || '',
      popularity: obj.popularity || 0,
      image: obj.image || '',
      portions: obj.portions || [],
      saucesList: obj.saucesList || false,
    }));

  const [meals, setMeals] = useState<Meal[]>(menu[title] ? mapData(menu[title]) : []);
  const [isLoading, setIsLoading] = useState(true);
  const selectedMealRef = useRef<Meal | null>(null);

  useEffect(() => {
    console.log("Fetching meals for category:", meals);
  }, [meals]);

  useEffect(() => {
    const socket = io(backendUrl, { transports: ['websocket'] });
    socket.on(`cjenik-update-${title}`, (data: any) => {
      const updated = mapData(data);
      setMeals(updated);
      
      // Live update za otvoreni modal
      if (selectedMealRef.current) {
        const found = updated.find(m => m.id === selectedMealRef.current?.id);
        if (found) selectedMealRef.current = found;
      }
    });

    return () => { socket.disconnect(); };
  }, [title]);

  return { meals, isLoading, selectedMealRef };
};