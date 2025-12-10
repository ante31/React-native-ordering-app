import React, { useEffect, useState } from "react";
import { backendUrl } from "../../localhostConf";
import { ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Card, Portal, Modal } from 'react-native-paper';
import { Category } from "../models/categoryModel";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "../components/CenteredLoading";
import { useGeneral } from "../generalContext";
import { Image, Platform } from 'react-native';
import Footer from "../components/Footer";
import { Meal } from "../models/mealModel";
import MealDetails from '../components/MealDetails';
import { isTablet } from "../services/isTablet";
import NetworkError from "../components/NetworkError";
import { safeFetch } from "../services/safeFetch";
import { io } from 'socket.io-client';

const { width, height } = Dimensions.get('screen');
const socket = io(backendUrl, { transports: ['websocket'] });

export default function HomePage({ navigation, scale, drinks={}, specials, showNetworkError, setShowNetworkError }: { navigation: any, scale: any, drinks: any, specials: any, showNetworkError: boolean, setShowNetworkError: any }) {
  const [data, setData] = useState<any>(null);
  
  
  const CARD_MARGIN = 16;
  const SPECIAL_OFFER_POSITION = -5;
  const SPECIAL_OFFER_TABLET_POSITION = -8;
  const SPECIAL_OFFER_TABLET_SIZE = 170;
  const SPECIAL_OFFER_SIZE = 110;
  const { general } = useGeneral();
  const isCroatianLanguage = isCroatian();
  const [extras, setExtras] = useState<any>({});
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMealModal, setShowMealModal] = useState(false);

  const getModalHeight = (meal: Meal | null) => {
    if (!meal) return height * 0.7;
    return meal.portions[0].extras === "null" ? "20%" : "80%";
  };

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

  useEffect(() => {
    safeFetch(`${backendUrl}/kategorije`)
      .then(response => response.json())
      .then(data => {
        const categoryList = Object.keys(data).map(key => {
          const fullTitle = key.split('|');
          return {
            title: fullTitle[0],       
            titleEn: fullTitle[1],     
            image: data[key].image,    
            index: data[key].index,
            category: data[key].category  ,
            id: data[key].id,
            specialOffer: data[key].specialOffer
          };
        });

        setCategories(categoryList);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
  safeFetch(`${backendUrl}/extras`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setExtras(data);
    })
    .catch(error => {
      setShowNetworkError(true);
      console.log('Greška pri dohvaćanju priloga:', error);
    });
}, []);


  console.log("Zašto ", isTablet())



  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {categories.length === 0 || showNetworkError ? (
        showNetworkError ? (
          <NetworkError isCroatianLanguage={isCroatianLanguage} />
        ):
        <CenteredLoading />
      ) : (
        <ScrollView
          contentContainerStyle={{

          }}
        >
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
              .filter(item => item.title !== 'Info')
              .sort((a, b) => a.index - b.index)
              .map((item, index) => (
                <View
                  key={index}
                  style={{
                    width: item.title === 'Pizza' || item.title === 'Meso' ? '100%' : '50%',
                    paddingRight: CARD_MARGIN,
                    paddingTop: CARD_MARGIN,
                  }}
                >
                  <View style={{ flex: 1, minHeight: 200 }}>
                    {item.specialOffer && (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() =>
                          handlePress(
                            item.title,
                            item.titleEn,
                            item.image,
                            item.category,
                            item.id
                          )
                        }
                        style={{
                          opacity: 1,
                          position: 'absolute',
                          top: isTablet()
                            ? SPECIAL_OFFER_TABLET_POSITION
                            : SPECIAL_OFFER_POSITION,
                          right: isTablet()
                            ? SPECIAL_OFFER_TABLET_POSITION
                            : SPECIAL_OFFER_POSITION,
                          zIndex: 1,
                        }}
                      >
                        <Image
                          source={isCroatianLanguage ? require('../../assets/images/posebna ponuda-cro.png') : require('../../assets/images/posebna ponuda-eng.png')}
                          style={{
                            width: isTablet()
                              ? SPECIAL_OFFER_TABLET_SIZE
                              : SPECIAL_OFFER_SIZE,
                            height: isTablet()
                              ? SPECIAL_OFFER_TABLET_SIZE
                              : SPECIAL_OFFER_SIZE,
                            resizeMode: 'cover',
                            borderRadius: 10,
                          }}
                        />
                      </TouchableOpacity>
                    )}

                    <Card
                      onPress={() =>
                        handlePress(
                          item.title,
                          item.titleEn,
                          item.image,
                          item.category,
                          item.id
                        )
                      }
                      style={{
                        flex: 1, 
                        ...(Platform.OS === 'ios' && {
                          overflow: 'hidden',
                        }),
                      }}
                    >
                      <Card.Cover
                        source={{ uri: item.image }}
                        style={{
                          backgroundColor: 'white',
                          width: '100%',
                          // Postavite visinu koju ste imali u iOS kodu
                          height: scale.isTablet() ? 400 : 200, 
                          borderRadius: 10,
                        }}
                        // Card.Cover automatski koristi resizeMode: 'cover', ali možemo ga eksplicitno definirati
                      />

                      <Card.Content
                        style={{
                          flexGrow: 1,
                          justifyContent: 'flex-end', // Naslov ide dolje
                        }}
                      >
                        <Text
                          style={{
                            color: 'black',
                            fontSize: scale.light(19),
                            paddingTop: 16,
                            fontFamily: 'Lexend_700Bold',
                          }}
                        >
                          {isCroatianLanguage ? item.title : item.titleEn}
                        </Text>
                      </Card.Content>
                    </Card>
                  </View>
                </View>
              ))}
          </View>

          <Footer scale={scale} general={general} isCroatianLanguage={isCroatianLanguage}/>

        </ScrollView>
        
      )}
      <Portal>
        <Modal
          visible={showMealModal}
          onDismiss={() => setShowMealModal(false)}
          contentContainerStyle={[styles.modalContainer, { height: getModalHeight(selectedMeal), margin: scale.heavy(16) }]}
        >
          {selectedMeal ? (
            <MealDetails
              visible={showMealModal}
              globalMeal={selectedMeal}
              drinks={drinks}
              scale={scale}
              onClose={() => setShowMealModal(false)}
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
    height: height * 0.7,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
