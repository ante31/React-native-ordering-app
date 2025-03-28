import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import { Image, TouchableOpacity, StatusBar, View, Text, StyleSheet } from 'react-native';
import CartScreen from './screens/CartScreen';
import { CartProvider } from './cartContext';
import NewScreen from './screens/NewScreen';
import CartIcon from './components/CartIcon';
import OrderScreen from './screens/OrderScreen';
import { ToastProvider } from "react-native-toast-notifications";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PreviousOrdersScreen } from './screens/PreviousOrdersScreen';
import { isCroatian } from './services/languageChecker';
import ThankYouScreen from './screens/ThankYouScreen';
import { Modal, Portal, Provider, Button } from 'react-native-paper';
import {MD3LightTheme} from 'react-native-paper'
import { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { GeneralProvider } from './generalContext';
import ClosedAppModal from './components/closedAppModal';

const Stack = createNativeStackNavigator();

export default function App() {
  
  const isCroatianLanguage = isCroatian();

  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
  

      // Show the notification in the system tray (even when in the foreground)
      Notifications.presentNotificationAsync({
        title: notification.request.content.title, // Directly use title
        body: notification.request.content.body,   // Directly use body
        data: notification.request.content.data,   // Custom data if needed
        sound: 'default',                          // Optional: set sound if you want
        priority: 'high',                          // Optional: set priority
      });
    });

    // Listener for when the user taps on the notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped on notification:', response);
      // Handle the tap (e.g., navigate to a specific screen)
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <ToastProvider
    dangerColor="#FFC72C"
    offsetBottom={40}
    swipeEnabled={true}
    >
      <GeneralProvider>
        <CartProvider>
          <Provider theme={MD3LightTheme}>
            <StatusBar
              backgroundColor="#000000" 
              barStyle="light-content" 
            />

            {/* Modal displayed when time surpasses 23:00 */}
            <ClosedAppModal isCroatianLanguage={isCroatianLanguage} />
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen
                name="Home"
                component={HomePage}
                options={({ navigation }) => ({
                  title: 'Gricko',
                  headerTitleAlign: 'center',
                  headerBackTitleVisible: false,
                  headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* File Icon */}
                      <TouchableOpacity 
                        onPressOut={() => {
                          navigation.navigate('PreviousOrdersScreen')}}
                        activeOpacity={0.7}
                        style={{ padding: 10 }}
                      >
                        <Ionicons name="document-text-outline" size={28} color="black" />
                      </TouchableOpacity>
                      {/* Cart Icon */}
                      <TouchableOpacity 
                        onPressOut={() => {
                          navigation.navigate('CartScreen')}}
                        activeOpacity={0.7}
                        style={{ padding: 10 }}
                      >
                        <CartIcon navigation={navigation} />
                      </TouchableOpacity>
                  
                    </View>
                  ),
                })}
              />
              <Stack.Screen
                name="CategoryPage"
                component={CategoryPage}
                options={({ navigation }) => ({
                  title: 'Gricko',
                  headerTitleAlign: 'left',
                  headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity 
                        onPressOut={() => {
                          navigation.navigate('PreviousOrdersScreen')}}
                        activeOpacity={0.7}
                        style={{ padding: 10 }}
                      >
                        <Ionicons name="document-text-outline" size={28} color="black" />
                      </TouchableOpacity>
                      {/* Cart Icon */}
                      <TouchableOpacity 
                        onPressOut={() => {
                          navigation.navigate('CartScreen')}} 
                        activeOpacity={0.7}
                        style={{ padding: 10 }}
                      >
                        <CartIcon navigation={navigation} />
                      </TouchableOpacity>
                  
                    </View>
                  ),
                })}
              />
              <Stack.Screen
                name="CartScreen"
                component={CartScreen}
                options={{ title: isCroatianLanguage? 'Košarica': 'Cart' }}
              />
              <Stack.Screen
                name="OrderScreen"
                component={OrderScreen}
                options={({ navigation }) => ({
                  title: isCroatianLanguage? 'Narudžba': 'Order', }
                )}
              />
              <Stack.Screen
                name="ThankYouScreen"
                component={ThankYouScreen}
                options={({ navigation }) => ({
                  title: 'Gricko',
                })}
              />
              <Stack.Screen
                name="PreviousOrdersScreen"
                component={PreviousOrdersScreen}
                options={({ navigation }) => ({
                  title: isCroatianLanguage? 'Prethodne narudžbe': 'Previous orders', })}
              />
              <Stack.Screen
                name="NewScreen"
                component={NewScreen}
                options={({ navigation }) => ({
                  title: 'NewScreen' ,
                })}
              />
            </Stack.Navigator>
          </Provider>
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
}

