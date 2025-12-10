import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Meal } from "../models/mealModel";
import { isCroatian } from "../services/languageChecker";
import { Divider } from "react-native-paper";

const MealCard = ({ item, scale }: { item: Meal, scale: any}) => {
  const isCroatianLang = isCroatian();
  return (
    <View style={[styles.cardContainer, { paddingVertical: scale.light(8) }]}>
      <View style={styles.leftContainer}>
        <Text style={[styles.productName, { fontSize: scale.light(18) }]}>{isCroatianLang ? item.ime : item.ime_en}</Text>
        <Text style={[styles.productDesc, { fontSize: scale.light(14) }]}>{isCroatianLang? item.opis: item.opis_en}</Text>
        <Text style={[styles.productPrice, { fontSize: scale.light(16) }]}>{item.portions[0].price.toFixed(2)} €</Text>
      </View>
      <View style={styles.rightContainer}>
        <Image
          source={{ uri: item.image }} 
          style={[styles.image]}
        />
      </View>
    </View>
  );
};

export default MealCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    borderRadius: 8,
    justifyContent: "space-between",
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',

  },
  rightContainer: {
    justifyContent: "center",
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold'
  },
  productDesc: {
    fontSize: 14,
    color: "#777",
    marginTop: 0,
    marginBottom: 0,
    fontFamily: 'Lexend_400Regular'
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: "red",
  },
  image: {
    height: 100, 
    width: 100, 
    resizeMode: 'contain', 
    borderRadius: 8, 
  },
});
