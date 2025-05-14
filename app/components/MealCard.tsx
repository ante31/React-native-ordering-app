import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Meal } from "../models/mealModel";
import { isCroatian } from "../services/languageChecker";
import { Divider } from "react-native-paper";

const MealCard = ({ item }: { item: Meal }) => {
  const isCroatianLang = isCroatian();
  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftContainer}>
        <Text style={styles.productName}>{isCroatianLang ? item.ime: item.ime_en}</Text>
        <Text style={styles.productDesc}>{isCroatianLang? item.opis: item.opis_en}</Text>
        <Text style={styles.productPrice}>{item.portions[0].price.toFixed(2)} €</Text>
      </View>
      <View style={styles.rightContainer}>
        <Image
          source={{ uri: item.image }} 
          style={styles.image}
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
    padding: 6,
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
    fontWeight: "bold",
  },
  productDesc: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 16,
    color: "red",
  },
  image: {
    height: 100, 
    width: 100, 
    resizeMode: 'contain', 
    borderRadius: 8, 
  },
});
