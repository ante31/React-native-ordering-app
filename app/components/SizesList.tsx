import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { RadioButton, Divider } from 'react-native-paper';
import * as Haptics from "expo-haptics"
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const SizeList = ({ meal, selectedSize, extras, setSelectedSize, selectedPortionIndex, setSelectedPortionIndex, selectedExtras, setSelectedExtras, setPrice, setPriceSum, quantity, setIsUpdating, isCroatianLang, scale }: any) => {
    const {general} = useGeneral();
    const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  
  useEffect(() => {
    const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);


    setPrice(meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice);

    setPriceSum(quantity * (meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice));
    setIsUpdating(false)
  }, [selectedExtras, quantity]);

  const toggleSize = (size: string, value: number, index: number) => {
    setIsUpdating(true)
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedSize(size);
    setSelectedPortionIndex(index);

    console.log("Toggling size", size, value, index);
    console.log("Extras", extras);
    console.log("Selected extras", selectedExtras);
    if (Object.keys(extras).length > 0) {
      setIsUpdating(true);
      const updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
        const newValue = parseFloat(extras[key] as string || '0');
        
        if (newValue > 0 || selectedExtras[key] === 0 || selectedExtras[key] === 0.2) {
          acc[key] = selectedExtras[key]; 
        }
        
        return acc;
      }, {});
  
      console.log("Updated selected extras", updatedSelectedExtras);
    }
  };
  return (
    <View style={styles.sizeContainer}>
      <Text style={[styles.sizeTitle, { fontSize: scale.light(14) }]}>{isCroatianLang? 'Odaberite veličinu': 'Select size'}</Text>
      <Divider style={[styles.divider, { marginBottom: scale.light(5) }]} />
      {(meal.portions ? meal.portions : meal.portionsOptions).map((portion: any, index: number) => {
        return (
          <TouchableOpacity key={index} style={[styles.radioButtonContainer, { paddingHorizontal: scale.light(10) }]}
            onPress={() => toggleSize(isCroatianLang ? portion.size : portion.size_en, portion.price, index)}
            disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}            
          >
            <View style={[styles.radioButtonTextContainer, scale.isTablet() && { marginVertical: 6 }]}>
              <View style={scale.isTablet() ? { transform: [{ scale: 2.2 }], marginHorizontal: 20 } : {}}>
                <RadioButton
                  value={isCroatianLang? portion.size : portion.size_en}
                  status={selectedSize === portion.size || selectedSize === portion.size_en ? 'checked' : 'unchecked'}
                  onPress={() => toggleSize(isCroatianLang? portion.size : portion.size_en, portion.price, index)}
                  color="#ffe521"
                  disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
                
                />
              </View>
              <Text style={[styles.sizeText, { fontSize: scale.light(14) }]} >
                {isCroatianLang? portion.size : portion.size_en}
              </Text>
            </View>
            {meal.portions? 
              portion.price - meal.portions[0].price ? <Text style={[styles.sizePrice, { fontSize: scale.light(12) }]}>+{(portion.price - meal.portions[0].price).toFixed(2)} €</Text>: <></>:
              portion.price - meal.portionsOptions[0].price ? <Text style={[styles.sizePrice, { fontSize: scale.light(12) }]}>+{(portion.price - meal.portionsOptions[0].price).toFixed(2)} €</Text>: <></>
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sizeContainer: { width: "100%", paddingBottom: 0 },
  radioButtonTextContainer: { flexDirection: "row", alignItems: "center" },
  radioButtonContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between" },
  sizeText: { marginLeft: 10, fontFamily: "Lexend_700Bold" },
  sizePrice: { color: "#DA291C", marginLeft: 1, fontFamily: "Lexend_700Bold" },
  sizeTitle: {
    fontFamily: "Lexend_700Bold",    
    color: "#DA291C",
    marginBottom: 10,
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
});

export default SizeList;
