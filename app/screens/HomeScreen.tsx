import { useState, useRef,  } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
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
import { useCategories } from "../../hooks/useCategories";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useExtras } from "@/hooks/useExtras";
import CategoryCard from "../components/CategoryCard";
import { MealModal } from "../components/MealModal";

export default function HomePage({ navigation, scale, drinks={}, specials, showNetworkError, setShowNetworkError }: { navigation: any, scale: any, drinks: any, specials: any, showNetworkError: boolean, setShowNetworkError: any }) {  
  
  const CARD_MARGIN = 16;
  const { general } = useGeneral();
  const isCroatianLanguage = isCroatian();
  const extras = useExtras(setShowNetworkError);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const categories = useCategories(setShowNetworkError);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

const confettiRef = useRef<any>(null);

const triggerConfetti = () => {
  setShowRewardModal(true);
  const startValovi = () => {
    confettiRef.current?.start();
  };
  startValovi();
};

  const { currentPoints, setCurrentPoints, loyaltyBarPhone } = useLoyalty(general);

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  console.log("selected meal", selectedMeal)

  const handlePress = (title: string, titleEn: string, image: string, category: boolean, id: string) => {
    if (category) {
      navigation.navigate('CategoryPage', { title, titleEn });
      return;
    }
    else {
      const selectedMeal = specials.find((meal: any) => meal.id === id);
      if (selectedMeal) {
        handleMealClick(selectedMeal); // 👈 Pass full meal object
      } else {
        console.warn(`Meal with ID ${id} not found in specials`);
      }    
  }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {categories.length === 0 || showNetworkError ? (
        showNetworkError ? (
          <NetworkError isCroatianLanguage={isCroatianLanguage} />
        ):
        <CenteredLoading />
      ) : (
        <ScrollView
        >
          <RewardBar currentPoints={currentPoints} threshold={general?.awardThreshold || 500} onRewardPress={triggerConfetti} />
          <View
            style={{
              paddingLeft: CARD_MARGIN,
              paddingBottom: CARD_MARGIN-4,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              marginHorizontal: 'auto',
            }}
          >
            {categories
              .filter((item: Category) => item.title !== 'Info')
              .sort((a: Category, b: Category) => a.index - b.index)
              .map((item: Category, index: number) => (
                <CategoryCard 
                  key={index}
                  item={item}
                  isCroatianLanguage={isCroatianLanguage}
                  scale={scale}
                  handlePress={handlePress}
                />
              ))}
          </View>
          <Footer scale={scale} general={general} isCroatianLanguage={isCroatianLanguage}/>
        </ScrollView>
        
      )}
      <MealModal 
        visible={showMealModal} 
        meal={selectedMeal} 
        drinks={drinks} 
        scale={scale} 
        navigation={navigation}
        onClose={() => { setShowMealModal(false); setCurrentPoints(0); }} 
      />
      <RewardModal scale={scale} setCurrentPoints={setCurrentPoints} isCroatianLanguage={isCroatianLanguage} general={general} confettiRef={confettiRef} showRewardModal={showRewardModal} setShowRewardModal={setShowRewardModal} />
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { zIndex: 999, overflow: 'hidden' }
        ]} 
        pointerEvents="none"
      >
        <ConfettiManager ref={confettiRef} />
      </View>
    </View>
  );

}