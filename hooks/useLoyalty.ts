// hooks/useLoyalty.ts
import { useState, useEffect, useRef } from "react";
import { LoyaltyCheck } from "../app/services/loyaltyCheck";
import { backendUrl } from "../localhostConf";
import { useLoyaltyBarPhone } from "./useLoyaltyBarPhone";
import { Animated, Dimensions } from "react-native";

const PARTICLE_COUNT = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useLoyalty = (general: any) => {
  const [currentPoints, setCurrentPoints] = useState(0);

  const loyaltyBarPhone = useLoyaltyBarPhone();


const rewardBarAnim = useRef(new Animated.Value(0)).current;

  // Niz animiranih vrijednosti za svaku česticu (X, Y, Opacity)
  const particleAnims = useRef(
    [...Array(PARTICLE_COUNT)].map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Lokacija kamo čestice trebaju sletjeti (centar Reward Bara)
  // Ovo ćemo trebati prilagoditi ovisno o tvom layoutu!
  const targetX = SCREEN_WIDTH / 2; // Sredina ekrana
  const targetY = 150; // Pretpostavljena visina Reward Bara od vrha

  // --- 2. Implementacija startRewardAnimation funkcije ---


  useEffect(() => {
    const loadPoints = async () => {
      if (!loyaltyBarPhone) return;

      const points = await LoyaltyCheck({
        backendUrl,
        general,
        loyaltyBarPhone,
      });

      console.log("Loyalty points loaded:", points);

      setCurrentPoints(points ?? 0);
    };

    loadPoints();
  }, [loyaltyBarPhone, general]);

  const createCoupon = async (phoneNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`${backendUrl}/loyalty/${phoneNumber}/create-coupon`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Backend error:", data);
        return false; // Javi da nije uspjelo
      }

      console.log("Coupon created successfully");
      return true; // Javi uspjeh
    } catch (error) {
      console.error("Error creating coupon:", error);
      return false;
    }
  };

  return { currentPoints, setCurrentPoints, createCoupon, loyaltyBarPhone };
};
