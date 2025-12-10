import React, { useEffect, useState } from 'react';
import { List } from 'react-native-paper';
import { PreviousOrderCard } from '../components/PreviuosOrderCard';
import { formatEuropeanDateTime } from '../services/toEuropeanDate';
import { ScrollView, View, Image, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useCart } from '../cartContext';
import { removeData } from '../services/storageService';
import * as SecureStore from 'expo-secure-store';
import { CenteredLoading } from '../components/CenteredLoading';

export const PreviousOrdersScreen = ({ navigation, isCroatianLang, scale }: { navigation: any, isCroatianLang: boolean, scale: any }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { state: cartState, dispatch } = useCart();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRenew = (id: string) => {
    const storageOrder = orders.find((order) => order.id === id);
    dispatch({
        type: 'CLEAR_CART',
    });
    storageOrder.cartItems.forEach((cartItem: any) => {
      dispatch({
          type: 'ADD_TO_CART',
          payload: {
          id: cartItem.id, 
          name: cartItem.name,
          description: cartItem.description,
          portionsOptions: cartItem.portionsOptions,
          size: cartItem.size,
          price: cartItem.price,
          quantity: cartItem.quantity,
          extras: cartItem.extras,
          selectedExtras: cartItem.selectedExtras,
          selectedDrinks: cartItem.selectedDrinks,
          type: cartItem.type,
          },
      });
    });
    navigation.navigate('CartScreen', { storageOrder });
  };
  
  const handleDelete = async (id: string) => {
    try {
      await removeData(id);
      console.log(`Item with ID "${id}" has been removed.`);
      setRefresh(prev => !prev); // Toggle state to trigger a re-render
    } catch (error) {
      console.error(`Failed to delete item with ID "${id}"`, error);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    const loadOrders = async () => {
      try {
        // Since SecureStore doesn't support getting all keys, store an index manually
        const storedKeys = await SecureStore.getItemAsync('order_keys');
        const keys = storedKeys ? JSON.parse(storedKeys) : [];
  
        const storedOrders = await Promise.all(
          keys.map(async (key: string) => {
            const value = await SecureStore.getItemAsync(key);
            return value ? { id: key, ...JSON.parse(value) } : null;
          })
        );
  
        setOrders(storedOrders.filter(Boolean));
      } catch (error) {
        console.error('Error loading orders', error);
      }
  
      setLoading(false);
    };
  
    loadOrders();
  }, [refresh]);

  const handleExpanding = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CenteredLoading />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://static.lenskart.com/media/owndays/mobile/img/owndays/empty-cart.webp",
          }}
          style={styles.image}
        />
        <Text style={[styles.boldText, { fontSize: scale.light(22)}]}>{isCroatianLang? "Nemate prethodnih narudžbi": "You have no previous orders"}</Text>
        <Text style={[styles.lightText, { fontSize: scale.light(18)}]}>{isCroatianLang? "Naručite nešto po želji!": "Order something you like!"}</Text>
        <View style={{position: 'absolute', bottom: 20, width: '100%', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button, { height: scale.light(60) }]}
          >
            <Text allowFontScaling={false} style={[styles.buttonText, { fontSize: scale.light(18)}]}>{isCroatianLang? "Natrag": "Back"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <List.Section style={{ marginVertical: 0, paddingVertical: 0 }}>
        {orders
          .sort((a, b) => {
            const timeA = new Date(a.time);  // Ensure it's a Date object
            const timeB = new Date(b.time);  // Ensure it's a Date object
            return timeB as any - (timeA as any);  // Compare the timestamps
          })
          .map((order) => (
          <List.Accordion
            key={order.id}
            title={order.time ? formatEuropeanDateTime(order.time) : "Invalid Date"}
            left={(props) => <List.Icon {...props} icon="folder" />}
            expanded={expandedId === order.id}
            onPress={() => handleExpanding(order.id)}
            theme={{ colors: { primary: '#ffe521' } }}
            titleStyle={{ color: 'black', fontFamily: 'Lexend_700Bold' }}
            style={{ backgroundColor: '#f2f2f2' }}  // Grayish background
          >
            <PreviousOrderCard item={order} handleRenew={handleRenew} handleDelete={handleDelete}/>
            
          </List.Accordion>
        ))}
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  boldText: {
    fontSize: 20,
    fontFamily: 'Lexend_700Bold',
    color: "#333",
    marginBottom: 10,
    textAlign: 'center',
  },
  lightText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
  },
  button: {
    marginBottom: 20,
    backgroundColor: "#ffd400",
    padding: 15,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    color: "#fff",
  },  
});