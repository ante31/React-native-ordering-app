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
import { safeFetch } from "../services/safeFetch";

const CartMealDetails = ({ visible, meal, scale, onClose, handleRemoveFromCart, setReloadTrigger, navigation }: any) => {
  console.log("CartMealDetailsmeal", meal);
  const initialMeal = meal;
  const isCroatianLang = isCroatian();
  const [extras, setExtras] = useState<{ [key: string]: string }>({});
  const initialPortionIndex = meal.portionsOptions.findIndex(
    (portion: any) => portion.size === meal.size
  );
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(
    initialPortionIndex !== -1 ? initialPortionIndex : 0
  );  const [selectedSize, setSelectedSize] = useState(meal ? meal.size : "");
  const [quantity, setQuantity] = useState(meal ? meal.quantity : 1);
  const [cartPrice, setPrice] = useState(meal ? meal.price : 0); 
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>(meal.selectedExtras);
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitButtonStatus, setSubmitButtonStatus] = useState("");

  console.log("DEtails", cartPrice, cartPriceSum, quantity);

  useEffect(() => {
    const submitButtonStatusCheck = () => {
      const extrasChanged = () => {
        const initialExtras = initialMeal.selectedExtras || {};
        const currentExtras = selectedExtras || {};
  
        const initialKeys = Object.keys(initialExtras);
        const currentKeys = Object.keys(currentExtras);
  
        if (initialKeys.length !== currentKeys.length) return true;
  
        for (let key of initialKeys) {
          if (initialExtras[key] !== currentExtras[key]) return true;
        }
  
        return false;
      };
  
      if (
        initialMeal.size !== selectedSize ||
        initialMeal.quantity !== quantity ||
        extrasChanged()
      ) {
        setSubmitButtonStatus("Ažuriraj");
      } else {
        setSubmitButtonStatus("Ukloni");
      }
    };
  
    submitButtonStatusCheck();
  }, [selectedSize, selectedPortionIndex, selectedExtras, quantity, meal]);
  
  const toast = useToast();

  useEffect(() => {    console.log("isUpdating", isUpdating);

  }, [isUpdating]);

  const { state, dispatch } = useCart();

  console.log('MEALYMeal:', meal);

  const handleAddToCart = () => {
    console.log('Mealinfo', meal);
    const uniqueId = `${meal.id}${meal.size}${Object.entries(selectedExtras)
      .map(([key]) => `_${key.split('|')[0].replace(/\s+/g, '')}`) // Remove spaces from extras
      .sort() // Sort the extras alphabetically
      .join('')}`;

    console.log("UniqueId", uniqueId)
    console.log("Koji kurac", meal.name, meal.description, selectedSize, cartPriceSum/quantity, quantity, selectedExtras, meal.portionsOptions);

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: uniqueId, // Pretpostavka: meal ima ID
        name: meal.name, 
        description: meal.description,
        size: selectedSize,
        price: cartPrice,
        quantity: quantity,
        selectedExtras: selectedExtras,
        portionsOptions: meal.portionsOptions,
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
      if (meal.portionsOptions[selectedPortionIndex]?.extras != "null") {
        try {
          console.log("A fetch happened");
          const response = await safeFetch(`${backendUrl}/cjenik/Prilozi/${meal.portionsOptions[selectedPortionIndex]?.extras}`);
          const data = await response.json();

          // 🔁 Update selectedExtras with new prices from fetched extras
          const updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
          if (data.hasOwnProperty(key)) {
            // If this extra was selected before and still exists, update to new price
            acc[key] = data[key];
          }
          return acc;
        }, {});

          setExtras(data);
          setSelectedExtras(updatedSelectedExtras); // update selected ones with new prices
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
  
    console.log("selectedPortionIndex", selectedPortionIndex); // Check if extras update correctly here
  
    fetchExtras();
  }, [meal.portionsOptions[selectedPortionIndex]?.extras, selectedPortionIndex]); 
  



  return (
    <View style={[styles.modalContainer, scale.isTablet() ? { margin: 10 } : {}]}>
      <View style={[styles.modalContent]}>
        <View style={{ marginBottom: 10 }}>
          <View style={{ width: "75%", paddingLeft: 10, paddingTop: 10 }}>
            <Text style={[styles.extrasTitle, { fontSize: scale.medium(16) }]}>{isCroatianLang ? meal.name.split("|")[0] : meal.name.split("|")[1]}</Text>
            <Text style={{ fontFamily: 'Lexend_400Regular', flexWrap: 'wrap', fontSize: scale.medium(12), paddingTop: 5 }}>{isCroatianLang ? meal.description.split("|")[0] : meal.description.split("|")[1]}</Text>
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
          <ScrollView>
            {meal.portionsOptions.length > 1 && (
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
            {Object.keys(extras).length > 0 && meal.portionsOptions[0].extras !== "null" && (
              <ExtrasList
                meal={meal}
                extras={extras}
                selectedExtras={selectedExtras}
                setSelectedExtras={setSelectedExtras}
                setPrice={setPrice}
                setPriceSum={setPriceSum}
                quantity={quantity}
                selectedPortionIndex={selectedPortionIndex}
                scale={scale}
              />
            )}
          </ScrollView>
          <Counter
            quantity={quantity}
            onIncrease={() => setQuantity((prev: number) => prev + 1)}
            onDecrease={() => setQuantity((prev: number) => Math.max(prev - 1, 1))}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
            mealId={meal.id}
            cartPrice={cartPrice}
            cartPriceSum={cartPriceSum}
            setPriceSum={setPriceSum}
            isUpdating={isUpdating}
            navigation={navigation}
            submitButtonStatus={submitButtonStatus}
            setReloadTrigger={setReloadTrigger}
            scale={scale}
            onClose={onClose}
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
  extrasTitle: { fontSize: 18, fontFamily: "Lexend_700Bold",
 },
});

export default CartMealDetails;
