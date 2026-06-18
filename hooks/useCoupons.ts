import { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../localhostConf";
import { Coupon } from "../app/models/couponModel";
import { getLocalTimeString } from "../app/services/getLocalTime";
import { useLoyaltyBarPhone } from '@/hooks/useLoyaltyBarPhone';

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const phone = useLoyaltyBarPhone();

  useEffect(() => {
    if (!phone) return;

    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${backendUrl}/loyalty/${phone}/coupons`);
        if (!res.ok) return;
        const data = await res.json();
        setCoupons(data);
      } catch (e) {
        console.error("Coupons error:", e);
      }
    };

    fetchCoupons();
  }, [phone]);

  const useCoupon = useCallback((coupon: Coupon | null) => {
    console.log("Using coupon:", coupon);
    setSelectedCoupon(coupon);
  }, []);

  const revokeCoupon = async (couponId: string) => {
    try {
      await fetch(
        `${backendUrl}/loyalty/${phone}/coupons/${couponId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isUsed: true,
            usedAt: getLocalTimeString(),
          }),
        }
      );
    } catch (e) {
      console.error("revokeCoupon error:", e);
    }
  };

  return {
    coupons,
    selectedCoupon,
    useCoupon,
    revokeCoupon,
  };
}