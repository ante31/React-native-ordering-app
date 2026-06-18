import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Coupon } from "../models/couponModel";
import { HelperText } from "react-native-paper";

type Props = {
  isCroatianLang: boolean;
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  useCoupon: (coupon: Coupon | null) => void;
  scale: any;
  general: any;
  orderTotalPrice: number; // Dodajemo ovo da znamo provjeriti uvjet
};

const CouponList = ({
  isCroatianLang,
  coupons,
  selectedCoupon,
  useCoupon,
  scale,
  general,
  orderTotalPrice,
}: Props) => {
  const styles = getStyles(scale);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Držimo ID kupona koji je izazvao grešku da ne vrište svi HelperText-ovi odjednom
  const [errorCouponId, setErrorCouponId] = React.useState<string | null>(null);

  useEffect(() => {
    if (selectedCoupon) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedCoupon]);

  if (!coupons || coupons.length === 0) return null;

  const handlePress = (coupon: Coupon) => {
    // Ako uklanjamo kupon
    if (selectedCoupon?.id === coupon.id) {
      useCoupon(null);
      setErrorCouponId(null);
      return;
    }

    // Provjera minimalne vrijednosti (koristimo general.minOrderValue ili tvojih 20€)
    const minVal = general?.minOrderValue || 20;
    
    if (orderTotalPrice < minVal) {
      setErrorCouponId(coupon.id);
      // Makni grešku automatski nakon 3 sekunde
      setTimeout(() => setErrorCouponId(null), 3000);
    } else {
      setErrorCouponId(null);
      useCoupon(coupon);
    }
  };

  return (
    <View>
      <Text style={styles.title}>
        {isCroatianLang ? "Kuponi" : "Available coupons"}
      </Text>
      <View style={styles.container}>
        {coupons.map((coupon) => {
          const isActive = selectedCoupon?.id === coupon.id;
          const hasError = errorCouponId === coupon.id;

          return (
            <View key={coupon.id} style={styles.wrapper}>
              <Animated.View
                style={[
                  styles.couponRow,
                  isActive && styles.activeCoupon,
                  hasError && styles.errorCoupon,
                  isActive && { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{coupon.value}€</Text>
                  {isActive && (
                    <Text style={styles.applied}>
                      {isCroatianLang ? "Kupon primijenjen" : "Coupon applied"}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, isActive && styles.removeButton]}
                  onPress={() => handlePress(coupon)}
                >
                  <Text style={styles.buttonText}>
                    {isActive
                      ? isCroatianLang ? "Ukloni" : "Remove"
                      : isCroatianLang ? "Iskoristi" : "Use"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {hasError && (<HelperText 
                type="error" 
                visible={hasError}
                style={styles.helper}
              >
                {isCroatianLang 
                  ? `Narudžba mora biti veća od ${general?.awardMinimalOrder || 20}€` 
                  : `Order must be over ${general?.awardMinimalOrder || 20}€`}
              </HelperText>)}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (scale: any) => 
  StyleSheet.create({
  container: { paddingHorizontal: 20 },
  wrapper: { marginBottom: 10 },
  title: {
    fontFamily: 'Lexend_400Regular',
    fontSize: scale.light(22),
    paddingLeft: 20,
    paddingVertical: 10,
  },
  couponRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  activeCoupon: {
    borderColor: "#4CAF50",
    backgroundColor: "#f0f9f1",
  },
  errorCoupon: {
    borderColor: "#ff5252",
  },
  value: { fontSize: 17, fontWeight: "700" },
  applied: { marginTop: 4, fontSize: 13, color: "#4CAF50", fontWeight: "600" },
  button: {
    backgroundColor: "#ffd400",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeButton: { backgroundColor: "#ff5252" },
  buttonText: { color: "#fff", fontWeight: "700" },
  helper: { marginTop: 0, marginBottom: 5 }
});

export default CouponList;