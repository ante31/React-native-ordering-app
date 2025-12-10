import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Divider, Modal, Portal, RadioButton } from 'react-native-paper';
import { isCroatian } from '../services/languageChecker';
import { appButtonsDisabled } from '../services/isAppClosed';
import { CenteredLoading } from './CenteredLoading';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const SaucesList = ({ meal, extras, selectedExtras, setSelectedExtras, isUpdating, scale }: any) => {
  const { general } = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  const isCroatianLang = isCroatian();
  const [showWarningModal, setshowWarningModal] = useState(false);


  const handleSelectSauce = (label: string, price: number) => {
    const newSelected = { ...selectedExtras };
    if (label in newSelected) {
      delete newSelected[label];
      setSelectedExtras(newSelected);
    } else {
      // Remove all sauces
    Object.keys(extras).forEach(key => delete newSelected[key]);

    // Add selected sauce
    newSelected[label] = price;
    setSelectedExtras(newSelected);
  };
  }
  return (
    <View style={styles.extrasContainer}>
      <Text style={[styles.extrasTitle, { fontSize: scale.light(14) }]}>
        {isCroatianLang ? "Odaberite umak" : "Select sauce"}
      </Text>
      <Divider style={[styles.divider, scale.isTablet() && { marginBottom: 20 }]} />

      {extras ? (
        Object.entries(extras).map(([label, value], index) => {
          const [name, nameEn] = label.split('|');

          const isSelected = label in selectedExtras;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.checkboxContainer, { marginBottom: scale.light(10), paddingHorizontal: scale.light(10) }]}
              onPress={() => {
                if (!isUpdating) handleSelectSauce(label, value as number);
              }}
              // deselect

              disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
            >
              <View style={styles.checkboxTextContainer}>
                <View style={scale.isTablet() ? { transform: [{ scale: 1.6 }], marginHorizontal: 20 } : {}}>
                  <RadioButton
                    value={label}
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => {
                      if (!isUpdating) handleSelectSauce(label, value as number);
                    }}
                    color="#ffe521"
                    disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
                  />
                </View>
                <Text style={[styles.checkboxText, { fontSize: scale.light(14) }]}>
                  {isCroatianLang ? name : nameEn}
                </Text>
              </View>

              {general?.extras && typeof value === 'number' && (
                value > 0 || (
                  Object.keys(selectedExtras).filter(
                    (key) =>
                      selectedExtras[key] === 0 ||
                      selectedExtras[key] === general.extras.penalty
                  ).length >= general.extras.freeMax &&
                  selectedExtras[label] !== 0
                )
              ) && (
                <View style={styles.priceContainer}>
                  <Text style={[styles.productPrice, { fontSize: scale.light(12), fontFamily: "Lexend_700Bold" }]}>
                    +{Object.keys(selectedExtras).filter(
                      (key) =>
                        selectedExtras[key] === 0 ||
                        selectedExtras[key] === general.extras.penalty
                    ).length >= general.extras.freeMax && value === 0
                      ? general.extras.penalty.toFixed(2)
                      : value.toFixed(2)
                    } €
                  </Text>
                </View>
              )}
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
          contentContainerStyle={{ padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 5, marginHorizontal: 30 }}>
          <Text style={{ marginBottom: 10, fontSize: 20, textAlign: 'center' }}>
            {isCroatianLang ? "Svaki dodatni prilog je 20 centi" : "Every additional extra is 20 cents"}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Button
                mode="contained"
                onPress={() => setshowWarningModal(false)}
                style={{ borderRadius: 5, height: 60, justifyContent: 'center', backgroundColor: '#ffd400' }}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>
                  {isCroatianLang ? "U redu" : "OK"}
                </Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  extrasContainer: { width: '100%', paddingBottom: 0, marginBottom: 3 },
  checkboxContainer: {
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  checkboxTextContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: -5 },
  checkboxText: { marginLeft: 10, flexWrap: 'nowrap', width: '60%', fontFamily: "Lexend_400Regular" },
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
    alignItems: 'flex-start',
  },
  productPrice: {
    color: '#DA291C',
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

export default SaucesList;
