import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { RadioButton, Divider } from 'react-native-paper';
import * as Haptics from "expo-haptics";
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';

const SizesListComponent = ({
  meal,
  selectedSize,
  extras,
  setSelectedSize,
  selectedPortionIndex,
  setSelectedPortionIndex,
  selectedExtras,
  setSelectedExtras,
  quantity,
  setIsUpdating,
  isCroatianLang,
  scale,
}: any) => {
  const { general } = useGeneral();
  const dayofWeek = general ? general.workTime && Object.keys(general.workTime)[0] : '';
  console.log('rendering SizesListComponent with selectedSize:', selectedSize);

  const toggleSize = useCallback(
    (size: string, value: number, index: number) => {
      setIsUpdating(true);

      // if (Platform.OS !== 'web') {
      //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // }

      setSelectedSize(size);
      setSelectedPortionIndex(index);

      if (Object.keys(extras).length > 0) {
        const updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
          const newValue = parseFloat(extras[key] as string || '0');
          if (newValue > 0 || selectedExtras[key] === 0 || selectedExtras[key] === 0.2) {
            acc[key] = selectedExtras[key];
          }
          return acc;
        }, {});
        setSelectedExtras(updatedSelectedExtras);
      }
    },
    [extras, selectedExtras, setSelectedExtras, setSelectedPortionIndex, setSelectedSize, setIsUpdating]
  );

  return (
    <View style={styles.sizeContainer}>
      <Text style={[styles.sizeTitle, { fontSize: scale.light(14) }]}>
        {isCroatianLang ? 'Odaberite veličinu' : 'Select size'}
      </Text>
      <Divider style={[styles.divider, { marginBottom: scale.light(5) }]} />

      {(meal.portions || meal.portionsOptions).map((portion: any, index: number) => {
        const priceDiff = meal.portions
          ? portion.price - meal.portions[0].price
          : portion.price - meal.portionsOptions[0].price;

        const displaySize = isCroatianLang ? portion.size : portion.size_en;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.radioButtonContainer, { paddingHorizontal: scale.light(10) }]}
            onPress={() => toggleSize(displaySize, portion.price, index)}
            disabled={appButtonsDisabled(general?.appStatus, general?.workTime?.[dayofWeek], general?.holidays)}
          >
            <View style={[styles.radioButtonTextContainer, scale.isTablet() && { marginVertical: 6 }]}>
              <View style={scale.isTablet() ? { transform: [{ scale: 2.2 }], marginHorizontal: 20 } : {}}>
                <RadioButton
                  value={displaySize}
                  status={selectedSize === portion.size || selectedSize === portion.size_en ? 'checked' : 'unchecked'}
                  onPress={() => toggleSize(displaySize, portion.price, index)}
                  color="#ffe521"
                  disabled={appButtonsDisabled(general?.appStatus, general?.workTime?.[dayofWeek], general?.holidays)}
                />
              </View>
              <Text style={[styles.sizeText, { fontSize: scale.light(14) }]}>{displaySize}</Text>
            </View>
            {priceDiff ? <Text style={[styles.sizePrice, { fontSize: scale.light(12) }]}>+{priceDiff.toFixed(2)} €</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

SizesListComponent.displayName = 'SizesList';

export default React.memo(SizesListComponent);

const styles = StyleSheet.create({
  sizeContainer: { width: "100%", paddingBottom: 0 },
  radioButtonTextContainer: { flexDirection: "row", alignItems: "center" },
  radioButtonContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between" },
  sizeText: { marginLeft: 10, fontFamily: "Lexend_700Bold" },
  sizePrice: { color: "#DA291C", marginLeft: 1, fontFamily: "Lexend_700Bold" },
  sizeTitle: { fontFamily: "Lexend_700Bold", color: "#DA291C", marginBottom: 10, marginLeft: 10 },
  divider: { marginHorizontal: 10 },
});