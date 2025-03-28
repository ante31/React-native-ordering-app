import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RadioButton, Divider } from 'react-native-paper';
import * as Haptics from "expo-haptics"
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const SizeList = ({ meal, selectedSize, extras, setSelectedSize, selectedPortionIndex, setSelectedPortionIndex, selectedExtras, setSelectedExtras, setPrice, setPriceSum, quantity, setIsUpdating, isCroatianLang }: any) => {
    const {general} = useGeneral();
    const dayofWeek = getDayOfTheWeek(getLocalTime());
  
  useEffect(() => {
    if (Object.keys(extras).length > 0) {
      // Recalculate the selectedExtras from the extras object
      const updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
        const newValue = parseFloat(extras[key] as string || '0');
        
        if (newValue > 0 || selectedExtras[key] === 0 || selectedExtras[key] === 0.2) {
          acc[key] = selectedExtras[key]; // Use the original value from selectedExtras
        }
        
        return acc;
      }, {});
  
      // Set the updated selectedExtras
      setSelectedExtras(updatedSelectedExtras);
    }
  }, [extras, setSelectedExtras]); // Add selectedExtras as a dependency
  

  // This useEffect will calculate the total price whenever selectedExtras or quantity changes
  useEffect(() => {
     
      // Calculate the total extras price based on the selectedExtras format
      const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);

    //console.log("Extras price", extrasPrice);

    // Update the price with the new size and extras
    setPrice(meal.portions[selectedPortionIndex].price + extrasPrice);

    // Update the total price sum based on quantity
    setPriceSum(quantity * (meal.portions[selectedPortionIndex].price + extrasPrice));
    setIsUpdating(false)
  }, [selectedExtras, quantity, setPrice, setPriceSum]);

  // This function is called when a size is selected
  const toggleSize = (size: string, value: number, index: number) => {
    // Update the selected size and the selected portion index
    setIsUpdating(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSize(size);
    setSelectedPortionIndex(index);
  };
  return (
    <View style={styles.sizeContainer}>
      <Text style={styles.sizeTitle}>{isCroatianLang? 'Odaberi veličinu': 'Select size'}</Text>
      <Divider style={styles.divider} />
      {meal.portions.map((portion: any, index: number) => {
        return (
          <TouchableOpacity key={index} style={styles.radioButtonContainer}
            onPress={() => toggleSize(isCroatianLang? portion.size : portion.size_en, portion.price, index)}
            disabled={appButtonsDisabled(general?.workTime[dayofWeek])}            
          >
            <View style={styles.radioButtonTextContainer}>
              <RadioButton
                value={isCroatianLang? portion.size : portion.size_en}
                status={selectedSize === portion.size || selectedSize === portion.size_en ? 'checked' : 'unchecked'}
                onPress={() => toggleSize(isCroatianLang? portion.size : portion.size_en, portion.price, index)}
                color="#ffe521"
                disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
              />
              <Text style={styles.sizeText} 
              >
                {isCroatianLang? portion.size : portion.size_en}
              </Text>
            </View>
            { portion.price - meal.portions[0].price ? <Text style={styles.sizePrice}>+{(portion.price - meal.portions[0].price).toFixed(2)} €</Text>: <></>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sizeContainer: { width: "100%", paddingBottom: 0 },
  radioButtonTextContainer: { flexDirection: "row", alignItems: "center" },
  radioButtonContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between", paddingRight: 10 },
  sizeText: { fontSize: 16, marginLeft: 10 },
  sizePrice: { fontSize: 14, color: "#DA291C", marginLeft: 1 },
  sizeTitle: {
    fontSize: 16, // Adjust the size of the title
    fontWeight: "bold",
    color: "#DA291C",
    marginBottom: 10,
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
});

export default SizeList;
