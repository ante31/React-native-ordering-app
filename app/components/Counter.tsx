import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isCroatian } from '../services/languageChecker';
import * as Haptics from "expo-haptics"; 
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';
import { Platform } from 'react-native';

const Counter = ({ quantity, onIncrease, onDecrease, handleAddToCart, handleRemoveFromCart, mealId = "", cartPrice, cartPriceSum, setPriceSum, isUpdating, navigation, submitButtonStatus = "Dodaj", setReloadTrigger=() => {console.log("reloadTrigger")} }: any) => {
  const {general} = useGeneral();
  const isCroatianLang = isCroatian();
  const { height, width } = Dimensions.get('window');
  const dynamicHeight = width > 600 ? 70 : 70; // Adjust for small screens
  const dynamicFontSize = width > 600 ? 18 : 14;
  console.log(width, dynamicFontSize)
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  console.log("submitButtonStatus", submitButtonStatus)



  return (
    <View style={{ flexDirection: "row", height: dynamicHeight, width: "100%" }}>
      <View style={[{ flex: 1.4, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", backgroundColor: '#fff', borderColor: '#FFC72C', borderWidth: 1, marginRight: 8, borderRadius: 5}, appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterButton]}>
        <TouchableOpacity 
          onPress={() => {
            onDecrease(); 
            setPriceSum((prev: number) => prev -= cartPrice);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            }} 
          disabled={quantity <= 1} 
          style={[{ opacity: quantity <= 1 ? 0.5 : 1}]}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 25 }}>
            <MaterialIcons name="remove" size={dynamicFontSize*2} color="#FFC72C" style={appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText}/>
          </View>
        </TouchableOpacity>
        <Text style={[{ fontSize: dynamicFontSize + 2, color: "#FFC72C", fontWeight: "bold" }, , appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText]}>{quantity}</Text>
        <TouchableOpacity 
          onPress={() => { 
            onIncrease(); 
            setPriceSum((prev: number) => prev += cartPrice);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }          
          }} 
          disabled={quantity >= 20 || appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays)} 
          style={[{ opacity: quantity >= 20 ? 0.5 : 1}]}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 25 }}>
            <MaterialIcons name="add" size={dynamicFontSize*2} color="#FFC72C" style={appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText}/>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        onPress={() => {
          if (!isUpdating) {
            if(submitButtonStatus === "Dodaj")
              handleAddToCart()
            if(submitButtonStatus === "Ukloni") 
              handleRemoveFromCart(mealId);
            if (submitButtonStatus === "Ažuriraj") {
              handleRemoveFromCart(mealId);
              handleAddToCart();
              setReloadTrigger((prev: number) => prev + 1);
            }
          }
        }} 
        disabled={isUpdating || appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays)} 
        style={[
          {
            flex: 2,
            backgroundColor: submitButtonStatus !== "Ukloni" ? '#FFC72C' : '#DA291C',
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          },
          appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledButton
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[
            {
              fontSize: dynamicFontSize,
              fontWeight: 'bold',
              color: '#fff'
            },
            appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledText
          ]}
        >
        {submitButtonStatus === "Dodaj" &&
          (isCroatianLang ? "Dodaj u narudžbu!" : "Add to order!")}

        {submitButtonStatus === "Ukloni" &&
          (isCroatianLang ? "Ukloni iz košarice" : "Remove from cart")}

        {submitButtonStatus === "Ažuriraj" &&
          (isCroatianLang ? "Ažuriraj narudžbu" : "Update order")}

        </Text>
        {(submitButtonStatus !== "Dodaj" || submitButtonStatus !== "Ažuriraj") && (
          <Text
            style={[
              {
                fontSize: dynamicFontSize,
                color: '#fff'
              },
              appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledText
            ]}
          >
            {cartPriceSum.toFixed(2)} €
          </Text>
        )}
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  disabledCounterButton: {
    borderColor: '#B0BEC5', 
    opacity: 0.6, 
  },
  disabledCounterText: {
    color: '#B0BEC5', 
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    opacity: 0.6, 
  },
  disabledText: {
    color: '#fff', 
  }
});

export default Counter;
