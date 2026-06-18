import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Touchable, TouchableOpacity, Platform } from 'react-native';
import { Button, Checkbox, Divider, Modal, Portal } from 'react-native-paper';
import * as Haptics from "expo-haptics"; 
import { appButtonsDisabled } from '../services/isAppClosed';
import { CenteredLoading } from './CenteredLoading';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';


const FriesExtrasList = ({ isCroatianLang, extras, selectedExtras, setSelectedExtras, isUpdating, scale }: any) => {
  const {general} = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  
  const toggleExtra = (extra: string, value: number) => {
  if (!general || !general.extras) return;

  // if (Platform.OS !== 'web') {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // }
  
  const fullExtraKey = Object.entries(extras).find(([key]) => key.includes(extra))?.[0] || extra;

  setSelectedExtras((prevSelected: { [key: string]: number }) => {
    const updatedExtras = { ...prevSelected };

    if (fullExtraKey in updatedExtras) {
      delete updatedExtras[fullExtraKey]; // briše ako postoji
    } else {
      updatedExtras[fullExtraKey] = value; // dodaje ako ne postoji
    }

    return updatedExtras;
  });
};

  
  // useEffect(() => {
  //   const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);
  
  //   console.log("Extras price", extrasPrice);
  
  //   setPrice(meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice);
  
  //   setPriceSum(quantity * (meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice));
  // }, [selectedExtras, quantity, setPrice, setPriceSum]);
  
  console.log("fries extras", selectedExtras);
  return (
    <View style={styles.extrasContainer}>
      <Text style={[styles.extrasTitle, { fontSize: scale.light(14) }]}>{isCroatianLang? "Odaberite priloge za pomfrit": "Select extras for fries"}</Text>
      <Divider style={[styles.divider, , scale.isTablet() && { marginBottom: 20 }]} />
      {extras ? (
        Object.entries(extras).map(([label, value], index) => {
          const [name, nameEn] = label.split('|'); 
          return (
            <TouchableOpacity
              key={index}
              style={[styles.checkboxContainer, { marginBottom: scale.light(10), paddingHorizontal: scale.light(10) }]}
              onPress={() => {
                if (!isUpdating) {
                  toggleExtra(name, value as number);
                }
              }}
              disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
            >
              <View style={styles.checkboxTextContainer}>
                <View style={scale.isTablet() ? { transform: [{ scale: 2.2 }], marginHorizontal: 20 } : {}}>
                  <Checkbox
                    status={label in selectedExtras ? 'checked' : 'unchecked'} 
                    onPress={() => {
                      if (!isUpdating) {
                        toggleExtra(name, value as number);
                      }
                    }}                    color="#ffe521"
                    disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
                  />
                </View>
                <Text style={[ styles.checkboxText, { fontSize: scale.light(14)}]}>{isCroatianLang ? name : nameEn}</Text>
              </View>
              {
                general && general.extras &&
                typeof value === 'number' &&
                (
                  value > 0 ||
                  (
                    Object.keys(selectedExtras).filter(
                      (key) =>
                        selectedExtras[key] === 0 
                        || selectedExtras[key] === general.extras.penalty
                    ).length >= general.extras.freeMax &&
                    selectedExtras[label] !== 0
                  )
                ) && (
                  <View style={styles.priceContainer}>
                    <Text style={[styles.productPrice, { fontSize: scale.light(12), fontFamily: "Lexend_700Bold"  }]}>
                      +{
                        Object.keys(selectedExtras).filter(
                          (key) =>
                            selectedExtras[key] === 0 ||
                            selectedExtras[key] === general.extras.penalty
                        ).length >= general.extras.freeMax && value === 0
                          ? general.extras.penalty.toFixed(2)
                          : value.toFixed(2)
                      } €
                    </Text>
                  </View>
                )
              }
            </TouchableOpacity>
          );
        })
      ) : (
        <CenteredLoading />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  extrasContainer: { width: '100%', paddingBottom: 0, marginBottom: 3 },
  checkboxContainer: { 
    paddingVertical: 2,
    marginLeft: 0,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
  },   
  checkboxTextContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: -5 },
  checkboxText: { marginLeft: 10,   flexWrap: 'nowrap', width: '60%', fontFamily: "Lexend_400Regular", },
  priceText: { fontSize: 16, color: '#333'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
  priceContainer: {
    marginTop: 0,
    marginLeft: -16,
    alignItems: 'flex-start', // Ensure text aligns right
  },
  productPrice: {
    color: '#DA291C', // mcdonalds yellow
  },
  extrasTitle: {
    fontFamily: "Lexend_700Bold",
    color: '#DA291C',
    marginBottom: 10,
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
    marginBottom: 5,
  },
});

export default FriesExtrasList;
