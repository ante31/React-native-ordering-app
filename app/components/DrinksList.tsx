import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RadioButton, Divider } from 'react-native-paper';
import * as Haptics from "expo-haptics";
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const DrinksList = ({ drinks, drinksType, drinksMax, selectedDrinks, setSelectedDrinks, isCroatianLang, scale }: any) => {
  const { general } = useGeneral();
  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

  const handleSelectDrink = (drinkId: string) => {
    Haptics.selectionAsync();

    const selected = selectedDrinks.find((drink: any) => drink.id === drinkId);

    if (selected) {
      // Deselect
      setSelectedDrinks(selectedDrinks.filter((drink: any) => drink.id !== drinkId));
    } else {
      const drinkToAdd = drinks[drinkId];
      if (!drinkToAdd) return; // safety check

      const newDrink = { id: drinkId, ...drinkToAdd };

      if (selectedDrinks.length < drinksMax) {
        setSelectedDrinks([...selectedDrinks, newDrink]);
      } else {
        setSelectedDrinks([...selectedDrinks.slice(1), newDrink]);
      }
    }
  };


  React.useEffect(() => {
    // Reset selected drinks when drinks change
    console.log("Selected drinks changed", selectedDrinks);
  }, [selectedDrinks]);


  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: scale.light(14) }]}>
        {isCroatianLang ? 'Odaberi piće' : 'Select drink'}
      </Text>
      <Divider style={[styles.divider, { marginBottom: scale.light(5) }]} />
      <ScrollView>
        {Object.entries(drinks)
          .filter(([_, drink]: any) => {
            if (drinksType === "sodas") return drink.tip === "sok";
            if (drinksType === "drinks") return drink.tip === "sok" || drink.tip === "pivo";
            return true;
          })
          .map(([id, drink]: any) => {
            const isSelected = selectedDrinks.some((drink: any) => drink.id === id);
            const disabled = appButtonsDisabled(general?.workTime[dayOfWeek], general?.holidays);

            return (
              <TouchableOpacity
                key={id}
                style={[styles.radioButtonContainer, { paddingHorizontal: scale.light(10) }]}
                onPress={() => handleSelectDrink(id)}
                disabled={disabled}
              >
                <View style={[styles.radioButtonTextContainer, scale.isTablet() && { marginVertical: 6 }]}>
                  <View style={scale.isTablet() ? { transform: [{ scale: 2.2 }], marginHorizontal: 20 } : {}}>
                    <RadioButton
                      value={id}
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => handleSelectDrink(id)}
                      color="#ffe521"
                      disabled={disabled}
                    />
                  </View>
                  <Text style={[styles.drinkText, { fontSize: scale.light(14) }]}>
                    {isCroatianLang ? drink.ime : drink.ime_en}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { width: "100%", paddingBottom: 0 },
  title: {
    fontFamily: "Lexend_700Bold",
    color: "#DA291C",
    marginBottom: 10,
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  radioButtonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  drinkText: {
    marginLeft: 10,
    fontFamily: "Lexend_400Regular",
  },
});

export default DrinksList;
