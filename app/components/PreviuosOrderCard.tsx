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

export const PreviousOrderCard = ({item, handleRenew, handleDelete}: any) => {
  const {general} = useGeneral();
  const isCroatianLang = isCroatian();
  const [order, setOrder] = useState<any>(null);
  const dayOfWeek = getDayOfTheWeek(getLocalTime());
  
  console.log("fetched ",order);

  if (item.status !== "completed"){
    useEffect(() => {
      if (item.status !== "completed") {
        const fetchOrders = async () => {
          try {
            const fullDateString = getYearMonthDay(item.time);
            const [year, month, day] = fullDateString.split("-");
            const response = await fetch(`${backendUrl}/orders/${year}/${month}/${day}/${item.id}`);
    
            if (!response.ok) throw new Error(`Error fetching orders: ${response.statusText}`);
    
            const data = await response.json();
            setOrder(data);
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchOrders(); // Initial fetch
        const interval = setInterval(fetchOrders, 30000); // Fetch every 60s
    
        return () => clearInterval(interval);
      }
    }, [item]);
  
  }
  return (

  <View style={styles.content}>
    <Text style={styles.text}>{isCroatianLang ? 'Ime: ': 'Name: '}{item.name}</Text>
    <Text style={styles.text}>{isCroatianLang ? 'Telefon: ': 'Phone: '}{item.phone}</Text>
    <Text style={styles.text}>{!item.isDelivery ? isCroatianLang ? 'Preuzimanje': 'Pickup' : isCroatianLang ? 'Dostava': 'Delivery'}</Text>
    {item.isDelivery && (               
        <Text style={styles.text}>{isCroatianLang ? 'Adresa: ': 'Address:'} {item.address}, {item.zone}</Text>
    )}
    {item.note.length !== 0 && (<Text style={styles.text}>Napomena: {String(item.note)}</Text>)}
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
          cartItem.size === "Mala" ? "Small" :
          cartItem.size === "Velika" ? "Big" :
          cartItem.size === "Jumbo" ? "Jumbo" :
          cartItem.size : cartItem.size })</Text>
        )}
      </Text>
      {Object.keys(cartItem.selectedExtras).length !== 0 && (
      <Text style={styles.selectedExtrasText}>
        {Object.entries(cartItem.selectedExtras).map(([extra, quantity], extraIndex) => (
        <Text key={extraIndex}>
          {extra.split('|')[isCroatianLang ? 0 : 1]}
          {extraIndex < Object.entries(cartItem.selectedExtras).length - 1 && ', '}
        </Text>
        ))}
      </Text>
      )}
    </View>
    ))}
    <View style={styles.buttonContainer}>
        <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            style={styles.leftButton}
        >
            <MaterialIcons name="delete" size={30} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => handleRenew(item.id)}
            style={[styles.rightButton, appButtonsDisabled(general?.workTime[dayOfWeek]) && styles.disabledButton]}
            disabled={appButtonsDisabled(general?.workTime[dayOfWeek])} 
        >
            <Text style={[styles.buttonText, appButtonsDisabled(general?.workTime[dayOfWeek]) && styles.disabledText]}>{isCroatianLang ? "Ponovi narudžbu!" : "Renew order!"}</Text>
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
        justifyContent: 'center',  // Center text vertically
        alignItems: 'center',      // Center text horizontally
      },
      rightButton: {
        marginHorizontal: 5,
        borderColor: '#FFC72C',
        borderWidth: 2,
        flex: 5,
        borderRadius: 5,
        justifyContent: 'center',  // Center text vertically
        alignItems: 'center',      // Center text horizontally
      },      
      buttonText: {
        color: '#FFC72C',
        fontSize: 20,
        paddingVertical: 15,
      },
      text: {
        fontSize: 16,
        marginBottom: 5,
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
        fontWeight: 'bold',
      },
      sizeText: {
        fontWeight: 'normal',
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