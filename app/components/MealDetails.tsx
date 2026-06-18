import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Counter from './Counter';
import ExtrasList from './ExtrasList';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCart } from "../cartContext";
import SizesList from "./SizesList";
import { useToast } from "react-native-toast-notifications";
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "./CenteredLoading";
import DrinksList from "./DrinksList";
import SaucesList from "./SaucesList";
import FriesExtrasList from "./FriesExtrasList";
import { calculateNewPrice } from "../services/calculateNewPrice";
import { useMealDetails } from "../../hooks/useMealDetails";

const MealDetails = ({ visible, globalMeal, menu, scale, onClose, navigation, isCroatianLang }: any) => {
  const [meal, setLocalData] = useState(globalMeal);
  
  useEffect(() => {

  // Kad se modal otvori, postavi trenutne podatke u local state modala
  if (visible) {
    setLocalData(globalMeal);
  }
}, [visible, globalMeal]);

  

  const [extras, setExtras] = useState<{ [key: string]: string }>((menu as any)["Prilozi"][meal.portions[0].extras] || {});
  const [friesExtras, setFriesExtras] = useState<{ [key: string]: string }>((menu as any)["Prilozi"]["listaPomfrit"] || {});
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState(meal ? isCroatianLang? meal.portions[0].size: meal.portions[0].size_en : "");
  const [quantity, setQuantity] = useState(1);
  const [cartPrice, setPrice] = useState(meal ? meal.portions[0].price : 0); 
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});
  const [selectedFriesExtras, setSelectedFriesExtras] = useState<{ [key: string]: number }>({});
  const [sauces, setSauces] = useState<{ [key: string]: string }>((menu as any)["Prilozi"]["listaSalateUmaci"] || {});
  const [selectedDrinks, setSelectedDrinks] = useState<any>([]);
  const [cartPriceSum, setPriceSum] = useState(cartPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const stuff = useMealDetails();

  const toast = useToast();


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
    if (isUpdating) {
      return;
    }
    let drinksToAdd = selectedDrinks ?? [];
    const remainingSlots = meal.maxDrinks - drinksToAdd.length;

    if (remainingSlots > 0) {
      const defaultDrink = (menu as any)["Piće"]?.["ID70"];
      if (defaultDrink) {
        const drinkWithId = { id: "ID70", ...defaultDrink };
        const defaultDrinksToAdd = Array(remainingSlots).fill(drinkWithId);
        drinksToAdd = [...drinksToAdd, ...defaultDrinksToAdd];
        setSelectedDrinks(drinksToAdd);
      }
    }

    const uniqueId = `${meal.id}` +
    `${selectedSize}` +
    `${Object.entries(selectedExtras)
      .map(([key]) => `_${key.split('|')[0].replace(/\s+/g, '')}`)
      .sort()
      .join('')}` +
    `${drinksToAdd
      .map((drink: any) => drink.ime.replace(/\s+/g, ''))
      .sort()
      .join('')}`;

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
        selectedFriesExtras: selectedFriesExtras,
        selectedDrinks: drinksToAdd,
        portionsOptions: meal.portions,
        type: meal.type,
        hasFries: meal.hasFries,
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

  useEffect(() => {
    calculateNewPrice(selectedExtras, selectedFriesExtras, selectedSize, selectedPortionIndex, meal, quantity, setIsUpdating, setPrice, setPriceSum);
  }, [selectedExtras, selectedFriesExtras, selectedSize, quantity]);

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
        {false ?
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
                quantity={quantity}
                selectedPortionIndex={selectedPortionIndex}
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
            {meal.portions[0].extras !== "null" && (
              <ExtrasList
                isCroatianLang={isCroatianLang}
                extras={extras}
                selectedExtras={selectedExtras}
                setSelectedExtras={setSelectedExtras}
                setIsUpdating={setIsUpdating}
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
            {(meal.hasFries) && (
              <FriesExtrasList
                isCroatianLang={isCroatianLang}
                meal={meal}
                extras={friesExtras}
                selectedExtras={selectedFriesExtras}
                setSelectedExtras={setSelectedFriesExtras}
                quantity={quantity}
                selectedPortionIndex={selectedPortionIndex}
                isUpdating={isUpdating}
                scale={scale}
              />
            )}
            {(meal.type === "sodas" || meal.type === "drinks") && (
              <DrinksList
                drinks={(menu as any)["Piće"] || {}}
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
            setIsUpdating={setIsUpdating}
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
