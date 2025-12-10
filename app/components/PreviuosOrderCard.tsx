
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Card, Divider } from "react-native-paper"
import { isCroatian } from "../services/languageChecker";
import { appButtonsDisabled, isClosedMessageDisplayed } from "../services/isAppClosed";
import { getDayOfTheWeek, getLocalTime, getYearMonthDay } from "../services/getLocalTime";
import { backendUrl } from "@/localhostConf";
import { useGeneral } from "../generalContext";
import { formatEuropeanDateTime } from '../services/toEuropeanDate';
import { safeFetch } from "../services/safeFetch";
import { io } from 'socket.io-client';

export const PreviousOrderCard = ({item, handleRenew, handleDelete}: any) => {
  const {general} = useGeneral();
  const isCroatianLang = isCroatian();
  const [order, setOrder] = useState<any>(null);
  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  
  console.log("fetched ",order);

  if (item.status !== "completed"){
    useEffect(() => {
  if (item.status !== 'completed') {
    const socket = io(backendUrl, {
      transports: ['websocket'],
    });

    const fetchOrder = async () => {
      try {
        const fullDateString = getYearMonthDay(item.time);
        const [year, month, day] = fullDateString.split('-');
        const response = await safeFetch(`${backendUrl}/orders/${year}/${month}/${day}/${item.id}`);

        if (!response.ok) throw new Error(`Error fetching order: ${response.statusText}`);

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      }
    };

    // Inicijalni fetch
    fetchOrder();

    // Slušanje samo ove narudžbe
    const eventName = `order-updated-${item.id}`;
    socket.on(eventName, (updatedOrder: any) => {
      console.log('📥 [Socket] Ažurirana narudžba:', updatedOrder);
      setOrder(updatedOrder);
    });

    return () => {
      socket.off(eventName);
      socket.disconnect();
    };
  }
}, [item]);
  
  }
  return (

  <View style={styles.content}>
    <Text style={styles.text}>{isCroatianLang ? 'Ime: ': 'Name: '}{item.name}</Text>
    <Text style={styles.text}>{isCroatianLang ? 'Telefon: ': 'Phone: '}{item.phone}</Text>
    {item.isDelivery && (               
        <Text style={styles.text}>{isCroatianLang ? 'Adresa: ': 'Address:'} {item.address}, {item.zone}</Text>
    )}
    <Text style={styles.text}>{isCroatianLang
      ? item.isDelivery ? 'Okvrino vrijeme dostave: ' : 'Okvirno vrijeme pripreme: '
      : item.isDelivery ? 'Estimated delivery time: ' : 'Estimated preparation time: '}
      {formatEuropeanDateTime(item.deadline).split(" ")[1]}
    </Text>
    <Text style={styles.text}>{isCroatianLang ? 'Cijena: ': 'Price:'} {item.totalPrice}€</Text>
    {item.note.length !== 0 && (<Text style={styles.text}>{isCroatianLang ? 'Napomena: ': 'Note:'} {String(item.note)}</Text>)}
    <Text style={[styles.text, styles.statusText]}>
      Status: {order ? (
        isCroatianLang ? 
          (order.status === "completed" ? "Dovršeno" : 
          order.status === "accepted" ? "Prihvaćeno" : 
          order.status === "rejected" ? "Odbijeno" : 
          order.status === "pending" ? "Čeka se odgovor" : 
          order.status) 
          : order.status
      ) : ""}
    </Text>
    <Divider style={styles.divider} />
    {item.cartItems && item.cartItems.map((cartItem: any) => (
    <View key={cartItem.id}>
      <Text style={styles.cartItemText}>
        {cartItem.quantity} x {cartItem.name.split("|")[isCroatianLang ? 0 : 1]}
        {cartItem.size !== 'null' && (
        <Text style={styles.sizeText}> ({!isCroatianLang? 
          cartItem.size === "Mala" || cartItem.size === "Mali" ? "Small" :
          cartItem.size === "Velika" || cartItem.size === "Veliki" ? "Big" :
          cartItem.size === "Jumbo" ? "Jumbo" :
          cartItem.size : cartItem.size })</Text>
        )}
      </Text>
      {Object.keys(cartItem.selectedExtras).length !== 0 && (
      <Text style={styles.selectedExtrasText}>
        {Object.entries(cartItem.selectedExtras).map(([extra, quantity], extraIndex) => (
        <Text key={extraIndex} style={{fontFamily: 'Lexend_400Regular'}}>
          {extra.split('|')[isCroatianLang ? 0 : 1]}
          {extraIndex < Object.entries(cartItem.selectedExtras).length - 1 && ', '}
        </Text>
        ))}
      </Text>
      )}
      {Object.keys(cartItem.selectedDrinks).length !== 0 && (
      <Text style={styles.selectedExtrasText}>
        {Object.entries(cartItem.selectedDrinks).map(([drink, value], drinkIndex) => (
        <Text key={drinkIndex} style={{fontFamily: 'Lexend_400Regular'}}>
          {isCroatianLang ? (value as any).ime : (value as any).ime_en}
          {drinkIndex < Object.entries(cartItem.selectedDrinks).length - 1 && ', '}
        </Text>
        ))}
      </Text>
      )}
    </View>
    ))}
    <View style={styles.buttonContainer}>
        {/* <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            style={styles.leftButton}
        >
            <MaterialIcons name="delete" size={30} color="red" />
        </TouchableOpacity> */}
        <TouchableOpacity
            onPress={() => handleRenew(item.id)}
            style={[styles.rightButton, appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays) && styles.disabledButton]}
            disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays)} 
        >
            <Text style={[styles.buttonText, appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays) && styles.disabledText]}>{isCroatianLang ? "Ponovi narudžbu!" : "Renew order!"}</Text>
        </TouchableOpacity>
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
        backgroundColor: '#fff',
      },
      buttonContainer: {
        flexDirection: 'row',
        display: 'flex',
        marginTop: 10,
      },
      leftButton: {
        borderColor: 'red',
        borderWidth: 2,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',  
        alignItems: 'center',      
      },
      rightButton: {
        marginHorizontal: 5,
        borderColor: '#ffd400',
        borderWidth: 2,
        flex: 5,
        borderRadius: 5,
        justifyContent: 'center', 
        alignItems: 'center',  
      },      
      buttonText: {
        color: '#ffd400',
        fontSize: 20,
        paddingVertical: 15,
        fontFamily: 'Lexend_400Regular',
      },
      text: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'Lexend_400Regular',
      },
      statusText: {
        color: 'gray',
      },
      divider: {
        marginVertical: 10,
      },
      cartItemText: {
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'Lexend_700Bold',
      },
      sizeText: {
        fontFamily: 'Lexend_400Regular',
      },
      selectedExtrasText: {
        paddingLeft: 1,
        marginBottom: 5,
      },
      disabledButton: {
        borderColor: '#B0BEC5', // Disabled background color
        opacity: 0.6, // Reduce opacity for disabled state
      },
      disabledText: {
        color: '#B0BEC5', // Light grey text when disabled
      }
    });