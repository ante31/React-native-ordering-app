import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import MealCard from '../components/MealCard';
import MealDetails from '../components/MealDetails';
import { isCroatian } from '../services/languageChecker';
import { Divider, Modal, Portal } from 'react-native-paper';
import { CenteredLoading } from '../components/CenteredLoading';
import { getModalHeight } from '../services/getModalHeight';
import { Meal } from '../models/mealModel';
import { useCategoryMeals } from '../../hooks/useCategoryMeals';


export default function CategoryPage({ route, navigation, scale }: { route: any; navigation: any; scale: any }) {
  const { title, titleEn } = route.params;
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const isCroatianLanguage = isCroatian();

  const { meals, isLoading, selectedMealRef } = useCategoryMeals(title);

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowSecondModal(true);
    selectedMealRef.current = meal;
  };

  return (
    <View style={[styles.container, { paddingLeft: scale.light(16) }]}>
      <Text style={[styles.title, { fontSize: scale.light(24) }]}>{isCroatianLanguage ? title : titleEn}</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {
          isLoading ? <CenteredLoading /> :
          meals.length > 0 ? 
          meals
          .sort((a, b) => b.popularity - a.popularity)
          .map((meal, index) => (
            <View key={meal.id}>
              <Divider />
              <TouchableOpacity onPress={() => handleMealClick(meal)} activeOpacity={0.7}>
                <MealCard item={meal} scale={scale} />
              </TouchableOpacity>
            </View>
          )) :
          <Text>Nema dostupnih jela</Text>
        }
      </ScrollView>

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
            <View >
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
