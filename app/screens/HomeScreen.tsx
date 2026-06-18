import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { ScrollView, View, StyleSheet, Alert, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Category } from "../models/categoryModel";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "../components/CenteredLoading";
import { useGeneral } from "../generalContext";
import Footer from "../components/Footer";
import { Meal } from "../models/mealModel";
import NetworkError from "../components/NetworkError";
import RewardBar from "../components/RewardBar";
import { ConfettiManager } from "../components/Confetti";
import RewardModal from "../components/RewardModal";
import { useLoyalty } from "@/hooks/useLoyalty";
import CategoryCard from "../components/CategoryCard";
import { MealModal } from "../components/MealModal";

export default function HomePage({
  navigation,
  scale,
  menu,
  categories,
  showNetworkError,
}: {
  navigation: any;
  scale: any;
  menu: any;
  categories: Category[];
  showNetworkError: boolean;
}) {
  const route = useRoute();
  const nav = useNavigation() as any;
  
  const params = route.params as { orderCompleted?: boolean; pointsAdded?: number };
  const isOrderCompleted = params?.orderCompleted;

  const { general } = useGeneral();
  const isCroatianLanguage = isCroatian();

  const [showMealModal, setShowMealModal] = useState(false);
  const selectedMealRef = useRef<Meal | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const confettiRef = useRef<any>(null);

  const [shakeTrigger, setShakeTrigger] = useState(0);

  const { currentPoints, setCurrentPoints, createCoupon, loyaltyBarPhone } = useLoyalty(general);

// DETEKCIJA NARUDŽBE
  useEffect(() => {
    if (isOrderCompleted) {
      // Čekamo 1 sekundu da se UI smiri i korisnik fokusira
      const timer = setTimeout(() => {
        console.log("Order completed detected, triggering confetti and reward modal.");
        setShakeTrigger(prev => prev + 1);
        
        // Resetiramo parametre tek NAKON što je animacija okinuta
        nav.setParams({ orderCompleted: undefined, pointsAdded: undefined });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOrderCompleted]);

  const sortedCategories = useMemo(() => {
    return categories
      .filter((item: Category) => item.title !== "Info")
      .sort((a: Category, b: Category) => a.index - b.index);
  }, [categories]);

  // FUNKCIJE
  const triggerConfetti = useCallback(async () => {
    // Ovdje možeš dodati mali isSubmitting state da spriječiš spam klika
    const success = await createCoupon(loyaltyBarPhone);

    if (success) {
      setShowRewardModal(true);
      confettiRef.current?.start();
    } else {
      // Opcionalno: Obavijesti korisnika da nešto nije u redu
      Alert.alert(isCroatianLanguage ? "Nismo uspjeli kreirati kupon. Pokušajte ponovno." : "We couldn't create the coupon. Please try again.");
    }
  }, [loyaltyBarPhone, createCoupon]);

  const handlePress = useCallback(
    (title: string, titleEn: string, image: string, category: boolean, id: string) => {
      if (category) {
        navigation.navigate("CategoryPage", { title, titleEn });
        return;
      }
      const mealData = (menu as any)["Posebno"]?.[id];
      const meal = mealData ? { id, ...mealData } : null;
      if (!meal) return;
      selectedMealRef.current = meal;
      setShowMealModal(true);
    },
    [menu, navigation]
  );

  if (categories.length === 0 || showNetworkError) {
    return showNetworkError ? (
      <NetworkError isCroatianLanguage={isCroatianLanguage} />
    ) : (
      <CenteredLoading />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <RewardBar
          currentPoints={currentPoints}
          threshold={general?.awardThreshold || 300}
          onRewardPress={triggerConfetti}
          shakeTrigger={shakeTrigger}
        /> */}

        <View style={styles.categoriesWrapper}>
          {sortedCategories.map((item: Category) => (
            <CategoryCard
              key={item.title}
              item={item}
              isCroatianLanguage={isCroatianLanguage}
              scale={scale}
              handlePress={handlePress}
            />
          ))}
        </View>

        <Footer scale={scale} general={general} isCroatianLanguage={isCroatianLanguage} />
      </ScrollView>

      {/* MODALI */}
      <MealModal
        visible={showMealModal}
        isCroatianLang={isCroatianLanguage}
        meal={selectedMealRef.current}
        menu={menu}
        scale={scale}
        navigation={navigation}
        onClose={() => setShowMealModal(false)}
      />

      <RewardModal
        scale={scale}
        setCurrentPoints={setCurrentPoints}
        isCroatianLanguage={isCroatianLanguage}
        general={general}
        confettiRef={confettiRef}
        showRewardModal={showRewardModal}
        setShowRewardModal={setShowRewardModal}
      />

      <View style={styles.confettiOverlay} pointerEvents="none">
        <ConfettiManager ref={confettiRef} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  categoriesWrapper: {
    paddingLeft: 16,
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: "hidden"
  }
});