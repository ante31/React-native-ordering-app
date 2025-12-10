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

  console.log("type", drinksType)
  Object.values(drinks).forEach((drink: any) => {
    console.log("Drink:", drink.ime);
    console.log("DrinksList props", drink.tip);
  });

const handleSelectDrink = (drinkId: string) => {
  Haptics.selectionAsync();

  const drinkToAdd = drinks[drinkId];
  if (!drinkToAdd) return;

  const countOfThisDrink = selectedDrinks.filter((d: any) => d.id === drinkId).length;
  const totalSelected = selectedDrinks.length;

  if (totalSelected < drinksMax) {
    // Just add new drink (or increment stack)
    setSelectedDrinks([...selectedDrinks, { id: drinkId, ...drinkToAdd }]);
  } else {
    if (countOfThisDrink > 0) {
      // Already selected this drink, want to add one more but at max capacity
      // Remove oldest *different* drink to make room
      const indexToRemove = selectedDrinks.findIndex((d: any) => d.id !== drinkId);
      if (indexToRemove !== -1) {
        const updated = [...selectedDrinks];
        updated.splice(indexToRemove, 1); // remove oldest different drink
        updated.push({ id: drinkId, ...drinkToAdd }); // add one more of the selected drink
        setSelectedDrinks(updated);
      } else {
        // Only one drink type selected maxed out, can't add more
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      // Different drink selected, max reached - remove oldest drink and add new
      const updated = [...selectedDrinks.slice(1), { id: drinkId, ...drinkToAdd }];
      setSelectedDrinks(updated);
    }
  }
};




  React.useEffect(() => {
    // Reset selected drinks when drinks change
    console.log("Selected drinks changed", selectedDrinks);
  }, [selectedDrinks]);

  console.log("language", isCroatianLang);


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
          const drinkCount = selectedDrinks.filter((drink: any) => drink.id === id).length;
          const isSelected = drinkCount > 0;
          const disabled = appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays);

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

                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                    <Text
                      style={[
                        styles.drinkText,
                        {
                          fontSize: scale.light(14),
                          flexShrink: 1,
                          flex: 1,
                        },
                      ]}
                      numberOfLines={0}
                      ellipsizeMode="tail"
                    >
                      {isCroatianLang ? drink.ime : drink.ime_en}
                      {drinkCount > 1 && (
                        <Text style={{ color: 'red', fontSize: scale.light(13), fontWeight: '600' }}>
                          {'  '}x{drinkCount}
                        </Text>
                      )}
                    </Text>

                  </View>
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
    flexWrap: "wrap",
  },
});

export default DrinksList;
