import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import { Image, TouchableOpacity, StatusBar, View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
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
import { MD3LightTheme } from 'react-native-paper';
import { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { GeneralProvider } from './generalContext';
import ClosedAppModal from './components/closedAppModal';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';

const Stack = createNativeStackNavigator();

export default function App() {
  const isCroatianLanguage = isCroatian();

  useEffect(() => {
    async function prepareApp() {
      await SplashScreen.preventAutoHideAsync();
      await SplashScreen.hideAsync();
    }

    prepareApp();
  }, []);

  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped on notification:', response);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const isAndroid = Platform.OS === 'android';

  return (
    <ToastProvider dangerColor="#FFC72C" offsetBottom={40} swipeEnabled={true}>
      <GeneralProvider>
        <CartProvider>
          <SafeAreaProvider>
            {true ? (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                <Provider theme={MD3LightTheme}>
                  {isAndroid && <StatusBar
                    backgroundColor="black"
                  />}
                  <ClosedAppModal isCroatianLanguage={isCroatianLanguage} />
                  <Stack.Navigator initialRouteName="Home">
                    {/* Home Screen */}
                    <Stack.Screen
                      name="Home"
                      component={HomePage}
                      options={({ navigation }) => ({
                        title: 'Gricko',
                        headerTitleAlign: 'center',
                        headerBackTitleVisible: false,
                        headerRightContainerStyle: {
                          paddingRight: 10, // Proper way to control position
                        },
                        header: () => (
                          <SafeAreaView style={{ backgroundColor: '#fff' }}>
                            <View
                              style={{
                                height: 50,
                                paddingHorizontal: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                              }}
                            >
                              {/* Title - centered with absolute positioning */}
                              <View style={{ 
                                position: 'absolute', 
                                left: 0, 
                                right: 0, 
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18 }}>
                                  Gricko
                                </Text>
                              </View>
                        
                              {/* Right Icons - pushed to the right */}
                              <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                                <TouchableOpacity
                                  onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                                  style={{ marginHorizontal: 8, marginTop: 4 }}
                                >
                                  <Ionicons name="document-text-outline" size={28} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPressOut={() => navigation.navigate('CartScreen')}
                                  style={{ marginHorizontal: 8 }}
                                >
                                  <CartIcon navigation={navigation} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </SafeAreaView>
                        ),
                      })}

                    />
                    <Stack.Screen
                    name="CategoryPage"
                    component={CategoryPage}
                    options={({ navigation }) => ({
                      title: '',
                      headerTitleAlign: 'left', // Align the title to the left
                      headerBackTitleVisible: false,
                      headerRightContainerStyle: {
                        paddingRight: 10, // Proper way to control position
                      },
                      header: () => (
                        <SafeAreaView style={{ backgroundColor: '#fff' }}>
                          <View
                            style={{
                              height: 50,
                              paddingHorizontal: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottomWidth: 1,
                              borderBottomColor: '#eee',
                            }}
                          >
                            {/* Back Button */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
                              <HeaderBackButton onPress={() => navigation.goBack()} />
                              <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                                style={{ marginLeft: -6, paddingVertical: 20, paddingRight: 8 }}
                              >
                                {!isAndroid ? <Text style={{ fontSize: 16, color: '#007AFF'}}>Gricko</Text>
                                : <Text style={{ fontSize: 18, color: 'black'}}>Gricko</Text> }
                              </TouchableOpacity>
                            </View>
                  
                            {/* Title */}
                            <View>
                              <Text></Text>
                            </View>
                  
                            {/* Right Icons */}
                            <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity
                                onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                                style={{ marginHorizontal: 8, marginTop: 4 }}
                              >
                                <Ionicons name="document-text-outline" size={28} color="black" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPressOut={() => navigation.navigate('CartScreen')}
                                style={{ marginHorizontal: 8 }}
                              >
                                <CartIcon navigation={navigation} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </SafeAreaView>
                      ),
                    })}
                  />
                  <Stack.Screen
                    name="CartScreen"
                    component={(props: any) => <CartScreen {...props} meals={[]} />}
                    options={({ navigation }) => ({
                      title: isCroatianLanguage ? "Košarica" : "CartScreen",
                      headerTitleAlign: 'center',
                      headerBackTitleVisible: false,
                      header: () => (
                        <SafeAreaView style={{ backgroundColor: '#fff' }}>
                          <View
                            style={{
                              height: 50,
                              paddingHorizontal: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottomWidth: 1,
                              borderBottomColor: '#eee',
                            }}
                          >
                            {/* Back Button */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
                              <HeaderBackButton onPress={() => navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                              })} />
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })}
                                style={{ marginLeft: -6, paddingVertical: 20, paddingRight: 8 }}
                              >
                                {!isAndroid 
                                  ? <Text style={{ fontSize: 16, color: '#007AFF'}}>Gricko</Text>
                                  : <Text style={{ fontSize: 18, color: 'black'}}>Gricko</Text>
                                }
                         </TouchableOpacity>
                            </View>
                  
                            {/* Title */}
                            <View>
                            </View>
                  
                            {/* Right Icons */}
                            <View style={{ flexDirection: 'row' }}>
                              
                            </View>
                          </View>
                        </SafeAreaView>
                      ),
                    })}
                  />
                  <Stack.Screen
                    name="PreviousOrdersScreen"
                    component={({ navigation }: any) => (
                        <PreviousOrdersScreen navigation={navigation} isCroatianLang={isCroatianLanguage} />
                      )}     
                      options={({ navigation }) => ({
                      title: isCroatianLanguage ? "Prethodne narudžbe" : "PreviousOrdersScreen",
                      headerTitleAlign: 'center',
                      headerBackTitleVisible: false,
                      header: () => (
                        <SafeAreaView style={{ backgroundColor: '#fff' }}>
                          <View
                            style={{
                              height: 50,
                              paddingHorizontal: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottomWidth: 1,
                              borderBottomColor: '#eee',
                            }}
                          >
                            {/* Back Button */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
                              <HeaderBackButton onPress={() => navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                              })} />
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })}
                                style={{ marginLeft: -6, paddingVertical: 20, paddingRight: 8 }}
                              >
                                {!isAndroid 
                                  ? <Text style={{ fontSize: 16, color: '#007AFF'}}>Gricko</Text>
                                  : <Text style={{ fontSize: 18, color: 'black'}}>Gricko</Text>
                                }
                         </TouchableOpacity>
                            </View>
                  
                            {/* Title */}
                            <View>
                              <Text></Text>
                            </View>
                  
                            {/* Right Icons */}
                            <View style={{ flexDirection: 'row' }}>
                              
                            </View>
                          </View>
                        </SafeAreaView>
                      ),
                    })}
                  />
                  <Stack.Screen
  name="OrderScreen"
  component={OrderScreen}
  options={({ navigation }) => ({
    title: '',
    headerTitleAlign: 'left',
    headerBackTitleVisible: false,
    header: () => (
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View
          style={{
            height: 50,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}
        >
          {/* Back Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={{ marginLeft: -6, paddingVertical: 20, paddingRight: 8 }}
            >
              <Text style={{ fontSize: 18, color: 'black' }}>Gricko</Text>
            </TouchableOpacity>
          </View>

          {/* Right Icons */}
          <View style={{ flexDirection: 'row' }}>
          </View>
        </View>
      </SafeAreaView>
    ),
  })}
/>

<Stack.Screen
  name="ThankYouScreen"
  component={ThankYouScreen}
  options={{
    headerShown: false, // Optional - no header for thank you page
  }}
/>
                </Stack.Navigator>
                </Provider>
              </SafeAreaView>
            ) : (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
              <Provider theme={MD3LightTheme}>
                <StatusBar
                  backgroundColor="black"
                />
                <ClosedAppModal isCroatianLanguage={isCroatianLanguage} />
                <Stack.Navigator initialRouteName="Home">
                    {/* Home Screen */}
                    <Stack.Screen
                      name="Home"
                      component={HomePage}
                      options={({ navigation }) => ({
                        title: 'Gricko',
                        headerTitleAlign: 'center',
                        headerBackTitleVisible: false,
                        headerRightContainerStyle: {
                          paddingRight: 10, // Proper way to control position
                        },
                        header: () => (
                          <SafeAreaView style={{ backgroundColor: '#fff' }}>
                            <View
                              style={{
                                height: 50,
                                paddingHorizontal: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                              }}
                            >
                              {/* Title - centered with absolute positioning */}
                              <View style={{ 
                                position: 'absolute', 
                                left: 0, 
                                right: 0, 
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18 }}>
                                  Gricko
                                </Text>
                              </View>
                        
                              {/* Right Icons - pushed to the right */}
                              <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                                <TouchableOpacity
                                  onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                                  style={{ marginHorizontal: 8, marginTop: 4 }}
                                >
                                  <Ionicons name="document-text-outline" size={28} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPressOut={() => navigation.navigate('CartScreen')}
                                  style={{ marginHorizontal: 8 }}
                                >
                                  <CartIcon navigation={navigation} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </SafeAreaView>
                        ),
                      })}

                    />

                  {/* Category Page */}
                  <Stack.Screen
                    name="CategoryPage"
                    component={CategoryPage}
                    options={({ navigation }) => ({
                      title: 'Gricko',
                      headerTitleAlign: 'left', // Align the title to the left
                      headerBackTitleVisible: false,
                      headerRight: () => (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: -10, // Adjust the left margin if needed
                          }}
                        >
                          <TouchableOpacity
                            onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                            activeOpacity={0.7}
                            style={{ paddingHorizontal: 8 }}
                          >
                            <Ionicons name="document-text-outline" size={28} color="black" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPressOut={() => navigation.navigate('CartScreen')}
                            activeOpacity={0.7}
                            style={{ paddingHorizontal: 8 }}
                          >
                            <CartIcon navigation={navigation} />
                          </TouchableOpacity>
                        </View>
                      ),
                    })}
                  />
                  <Stack.Screen
                    name="CartScreen"
                    component={(props: any) => <CartScreen {...props} meals={[]} />}
                    options={{
                      title: isCroatianLanguage ? 'Košarica' : 'Cart'
                    }}
                  />
                  <Stack.Screen
                    name="OrderScreen"
                    component={OrderScreen}
                    options={{
                      title: isCroatianLanguage ? 'Narudžba' : 'Order'
                    }}
                  />
                  <Stack.Screen
                    name="ThankYouScreen"
                    component={ThankYouScreen}
                    options={{ title: 'Gricko' }}
                  />
                  
                  <Stack.Screen
                    name="NewScreen"
                    component={NewScreen}
                    options={{ title: 'NewScreen' }}
                  />
                </Stack.Navigator>
              </Provider>
            </SafeAreaView>
            )}
          </SafeAreaProvider>
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
}

