import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Touchable, TouchableOpacity, Platform } from 'react-native';
import { Button, Checkbox, Divider, Modal, Portal } from 'react-native-paper';
import { isCroatian } from '../services/languageChecker';
import * as Haptics from "expo-haptics"; // for haptic feedback
import { appButtonsDisabled } from '../services/isAppClosed';
import { CenteredLoading } from './CenteredLoading';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';


const ExtrasList = ({ meal, extras, selectedExtras, setSelectedExtras, setPrice, setPriceSum, quantity, selectedPortionIndex }: any) => {
  const {general} = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime());
  
  const isCroatianLang = isCroatian();
  const [freeExtrasCount, setFreeExtrasCount] = useState(0);
  const [showWarningModal, setshowWarningModal] = useState(false);
  const prevFreeExtrasCount = useRef(0);
  
  useEffect(() => {
    const count = Object.keys(selectedExtras).filter((key) => selectedExtras[key] === 0 || selectedExtras[key] === 0.2).length;
    setFreeExtrasCount(count);
  
    // Show warning modal if entering penalty mode
    // if (count === 5 && prevFreeExtrasCount.current < 5) {
    //   setshowWarningModal(true);
    // }
  
    prevFreeExtrasCount.current = count;
  }, [selectedExtras]);
  
  const toggleExtra = (extra: string, value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const fullExtraKey = Object.entries(extras).find(([key]) => key.includes(extra))?.[0] || extra;
  
    setSelectedExtras((prevSelected: { [key: string]: number }) => {
      const updatedExtras = { ...prevSelected };
  
      if (fullExtraKey in updatedExtras) {
        delete updatedExtras[fullExtraKey];
  
        // Reset penalty extras if exiting penalty mode
        const newCount = Object.keys(updatedExtras).filter((key) => updatedExtras[key] === 0 || updatedExtras[key] === 0.2).length;
        if (newCount < 5) {
          Object.keys(updatedExtras).forEach((key) => {
            if (updatedExtras[key] === 0.2) {
              updatedExtras[key] = 0; // Reset penalty extras
            }
          });
        }
      } else {
        // Check if we're in penalty mode before adding the new extra
        const isPenaltyMode = Object.keys(updatedExtras).filter((key) => updatedExtras[key] === 0 || updatedExtras[key] === 0.2).length >= 5;
        updatedExtras[fullExtraKey] = isPenaltyMode && value === 0 ? 0.2 : value;
      }
  
      return updatedExtras;
    });
  };
  
  // This useEffect will calculate the total price whenever selectedExtras or quantity changes
  useEffect(() => {
    // Calculate the total extras price based on the selectedExtras format
    const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);
  
    // Update the price with the new size and extras
    setPrice(meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice);
  
    // Update the total price sum based on quantity
    setPriceSum(quantity * (meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice));
  }, [selectedExtras, quantity, setPrice, setPriceSum]);
  
  console.log("Extras", selectedExtras);
  return (
    <View style={styles.extrasContainer}>
      <Text style={styles.extrasTitle}>{isCroatianLang? "Odaberi priloge": "Select extras"}</Text>
      <Divider style={styles.divider} />
      {extras ? (
        Object.entries(extras).map(([label, value], index) => {
          const [name, nameEn] = label.split('|'); // Get Croatian name part
          return (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => toggleExtra(name, value as number)}
              disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
            >
              <View style={styles.checkboxTextContainer}>
                <Checkbox
                  status={label in selectedExtras ? 'checked' : 'unchecked'} // Check if the full key is in selectedExtras
                  onPress={() => toggleExtra(name, value as number)} // Toggle extra based on Croatian name
                  color="#ffe521"
                  disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
                />
                <Text style={styles.checkboxText}>{isCroatianLang ? name : nameEn}</Text>
              </View>
              {
  (typeof value === 'number' && (value > 0 || (Object.keys(selectedExtras).filter((key) => selectedExtras[key] === 0 || selectedExtras[key] === 0.2).length >= 5 && !(selectedExtras[label] === 0)))) && (
    <View style={styles.priceContainer}>
      <Text style={styles.productPrice}>
        +{Object.keys(selectedExtras).filter((key) => selectedExtras[key] === 0 || selectedExtras[key] === 0.2).length >= 5 && value === 0 ? '0.20' : value.toFixed(2)} €
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
      <Portal>
        <Modal
          visible={showWarningModal}
          onDismiss={() => setshowWarningModal(false)}
          contentContainerStyle={{ padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 5, marginHorizontal: 30}}>
          <Text style={{ marginBottom: 10, fontSize: 20, textAlign: 'center' }}>{isCroatianLang? "Svaki dodatni prilog je 20 centi" : "Every additional extra is 20 cents"}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ flex: 1, marginLeft: 5}}>
              <Button
                mode="contained"
                onPress={() => setshowWarningModal(false)}
                style={{ borderRadius: 5, height: 60, justifyContent: 'center', backgroundColor: '#FFC72C' }}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>{isCroatianLang? "U redu": "OK"}</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  extrasContainer: { width: '100%', paddingBottom: 0 },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10, 
    justifyContent: 'space-between', 
    width: '100%', 
  },   
  checkboxTextContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxText: { fontSize: 16, marginLeft: 10,   flexWrap: 'nowrap', width: '60%' },
  priceText: { fontSize: 16, color: '#333' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
  priceContainer: {
    marginTop: 5,
    paddingVertical: 6,
    paddingRight: 10,
    alignItems: 'flex-start', // Ensure text aligns right
  },
  productPrice: {
    fontSize: 14, // Increased font size
    color: '#DA291C', // mcdonalds yellow
  },
  extrasTitle: {
    fontSize: 16, // Increased font size
    fontWeight: 'bold',
    color: '#DA291C',
    marginBottom: 10,
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
});

export default ExtrasList;
