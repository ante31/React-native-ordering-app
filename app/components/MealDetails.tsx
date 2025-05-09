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


const MealDetails = ({ visible, meal, onClose, navigation }: any) => {
  const isCroatianLang = isCroatian();
  const [extras, setExtras] = useState<{ [key: string]: string }>({});
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState(meal ? meal.portions[0].size : "");
  const [quantity, setQuantity] = useState(1);
  const [cartPrice, setPrice] = useState(meal ? meal.portions[0].price : 0); 
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: string }>({});
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {    console.log("isUpdating", isUpdating);

  }, [isUpdating]);

  const { state, dispatch } = useCart();

  const handleAddToCart = () => {
    console.log('MEALY:', meal);
    const uniqueId = `${meal.id}${Object.entries(selectedExtras)
      .map(([key]) => `_${key.split('|')[0].replace(/\s+/g, '')}`) // Remove spaces from extras
      .sort() // Sort the extras alphabetically
      .join('')}`;

    console.log("UniqueId", uniqueId)
    console.log("Selected size123", selectedSize)

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
        portionsOptions: meal.portions,
      },
    });
    console.log('After state:', state);
    if (onClose) onClose();

    setTimeout(() => {
      toast.show("Dodano u košaricu", {
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
          const response = await fetch(`${backendUrl}/cjenik/Prilozi/${meal.portions[selectedPortionIndex]?.extras}`);
          const data = await response.json();
          setExtras(data);
          setLoading(false); 
        } catch (error) {
          console.error('Error fetching extras:', error);
          setLoading(false); 
        }
      }
      else {
        setLoading(false); // Set loading to false if no extras
      }
    };
  
    //console.log("selectedPortionIndex", selectedPortionIndex); // Check if extras update correctly here
  
    fetchExtras();
  }, [meal.portions[selectedPortionIndex]?.extras, selectedPortionIndex]); // Ensure `selectedPortionIndex` and `meal.portions[selectedPortionIndex]` trigger effect
  



  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent]}>
        <View style={{ marginBottom: 10 }}>
          <View style={{ width: "75%", paddingLeft: 10, paddingTop: 10 }}>
            <Text style={styles.extrasTitle}>{isCroatianLang ? meal.ime : meal.ime_en}</Text>
            <Text style={{ flexWrap: 'wrap' }}>{isCroatianLang ? meal.opis : meal.opis_en}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              padding: 10, // Optional padding for better click area
              zIndex: 1, // Ensure it appears on top
            }}
          >
            <MaterialIcons name="close" size={38} color="black" />
          </TouchableOpacity>
        </View>
        {loading ?
        ( <CenteredLoading /> )
        : (
          <>
          <ScrollView>
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
          />
        </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 10, borderRadius: 10, width: "100%", height: "100%" },
  extrasTitle: { fontSize: 18, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 0,
  },
});

export default MealDetails;
