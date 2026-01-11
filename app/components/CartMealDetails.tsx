import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Counter from './Counter';
import ExtrasList from './ExtrasList'; // Import the new component
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCart } from "../cartContext";
import SizesList from "./SizesList";
import { backendUrl } from "../../localhostConf";
import { useToast } from "react-native-toast-notifications";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "./CenteredLoading";
import { safeFetch } from "../services/safeFetch";
import DrinksList from "./DrinksList";
import SaucesList from "./SaucesList";
import { useGeneral } from "../generalContext"; 

const CartMealDetails = ({ visible, meal, drinks = {}, scale, onClose, handleRemoveFromCart, navigation }: any) => {
  console.log("CartMealDetailsmeal", meal);
    const {general} = useGeneral();
  
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
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>(meal.selectedExtras || {});
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [saucesLoading, setSaucesLoading] = useState(meal.saucesList === true ? true : false);
  const [submitButtonStatus, setSubmitButtonStatus] = useState("");
  const [selectedDrinks, setSelectedDrinks] = useState<any>(meal.selectedDrinks || []);
  const [sauces, setSauces] = useState<{ [key: string]: number }>({});

console.log("Selected extras in CartMealDetails:", selectedExtras);

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

      const drinksChanged = () => {
        const initialDrinks = initialMeal.selectedDrinks || [];
        const currentDrinks = selectedDrinks || [];

        if (initialDrinks.length !== currentDrinks.length) return true;

        for (let i = 0; i < initialDrinks.length; i++) {
          if (initialDrinks[i]?.id !== currentDrinks[i]?.id) return true;
        }

        return false;
      };

      if (
        initialMeal.size !== selectedSize ||
        initialMeal.quantity !== quantity ||
        extrasChanged() ||
        drinksChanged()
      ) {
        setSubmitButtonStatus("Ažuriraj");
      } else {
        setSubmitButtonStatus("Ukloni");
      }
    };

    submitButtonStatusCheck();
  }, [selectedSize, selectedPortionIndex, selectedExtras, selectedDrinks, quantity, meal]);

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

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: uniqueId, // Pretpostavka: meal ima ID
        name: meal.name, 
        description: meal.description,
        size: selectedSize,
        price: cartPrice,
        quantity: quantity,
        extras: meal.portionsOptions[selectedPortionIndex].extras,
        selectedExtras: selectedExtras,
        selectedDrinks: selectedDrinks,
        portionsOptions: meal.portionsOptions,
        type: meal.type,
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

    const fetchSauces = async () => {
      try {
        console.log("A fetch happened");
        const response = await safeFetch(`${backendUrl}/cjenik/Prilozi/listaSalateUmaci`);
        const data = await response.json();
  
        setSauces(data); // update base prices
        setSaucesLoading(false);
      } catch (error) {
        console.error('Error fetching extras:', error);
        setSaucesLoading(false);
      }
    };

    const fetchExtras = async () => {
      if (meal.portionsOptions[selectedPortionIndex]?.extras != "null") {
        try {
          console.log("A fetch happened");
          const response = await safeFetch(`${backendUrl}/cjenik/Prilozi/${meal.portionsOptions[selectedPortionIndex]?.extras}`);
          const data = await response.json();

          setExtras(data);

          

          if (meal.extras !== "listaSalate") {
            // 🔁 Update selectedExtras with new prices from fetched extras
            const updatedSelectedExtras = Object.keys(selectedExtras).reduce((acc: { [key: string]: number }, key) => {
            if (data.hasOwnProperty(key)) {
              // ⛔️ Ako je originalna korisnička vrijednost bila 0.2, NE mijenjaj je
              if (selectedExtras[key] === general?.extras.penalty) {
                acc[key] = selectedExtras[key]; // zadrži korisnički iznos
              } else {
                acc[key] = data[key]; // zamijeni s novom cijenom
              }
            }
            return acc;
            }, {});

            setSelectedExtras(updatedSelectedExtras); // update selected ones with new prices
          }
          setExtrasLoading(false); 
        } catch (error) {
          console.error('Error fetching extras:', error);
          setExtrasLoading(false); 
        }
        }
      else {
        setExtrasLoading(false); // Set loading to false if no extras
      }
    };

  useEffect(() => {
    
  
    console.log("selectedPortionIndex", selectedPortionIndex); // Check if extras update correctly here
  
    if (meal.extras === "listaSalate") {
      fetchSauces();
    }
    fetchExtras();
  }, [meal.portionsOptions[selectedPortionIndex]?.extras, selectedPortionIndex]); 
  
  console.log("Selected extras in cart:", selectedExtras);


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
        {saucesLoading || extrasLoading ?
        ( <CenteredLoading /> )
        : (
          <>
          <ScrollView style={{ marginBottom: 13 }}>
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
            {meal.extras === "listaSalate" && (
              <SaucesList
                isCroatianLang={isCroatianLang}
                meal={meal}
                extras={sauces}
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
            {Object.keys(extras).length > 0 && meal.portionsOptions[0].extras !== "null" && (
              <ExtrasList
                isCroatianLang={isCroatianLang}
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
            {selectedDrinks.length > 0 && (
              <DrinksList
                drinks={drinks}
                drinksType={meal.type}
                drinksMax={meal.maxDrinks}
                selectedDrinks={selectedDrinks}
                setSelectedDrinks={setSelectedDrinks}
                isUpdating={isUpdating}
                isCroatianLang={isCroatianLang}
                scale={scale}
              />
            )}
          </ScrollView>
          <Counter
           isCroatianLang={isCroatianLang}
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
