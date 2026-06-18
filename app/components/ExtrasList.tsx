import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Checkbox, Divider } from 'react-native-paper';
import * as Haptics from "expo-haptics"; 
import { appButtonsDisabled } from '../services/isAppClosed';
import { CenteredLoading } from './CenteredLoading';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

interface ExtrasListProps {
  isCroatianLang: boolean;
  extras: Record<any, any>;
  selectedExtras: Record<string, number>;
  setSelectedExtras: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdating: boolean;
  scale: any;
}

const ExtrasListComponent: React.FC<ExtrasListProps> = ({
  isCroatianLang,
  extras,
  selectedExtras,
  setSelectedExtras,
  setIsUpdating,
  isUpdating,
  scale,
}) => {
  const { general } = useGeneral();

  const dayofWeek = useMemo(
    () => general?.holidays && getDayOfTheWeek(getLocalTime(), general.holidays),
    [general?.holidays]
  );

  const selectedExtrasCount = useMemo(() => {
    if (!general?.extras) return 0;
    return Object.keys(selectedExtras).filter(
      (key) =>
        selectedExtras[key] === 0 ||
        selectedExtras[key] === general.extras.penalty
    ).length;
  }, [selectedExtras, general?.extras]);

  const buttonsDisabled = useMemo(() => {
    if (!general) return true;
    return appButtonsDisabled(
      general.appStatus,
      general.workTime?.[dayofWeek ?? ''],
      general.holidays
    );
  }, [general, dayofWeek]);

  const toggleExtra = useCallback((extra: string, value: number) => {
    if (!general?.extras) return;

    setIsUpdating(true);

    // if (Platform.OS !== 'web') {
    //   requestAnimationFrame(() => {
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //   });
    // }

    const fullExtraKey =
      Object.entries(extras).find(([key]) => key.includes(extra))?.[0] ?? extra;

    setSelectedExtras((prevSelected) => {
      const updatedExtras = { ...prevSelected };
      

      if (fullExtraKey in updatedExtras) {
        delete updatedExtras[fullExtraKey];

        const newCount = Object.keys(updatedExtras).filter(
          (key) =>
            updatedExtras[key] === 0 ||
            updatedExtras[key] === general.extras.penalty
        ).length;

        if (newCount <= general.extras.freeMax) {
          Object.keys(updatedExtras).forEach((key) => {
            if (updatedExtras[key] === general.extras.penalty) {
              updatedExtras[key] = 0;
            }
          });
        }
      } else {
        const isPenaltyMode = selectedExtrasCount >= general.extras.freeMax;
        updatedExtras[fullExtraKey] =
          isPenaltyMode && value === 0
            ? general.extras.penalty
            : value;
      }

      return updatedExtras;
    });
  }, [extras, general?.extras, selectedExtrasCount, setSelectedExtras, setIsUpdating]);

  return (
    <View style={styles.extrasContainer}>
      <Text style={[styles.extrasTitle, { fontSize: scale.light(14) }]}>
        {isCroatianLang ? 'Odaberite priloge' : 'Select extras'}
      </Text>

      <Divider style={[styles.divider, scale.isTablet() && { marginBottom: 20 }]} />

      {extras && general?.extras ? (
        Object.entries(extras).map(([label, value]) => {
          const [name, nameEn] = label.split('|');

          const showPrice =
            typeof value === 'number' &&
            (value > 0 || (selectedExtrasCount >= general.extras.freeMax && selectedExtras[label] !== 0));

          const price: number = showPrice ? value>0? value: general.extras.penalty : 0;

          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.checkboxContainer,
                { marginBottom: scale.light(10), paddingHorizontal: scale.light(10) },
              ]}
              onPress={() => {
                if (!isUpdating) toggleExtra(name, value);
              }}
              disabled={buttonsDisabled}
            >
              <View style={styles.checkboxTextContainer}>
                <View
                  style={
                    scale.isTablet()
                      ? { transform: [{ scale: 2.2 }], marginHorizontal: 20 }
                      : {}
                  }
                >
                  <Checkbox
                    status={label in selectedExtras ? 'checked' : 'unchecked'}
                    color="#ffe521"
                    disabled={buttonsDisabled}
                  />
                </View>
                <Text style={[styles.checkboxText, { fontSize: scale.light(14) }]}>
                  {isCroatianLang ? name : nameEn}
                </Text>
              </View>

              {showPrice && (
                <View style={styles.priceContainer}>
                  <Text style={[styles.productPrice, { fontSize: scale.light(12), fontFamily: 'Lexend_700Bold' }]}>
                    +{price.toFixed(2)} €
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      ) : (
        <CenteredLoading />
      )}
    </View>
  );
};

ExtrasListComponent.displayName = "ExtrasList";

export const ExtrasList = React.memo(ExtrasListComponent);


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
