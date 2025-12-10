import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isCroatian } from '../services/languageChecker';
import * as Haptics from "expo-haptics"; 
import { appButtonsDisabled } from '../services/isAppClosed';
import { useGeneral } from '../generalContext';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';
import { Platform } from 'react-native';

const Counter = ({ isCroatianLang, quantity, onIncrease, onDecrease, handleAddToCart, handleRemoveFromCart, mealId = "", cartPrice, cartPriceSum, setPriceSum, isUpdating, navigation, scale, submitButtonStatus = "Dodaj", setReloadTrigger=() => {console.log("reloadTrigger")}, onClose }: any) => {
  const {general} = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  console.log("submitButtonStatus", submitButtonStatus, isCroatianLang)



  return (
    <View style={{ flexDirection: "row", height: scale.light(60), width: "100%", bottom: 14}}>
      <View style={[{ marginLeft: 4, flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", backgroundColor: '#fff', borderColor: '#ffd400', borderWidth: 2, margin: scale.isTablet() && scale.light(4), borderRadius: 5}, appButtonsDisabled(general?.appStatus ,general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterButton]}>
        <TouchableOpacity 
          onPress={() => {
            onDecrease(); 
            setPriceSum((prev: number) => prev -= cartPrice);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            }} 
          disabled={quantity <= 1} 
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={[{ opacity: quantity <= 1 ? 0.5 : 1}]}
        >
          <MaterialIcons name="remove" size={scale.light(28)} color="#ffd400" style={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText}/>
        </TouchableOpacity>
        <Text style={[{ fontFamily: "Lexend_700Bold" ,fontSize: scale.light(16), color: "#ffd400" }, , appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText]}>{quantity}</Text>
        <TouchableOpacity 
          onPress={() => { 
            onIncrease(); 
            setPriceSum((prev: number) => prev += cartPrice);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }          
          }} 
          disabled={quantity >= 20 || appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)} 
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={[{ opacity: quantity >= 20 ? 0.5 : 1}]}
        >
          <MaterialIcons name="add" size={scale.light(28)} color="#ffd400" style={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledCounterText}/>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        onPress={() => {
          if (!isUpdating) {
            if(submitButtonStatus === "Dodaj") {
              handleAddToCart();
            }
            if(submitButtonStatus === "Ukloni") {
              handleRemoveFromCart(mealId);
              onClose();
            }
            if (submitButtonStatus === "Ažuriraj") {
              handleRemoveFromCart(mealId);
              handleAddToCart();
              setReloadTrigger((prev: number) => prev + 1);
              onClose();
            }
          }
        }} 
        disabled={isUpdating || appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)} 
        style={[
          {
            marginRight: 4,
            flex: 2,
            backgroundColor: submitButtonStatus !== "Ukloni" ? '#ffd400' : '#DA291C',
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            margin: scale.isTablet() && scale.light(4),
            marginLeft: !scale.isTablet() ? 10 : undefined
          },
          appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledButton
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[
            {
              fontSize: scale.light(14),
              marginBottom: scale.light(2),
              marginTop: scale.light(2),
              fontFamily: "Lexend_700Bold",
              color: '#fff'
            },
            appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledText
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
                marginTop: -2,
                fontSize: scale.light(16),
                fontFamily: "Lexend_700Bold",
                color: '#fff'
              },
              appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledText
            ]}
          >
            {(cartPrice * quantity).toFixed(2)} €
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
