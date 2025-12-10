import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Dimensions, ScrollView, PixelRatio, Platform } from 'react-native';
import MealCard from '../components/MealCard';
import MealDetails from '../components/MealDetails';
import { backendUrl } from '../../localhostConf';
import { isCroatian } from '../services/languageChecker';
import { Divider, Modal, Portal } from 'react-native-paper';
import { CenteredLoading } from '../components/CenteredLoading';
import { safeFetch } from '../services/safeFetch';
import { io } from 'socket.io-client';

const { height } = Dimensions.get('screen');
const fontScale = PixelRatio.getFontScale();
const isAndroid = Platform.OS === 'android';

const getModalHeight = (meal: Meal | null) => {
  if (!meal) return height * 0.7; // edge case koji se nece dogodit
  const isLargeFont = fontScale > 1.8;
  const isMediumLargeFont = fontScale > 1.6;
  const isMediumFont = fontScale > 1.4;
  const isSmallFont = fontScale > 1.2;

  return meal.portions?.[0]?.extras === "null" // prilozi i sokovi (nemaju dodadnih priloga pa ce im modal height bit mal)
    ? (
        isLargeFont ? (isAndroid ? "31%" : 300) :
        isMediumLargeFont ? (isAndroid ? "28%" : 280) :
        isMediumFont ? (isAndroid ? "26%" : 250) :
        isSmallFont ? (isAndroid ? "24%" : 230) :
        (isAndroid ? "25%" : 200)
      )
    : meal.portions?.[0]?.extras === "listaPomfrit"
    ? "45%" // pomfrit ima malu listu priloga
    : "80%"; // najcesci case

};

type Meal = {
  id: string;
  ime: string;
  ime_en: string;
  opis: string;
  opis_en: string;
  popularity: number;
  image: string;
  portions: any[];
  saucesList?: boolean;
  // dodaj ako imaš još polja
};
function mapFirebaseMealToMeal(key: string, mealObj: any): Meal {
  return {
    id: key,
    ime: mealObj.ime || '',
    ime_en: mealObj.ime_en || '',
    opis: mealObj.opis || '',
    opis_en: mealObj.opis_en || '',
    popularity: mealObj.popularity || 0,
    image: mealObj.image || '',
    portions: mealObj.portions || [],
    saucesList: mealObj.saucesList || false,
  };
}

export default function CategoryPage({ route, navigation, scale }: { route: any; navigation: any; scale: any }) {
  const { title, titleEn } = route.params;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isCroatianLanguage = isCroatian();

  // Ref za praćenje trenutno otvorenog jela (da možemo update-ati iz socketa)
  const selectedMealRef = useRef<Meal | null>(null);

  useEffect(() => {
    selectedMealRef.current = selectedMeal;
  }, [selectedMeal]);

  useEffect(() => {
    let socket: any;

    // Initial fetch
    safeFetch(`${backendUrl}/cjenik/${title}`)
      .then((response) => response.json())
      .then((data) => {
        const mappedMeals = Object.entries(data).map(([key, mealObj]) => mapFirebaseMealToMeal(key, mealObj));
        setMeals(mappedMeals);
      })
      .catch((error) => console.error('Error fetching meals:', error))
      .finally(() => setIsLoading(false));

    // Setup socket
    socket = io(backendUrl, { transports: ['websocket'] });

    socket.on(`cjenik-update-${title}`, (data: any) => {
      console.log(`📥 [Socket] Update for ${title}:`, data);
      const updatedMeals = Object.entries(data).map(([key, mealObj]) => mapFirebaseMealToMeal(key, mealObj));
      setMeals(updatedMeals);

      // Ako je modal otvoren i imamo selektirano jelo, update-aj ga iz nove liste
      if (selectedMealRef.current) {
        const updatedSelected = updatedMeals.find(m => m.id === selectedMealRef.current!.id);
        if (updatedSelected) {
          setSelectedMeal(updatedSelected);
        }
      }
    });

    return () => {
      socket?.disconnect();
    };
  }, [title]);

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowSecondModal(true);
  };

  let content;
  if (isLoading) {
    content = <CenteredLoading />;
  } else if (meals.length > 0) {
    content = meals
      .sort((a, b) => b.popularity - a.popularity)
      .map((meal, index) => (
        <View key={meal.id}>
          <Divider />
          <TouchableOpacity onPress={() => handleMealClick(meal)} activeOpacity={0.7}>
            <MealCard item={meal} scale={scale} />
          </TouchableOpacity>
        </View>
      ));
  } else {
    content = <Text>Nedostupno</Text>;
  }

  return (
    <View style={[styles.container, { paddingLeft: scale.light(16) }]}>
      <Text style={[styles.title, { fontSize: scale.light(24) }]}>{isCroatianLanguage ? title : titleEn}</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>{content}</ScrollView>

      <Portal>
        <Modal
          visible={showSecondModal}
          onDismiss={() => setShowSecondModal(false)}
          contentContainerStyle={[
            styles.modalContainer,
            {
              minHeight: getModalHeight(selectedMeal),
              margin: scale.heavy(16),
            },
          ]}
        >
          {selectedMeal ? (
            <MealDetails
              visible={showSecondModal}
              globalMeal={selectedMeal}
              scale={scale}
              onClose={() => setShowSecondModal(false)}
              navigation={navigation}
            />
          ) : (
            <View style={styles.loaderContainer}>
              <CenteredLoading />
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}



const styles = StyleSheet.create({
  modalContainer: {
    
    backgroundColor: 'white',
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontFamily: 'Lexend_700Bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
