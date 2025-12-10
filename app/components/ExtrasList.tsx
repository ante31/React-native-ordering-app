import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Touchable, TouchableOpacity, Platform } from 'react-native';
import { Button, Checkbox, Divider, Modal, Portal } from 'react-native-paper';
import * as Haptics from "expo-haptics"; 
import { appButtonsDisabled } from '../services/isAppClosed';
import { CenteredLoading } from './CenteredLoading';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';


const ExtrasList = ({ isCroatianLang, meal, extras, selectedExtras, setSelectedExtras, setPrice, setPriceSum, quantity, selectedPortionIndex, isUpdating, scale }: any) => {
  const {general} = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  
  const [freeExtrasCount, setFreeExtrasCount] = useState(0);
  const [showWarningModal, setshowWarningModal] = useState(false);
  const prevFreeExtrasCount = useRef(0);
  
  useEffect(() => {
    if (!general || !general.extras) return;

    const count = Object.keys(selectedExtras).filter(
      (key) => selectedExtras[key] === 0 || selectedExtras[key] === general.extras.penalty
    ).length;

    setFreeExtrasCount(count);

    // Show warning modal if entering penalty mode
    // if (count === general.extras.freeMax && prevFreeExtrasCount.current < general.extras.freeMax) {
    //   setshowWarningModal(true);
    // }

    prevFreeExtrasCount.current = count;
  }, [selectedExtras]);
  
  const toggleExtra = (extra: string, value: number) => {
    if (!general || !general.extras) return; 

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const fullExtraKey = Object.entries(extras).find(([key]) => key.includes(extra))?.[0] || extra;

    setSelectedExtras((prevSelected: { [key: string]: number }) => {
      const updatedExtras = { ...prevSelected };

      if (fullExtraKey in updatedExtras) {
        delete updatedExtras[fullExtraKey];

        // Resetiranje penalty moda
        const newCount = Object.keys(updatedExtras).filter((key) =>
          updatedExtras[key] === 0 || updatedExtras[key] === general.extras.penalty
        ).length;

        if (newCount <= general.extras.freeMax) {
          Object.keys(updatedExtras).forEach((key) => {
            if (updatedExtras[key] === general.extras.penalty) {
              updatedExtras[key] = 0; 
            }
          });
        }
      } else {
        // Provjera jesmo li u panalty modu prije dodavanja novih priloga
        const isPenaltyMode = Object.keys(updatedExtras).filter((key) =>
          updatedExtras[key] === 0 || updatedExtras[key] === general.extras.penalty
        ).length >= general.extras.freeMax;

        updatedExtras[fullExtraKey] = isPenaltyMode && value === 0
          ? general.extras.penalty
          : value;
      }

      return updatedExtras;
    });
  };

  
  useEffect(() => {
    const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);
  
    setPrice(meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice);
  
    setPriceSum(quantity * (meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice: meal.portionsOptions[selectedPortionIndex].price + extrasPrice));
  }, [selectedExtras, quantity, setPrice, setPriceSum]);
  
  console.log("Extras", selectedExtras);
  return (
    <View style={styles.extrasContainer}>
      <Text style={[styles.extrasTitle, { fontSize: scale.light(14) }]}>{isCroatianLang? "Odaberite priloge": "Select extras"}</Text>
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
      {/* <Portal>
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
                style={{ borderRadius: 5, height: 60, justifyContent: 'center', backgroundColor: '#ffd400' }}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>{isCroatianLang? "U redu": "OK"}</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Portal> */}
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

export default ExtrasList;
