  import { Dimensions } from "react-native";
  import { Meal } from "../models/mealModel";
  import { PixelRatio, Platform } from "react-native";
  
  export const getModalHeight = (meal: Meal | null) => {
    const isAndroid = Platform.OS === 'android';

    const fontScale = PixelRatio.getFontScale();
    
    const { height } = Dimensions.get('screen');
    if (!meal) return height * 0.7; // edge case koji se nece dogodit
    const isLargeFont = fontScale > 1.8;
    const isMediumLargeFont = fontScale > 1.6;
    const isMediumFont = fontScale > 1.4;
    const isSmallFont = fontScale > 1.2;

    return meal.portions?.[0]?.extras === "null" // prilozi i sokovi (nemaju dodadnih priloga pa ce im modal height bit mal)
      ? (
        isLargeFont ? (isAndroid ? "31%" : 300) :
        isMediumLargeFont ? (isAndroid ? "28%" : 280) :
        isMediumFont ? (isAndroid ? "26%" : 250) :
        isSmallFont ? (isAndroid ? "24%" : 230) :
        (isAndroid ? "25%" : 200)
      )
    : meal.portions?.[0]?.extras === "listaPomfrit"
    ? "45%" // pomfrit ima malu listu priloga
    : "80%"; // najcesci case

};
