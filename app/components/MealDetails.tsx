import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Counter from './Counter';
import ExtrasList from './ExtrasList'; // Import the new component
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCart } from "../cartContext";
// import { useClickOutside } from "react-native-click-outside";
import SizesList from "./SizesList";
import { backendUrl } from "../../localhostConf";
import { useToast } from "react-native-toast-notifications";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "./CenteredLoading";
import { useGeneral } from '../generalContext';
import { safeFetch } from "../services/safeFetch";
import DrinksList from "./DrinksList";

const MealDetails = ({ visible, meal, drinks={}, scale, onClose, navigation }: any) => {
  const isCroatianLang = isCroatian();
  const [extras, setExtras] = useState<{ [key: string]: string }>({});
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState(meal ? meal.portions[0].size : "");
  const [quantity, setQuantity] = useState(1);
  const [cartPrice, setPrice] = useState(meal ? meal.portions[0].price : 0); 
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});
  const [selectedDrinks, setSelectedDrinks] = useState<any>([]);
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { general } = useGeneral();

  const toast = useToast();

  useEffect(() => {    console.log("isUpdating", isUpdating);

  }, [isUpdating]);

  const { state, dispatch } = useCart();

  const handleAddToCart = () => {
    const uniqueId = `${meal.id}${selectedSize}${Object.entries(selectedExtras)
      .map(([key]) => `_${key.split('|')[0].replace(/\s+/g, '')}`) // Remove spaces from extras
      .sort() // Sort the extras alphabetically
      .join('')}`;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: uniqueId, // Pretpostavka: meal ima ID
        name: `${meal.ime}|${meal.ime_en}`, 
        description: `${meal.opis}|${meal.opis_en}`,
        size: selectedSize,
        price: cartPriceSum/quantity,
        quantity: quantity,
        selectedExtras: selectedExtras,
        selectedDrinks: selectedDrinks,
        portionsOptions: meal.portions,
      },
    });
    console.log('After state:', state);
    if (onClose) onClose();

    setTimeout(() => {
      toast.show(isCroatianLang ? "Dodano u košaricu" : "Added to cart", {
        type: "danger",
        placement: "bottom",
        duration: 1200,
      });
    }, 400); // Small delay
  };
useEffect(() => {
  const fetchExtras = async () => {
    if (meal.portions[selectedPortionIndex]?.extras != "null") {
      try {
        console.log("A fetch happened");
        const response = await safeFetch(`${backendUrl}/cjenik/Prilozi/${meal.portions[selectedPortionIndex]?.extras}`);
        const data = await response.json();

        let updatedSelectedExtras: { [key: string]: number } = {};

        if (general && general.extras) {
          updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
            if (data.hasOwnProperty(key)) {
              if (selectedExtras[key] === general.extras.penalty) {
                acc[key] = general.extras.penalty;
              } else {
                acc[key] = data[key];
              }
            }
            return acc;
          }, {});
        }


        setExtras(data); // update base prices
        setSelectedExtras(updatedSelectedExtras); // update selected ones with new prices
        setLoading(false);
      } catch (error) {
        console.error('Error fetching extras:', error);
        setLoading(false);
      }
    } else {
      setExtras({});
      setSelectedExtras({});
      setLoading(false);
    }
  };

  fetchExtras();
}, [ selectedPortionIndex]);




  return (
    <View style={[styles.modalContainer, scale.isTablet() ? { margin: 10 } : {}]}>
      <View style={styles.modalContent}>
        <View style={{ marginBottom: 10 }}>
          <View style={{ width: "75%", paddingLeft: 10, paddingTop: 10 }}>
            <Text style={[styles.extrasTitle, { fontSize: scale.medium(16) }]}>{isCroatianLang ? meal.ime : meal.ime_en}</Text>
            <Text style={{ flexWrap: 'wrap', fontSize: scale.medium(12), paddingTop: 5, color: "#777", fontFamily: "Lexend_700" }}>{isCroatianLang ? meal.opis : meal.opis_en}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              padding: 10, // Optional padding for better click area
              zIndex: 1, // Ensure it appears on top
            }}
          >
            <MaterialIcons name="close" size={scale.medium(32)} color="black" />
          </TouchableOpacity>
        </View>
        {loading ?
        ( <CenteredLoading /> )
        : (
          <>
          <ScrollView style={{ marginBottom: 12 }}>
            {meal.portions.length > 1 && (
              <SizesList
                meal={meal}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedPortionIndex={selectedPortionIndex}
                setSelectedPortionIndex={setSelectedPortionIndex}
                extras={extras}
                selectedExtras={selectedExtras}
                setSelectedExtras={setSelectedExtras}
                setPrice={setPrice}
                setPriceSum={setPriceSum}
                quantity={quantity}
                setIsUpdating={setIsUpdating}
                isCroatianLang={isCroatianLang}
                scale={scale}
              />
            )}
            {meal.portions[0].extras !== "null" && (
              <ExtrasList
                meal={meal}
                extras={extras}
                selectedExtras={selectedExtras}
                setSelectedExtras={setSelectedExtras}
                setPrice={setPrice}
                setPriceSum={setPriceSum}
                quantity={quantity}
                selectedPortionIndex={selectedPortionIndex}
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
            {drinks && (
              <DrinksList
                drinks={drinks}
                drinksType={meal.type}
                drinksMax={meal.maxDrinks}
                selectedDrinks={selectedDrinks}
                setSelectedDrinks={setSelectedDrinks}
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
          </ScrollView>
          <Counter
            quantity={quantity}
            onIncrease={() => setQuantity((prev) => prev + 1)}
            onDecrease={() => setQuantity((prev) => Math.max(prev - 1, 1))}
            handleAddToCart={handleAddToCart}
            cartPrice={cartPrice}
            cartPriceSum={cartPriceSum}
            setPriceSum={setPriceSum}
            isUpdating={isUpdating}
            navigation={navigation}
            scale={scale}
          />
        </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 10, paddingBottom: 0, borderRadius: 10, width: "100%", height: "100%" },
  extrasTitle: { fontSize: 18, fontFamily: 'Lexend_700Bold' },
});

export default MealDetails;
