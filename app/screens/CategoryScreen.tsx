import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Dimensions, ScrollView } from 'react-native';
import MealCard from '../components/MealCard';
import { Meal } from '../models/mealModel';
import MealDetails from '../components/MealDetails';
import { backendUrl } from '../../localhostConf';
import { isCroatian } from '../services/languageChecker';
import { Divider, Modal, Portal } from 'react-native-paper';
import { CenteredLoading } from '../components/CenteredLoading';
import { safeFetch } from '../services/safeFetch';

const { width, height } = Dimensions.get('screen');

const getModalHeight = (meal: Meal | null) => {
  if (!meal) return height * 0.7;
  return meal.portions[0].extras === "null" ? "22%" : "80%";
};

export default function CategoryPage({ route, navigation, scale }: { route: any, navigation: any, scale: any }) {
  const { title, titleEn } = route.params;
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isCroatianLanguage = isCroatian();

  useEffect(() => {
    safeFetch(`${backendUrl}/cjenik/${title}`)
      .then((response) => response.json())
      .then((data) => {
        setMeals(Object.entries(data).map(([key, meal]) => ({ id: key, ...(typeof meal === 'object' ? meal : {}) })));
      })
      .catch((error) => console.error('Error fetching meals:', error))
      .finally(() => setIsLoading(false));
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
        <View key={index}>
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
              margin: scale.heavy(16) 
            }
          ]}
        >
          {selectedMeal ? (
            <MealDetails
              visible={showSecondModal}
              meal={selectedMeal}
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
