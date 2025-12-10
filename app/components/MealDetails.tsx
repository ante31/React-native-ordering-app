import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native";
import Counter from './Counter';
import ExtrasList from './ExtrasList';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCart } from "../cartContext";
import SizesList from "./SizesList";
import { backendUrl } from "../../localhostConf";
import { useToast } from "react-native-toast-notifications";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "./CenteredLoading";
import { useGeneral } from '../generalContext';
import { safeFetch } from "../services/safeFetch";
import DrinksList from "./DrinksList";
import SaucesList from "./SaucesList";
import ParallaxScroll from '@monterosa/react-native-parallax-scroll';

const MealDetails = ({ visible, globalMeal, drinks={}, scale, onClose, navigation }: any) => {
  const [meal, setLocalData] = useState(globalMeal);

  useEffect(() => {
      console.log('Modal visible:', visible, 'globalMeal:', globalMeal);

  // Kad se modal otvori, postavi trenutne podatke u local state modala
  if (visible) {
    setLocalData(globalMeal);
  }
}, [visible, globalMeal]);

  
  const isCroatianLang = isCroatian();


  const [extras, setExtras] = useState<{ [key: string]: string }>({});
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState(meal ? isCroatianLang? meal.portions[0].size: meal.portions[0].size_en : "");
  const [selectedSauce, setSelectedSauce] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartPrice, setPrice] = useState(meal ? meal.portions[0].price : 0); 
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});
  const [sauces, setSauces] = useState<{ [key: string]: number }>({});
  const [selectedDrinks, setSelectedDrinks] = useState<any>([]);
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [saucesLoading, setSaucesLoading] = useState(meal.saucesList === true ? true : false);
  const { general } = useGeneral();


  const toast = useToast();

  useEffect(() => {    console.log("isUpdating", isUpdating);

  }, [isUpdating]);

  const { state, dispatch } = useCart();

  useEffect(() => {
    if (meal) {
        const newSize = isCroatianLang ? meal.portions[0].size : meal.portions[0].size_en;
        setSelectedSize(newSize);
    } else {
        setSelectedSize("");
    }
}, [meal, isCroatianLang]);

  const handleAddToCart = () => {
    let drinksToAdd = selectedDrinks ?? [];
    const remainingSlots = meal.maxDrinks - drinksToAdd.length;

    if (remainingSlots > 0) {
      const defaultDrink = drinks["ID70"];
      if (defaultDrink) {
        const drinkWithId = { id: "ID70", ...defaultDrink };
        const defaultDrinksToAdd = Array(remainingSlots).fill(drinkWithId);
        drinksToAdd = [...drinksToAdd, ...defaultDrinksToAdd];
        setSelectedDrinks(drinksToAdd); // update UI
      }
    }

    const uniqueId = `${meal.id}` +
  `${Object.entries(selectedExtras)
    .map(([key]) => `_${key.split('|')[0].replace(/\s+/g, '')}`)
    .sort()
    .join('')}` +
  `${drinksToAdd
    .map((drink: any) => drink.ime.replace(/\s+/g, ''))
    .sort()
    .join('')}`;


    console.log("unique", uniqueId);

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: uniqueId,
        name: `${meal.ime}|${meal.ime_en}`, 
        description: `${meal.opis}|${meal.opis_en}`,
        size: selectedSize,
        price: cartPriceSum / quantity,
        quantity: quantity,
        extras: meal.portions[selectedPortionIndex].extras,
        selectedExtras: selectedExtras,
        selectedDrinks: drinksToAdd,
        portionsOptions: meal.portions,
        type: meal.type,
      },
    });

    if (onClose) onClose();

    setTimeout(() => {
      toast.show(isCroatianLang ? "Dodano u košaricu" : "Added to cart", {
        type: "danger",
        placement: "bottom",
        duration: 1200,
      });
    }, 400);
  };

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
        setExtrasLoading(false);
      } catch (error) {
        console.error('Error fetching extras:', error);
        setExtrasLoading(false);
      }
    } else {
      setExtras({});
      setSelectedExtras({});
      setExtrasLoading(false);
    }
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

  useEffect(() => {
    fetchExtras();
    if(meal.saucesList === true) {
      fetchSauces();
    }
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
        {extrasLoading || saucesLoading ?
        ( <CenteredLoading /> )
        : (
          <>
        <ScrollView style = {{marginBottom: 12}}>
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
            {meal.saucesList === true && (
              <SaucesList
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
            {meal.portions[0].extras !== "null" && (
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
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
            {(meal.type === "sodas" || meal.type === "drinks") && (
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
