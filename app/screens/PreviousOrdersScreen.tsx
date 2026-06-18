import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { List } from 'react-native-paper';
import { PreviousOrderCard } from '../components/PreviuosOrderCard';
import { formatEuropeanDateTime } from '../services/toEuropeanDate';
import { ScrollView, View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useCart } from '../cartContext';
import { removeData } from '../services/storageService';
import * as SecureStore from 'expo-secure-store';
import { CenteredLoading } from '../components/CenteredLoading';
import { safeFetch } from '../services/safeFetch';
import { backendUrl } from '@/localhostConf';
import { findMeal } from '../services/findMeal';
import { rebuildSelectedExtras } from '../services/rebuildSelectedExtras';
import Collapsible from 'react-native-collapsible';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Izdvojena pod-komponenta s React.memo kako bi se spriječilo re-renderiranje zatvorenih kartica
const OrderItem = React.memo(({ order, isExpanded, onExpand, handleRenew, handleDelete }: any) => {
  const handlePress = useCallback(() => onExpand(order.id), [order.id, onExpand]);

  const renderLeft = useCallback((props: any) => (
    <List.Icon {...props} icon="folder" color={isExpanded ? '#ffe521' : 'gray'} />
  ), [isExpanded]);

  const renderRight = useCallback(() => (
    <MaterialCommunityIcons 
      name={isExpanded ? "chevron-up" : "chevron-down"} 
      size={24} 
      style={{ alignSelf: 'center', marginRight: 8 }}
    />
  ), [isExpanded]);

  return (
    <View style={{ borderBottomWidth: 1, borderColor: '#e0e0e0' }}>
      <List.Item
        title={order.time ? formatEuropeanDateTime(order.time) : "Invalid Date"}
        left={renderLeft}
        right={renderRight}
        titleStyle={{ color: 'black', fontFamily: 'Lexend_700Bold' }}
        style={{ backgroundColor: '#f2f2f2' }}
        onPress={handlePress}
      />
      <Collapsible collapsed={!isExpanded} duration={300}>
        <View style={{ backgroundColor: '#fff', padding: 10 }}>
          {/* Ključna optimizacija: PreviousOrderCard se mounta SAMO kad je otvoren */}
          {isExpanded && (
            <PreviousOrderCard item={order} handleRenew={handleRenew} handleDelete={handleDelete}/>
          )}
        </View>
      </Collapsible>
    </View>
  );
});

export const PreviousOrdersScreen = ({ navigation, isCroatianLang, scale }: { navigation: any, isCroatianLang: boolean, scale: any }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { state: cartState, dispatch } = useCart();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  const extractProductId = useCallback((cartId: string) => {
    const match = cartId.match(/^ID\d+/);
    return match ? match[0] : null;
  }, []);

  const handleRenew = useCallback(async (id: string) => {
    const storageOrder = orders.find((order) => order.id === id);
    if (!storageOrder) return;

    dispatch({ type: 'CLEAR_CART' });

    try {
      const response = await safeFetch(`${backendUrl}/cjenik`);
      if (!response.ok) throw new Error('Price list fetch failed');

      const priceList = await response.json();

      for (const cartItem of storageOrder.cartItems) {
        const productId = extractProductId(cartItem.id);
        if (!productId) continue;

        const product = findMeal(priceList, productId);
        if (!product) continue;

        const selectedPortion = product.portions.find(
          (portion: any) => portion.size === cartItem.size || portion.size_en === cartItem.size
        );
        if (!selectedPortion) continue;

        const extrasListName = selectedPortion.extras;
        const extrasList = priceList["Prilozi"]?.[extrasListName];

        const updatedSelectedExtras = rebuildSelectedExtras(cartItem.selectedExtras, extrasList);
        let finalPrice = selectedPortion.price;

        for (const key of Object.keys(updatedSelectedExtras)) {
          finalPrice += updatedSelectedExtras[key];
        }

        await dispatch({
          type: 'ADD_TO_CART',
          payload: {
            id: cartItem.id,
            name: cartItem.name,
            description: cartItem.description,
            portionsOptions: product.portions,
            size: cartItem.size,
            price: finalPrice,
            quantity: cartItem.quantity,
            extras: cartItem.extras,
            selectedFriesExtras: cartItem.selectedFriesExtras || {},
            selectedExtras: updatedSelectedExtras,
            selectedDrinks: cartItem.selectedDrinks,
            type: cartItem.type,
            hasFries: cartItem.hasFries,
          },
        });
      }

      navigation.navigate('CartScreen', { storageOrder });
    } catch (error) {
      console.error("Order renew failed:", error);
    }
  }, [orders, dispatch, extractProductId, navigation]);
  
  const handleDelete = useCallback(async (id: string) => {
    try {
      await removeData(id);
      setRefresh(prev => !prev); 
    } catch (error) {
      console.error(`Failed to delete item with ID "${id}"`, error);
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadOrders = async () => {
      try {
        const storedKeys = await SecureStore.getItemAsync('order_keys');
        const keys = storedKeys ? JSON.parse(storedKeys) : [];
  
        const storedOrders = await Promise.all(
          keys.map(async (key: string) => {
            const value = await SecureStore.getItemAsync(key);
            return value ? { id: key, ...JSON.parse(value) } : null;
          })
        );
  
        if (isMounted) {
          // Sortiranje radimo odmah pri učitavanju podataka, a ne u renderu!
          const sorted = storedOrders
            .filter(Boolean)
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setOrders(sorted);
        }
      } catch (error) {
        console.error('Error loading orders', error);
      }
      if (isMounted) setLoading(false);
    };
  
    loadOrders();
    return () => { isMounted = false; }; // Sprječava memory leak ako se screen unmounta usred feča
  }, [refresh]);

  const handleExpanding = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

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
          source={{ uri: "https://static.lenskart.com/media/owndays/mobile/img/owndays/empty-cart.webp" }}
          style={styles.image}
        />
        <Text style={[styles.boldText, { fontSize: scale.light(22)}]}>{isCroatianLang? "Nemate prethodnih narudžbi": "You have no previous orders"}</Text>
        <Text style={[styles.lightText, { fontSize: scale.light(18)}]}>{isCroatianLang? "Naručite nešto po želji!": "Order something you like!"}</Text>
        <View style={{position: 'absolute', bottom: 20, width: '100%', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, { height: scale.light(60) }]}>
            <Text allowFontScaling={false} style={[styles.buttonText, { fontSize: scale.light(18)}]}>{isCroatianLang? "Natrag": "Back"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} removeClippedSubviews={true}>
      <List.Section style={{ marginVertical: 0, paddingVertical: 0 }}>
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            isExpanded={expandedId === order.id}
            onExpand={handleExpanding}
            handleRenew={handleRenew}
            handleDelete={handleDelete}
          />
        ))}
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  image: { width: 200, height: 200, marginBottom: 20 },
  boldText: { fontSize: 20, fontFamily: 'Lexend_700Bold', color: "#333", marginBottom: 10, textAlign: 'center' },
  lightText: { fontFamily: 'Lexend_400Regular', fontSize: 16, color: "#666", textAlign: 'center' },
  button: { marginBottom: 20, backgroundColor: "#ffd400", padding: 15, borderRadius: 5, width: "90%", alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 18, fontFamily: 'Lexend_700Bold', color: "#fff" },  
});