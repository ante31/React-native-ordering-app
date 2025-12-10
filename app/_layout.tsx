import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import { Image, TouchableOpacity, StatusBar, View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartScreen from './screens/CartScreen';
import { CartProvider } from './cartContext';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import CartIcon from './components/CartIcon';
import PreviousOrderIcon from './components/PreviousOrderIcon';
import OrderScreen from './screens/OrderScreen';
import { ToastProvider } from "react-native-toast-notifications";
import { PreviousOrdersScreen } from './screens/PreviousOrdersScreen';
import { isCroatian } from './services/languageChecker';
import ThankYouScreen from './screens/ThankYouScreen';
import CustomMessageModal from './components/CustomMessageModal';
import { useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { GeneralProvider } from './generalContext';
import ClosedAppModal from './components/closedAppModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import { Dimensions } from 'react-native';
import ForceUpdateModal from './components/ForceUpdateModal';
import { useFonts, Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { safeFetch } from './services/safeFetch';
import { backendUrl } from '../localhostConf';

const Stack = createNativeStackNavigator();

export default function App() {  
  const [showNetworkError, setShowNetworkError] = useState(false); 
  const [specials, setSpecials] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
  });

  const BASE_HEIGHT = 752; 
  const BASE_WIDTH = 393;

  const isCroatianLanguage = isCroatian();
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
  console.log('Screen size:', SCREEN_WIDTH, 'x', SCREEN_HEIGHT);

  // Scale function
  const scale = {
    light: (size: number) => Math.round((size * SCREEN_HEIGHT) / BASE_HEIGHT),
    medium: (size: number) => {
      const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
      const exaggeratedRatio = 1 + (ratio - 1) * 2;
      return Math.round(size * exaggeratedRatio);
    },
    heavy: (size: number) => {
      const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
      const heavyRatio = ratio > 1 ? ratio * 1.5 : ratio;
      return Math.round(size * heavyRatio);
    },
    isTablet() {
      return false;
    }
  };

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

  useEffect(() => {
    safeFetch(`${backendUrl}/cjenik/Posebno`)
      .then((response) => response.json())
      .then((data) => {
        setSpecials(Object.entries(data).map(([key, meal]) => ({ id: key, ...(typeof meal === 'object' ? meal : {}) })));
      })
      .catch((error) => console.error('Error fetching meals:', error))

    safeFetch(`${backendUrl}/cjenik/Piće`)
      .then((response) => response.json())
      .then((data) => {
        setDrinks(data); 
      })
      .catch((error) => console.error('Error fetching meals:', error));
  }, []);

  const isAndroid = Platform.OS === 'android';

  const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    backdrop: 'rgba(59, 59, 59, 0.1)',
  },
};

  return (

    <ToastProvider dangerColor="#ffd400" offsetBottom={40} swipeEnabled={true} textStyle={{ fontFamily: 'Lexend_400Regular' }}>
      <GeneralProvider>
        <CartProvider>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffd400' }}>
              <PaperProvider theme={theme}>
                <StatusBar
                  backgroundColor="#ffd400"
                  barStyle="dark-content" 
                />
                <CustomMessageModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
                <ClosedAppModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
                <ForceUpdateModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
                

                <Stack.Navigator initialRouteName="Home" >
                  <Stack.Screen
                    name="Home"
                    options={({ navigation }) => ({
                      headerTitleAlign: 'center',
                      headerBackTitleVisible: false,
                      headerStyle: {
                        backgroundColor: '#ffd400',
                        height: Platform.OS === 'android' ? 80 : 70, 
                        elevation: 0, 
                        shadowOpacity: 0, 
                      },
                      header: () => {
                    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

                    return (
                      <View style={{
                        backgroundColor: '#ffd400',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        height: 60,
                        paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                      }}>
                        <Image
                          source={require('../assets/images/nav-logo.png')}
                          style={{
                            width: 120,
                            height: 40,
                            resizeMode: 'contain',
                          }}
                        />

                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            disabled={showNetworkError}
                            onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                          >
                            <PreviousOrderIcon navigation={navigation} scale={scale}/>
                          </TouchableOpacity>
                          <TouchableOpacity
                            disabled={showNetworkError}
                            onPressOut={() => navigation.navigate('CartScreen')}
                            style={{ marginHorizontal: 4 }}
                          >
                            <CartIcon navigation={navigation} scale={scale} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }
                    })}
                  >
                    {(props) => <HomePage {...props} scale={scale} drinks={drinks} specials={specials} showNetworkError={showNetworkError} setShowNetworkError={setShowNetworkError} />}
                  </Stack.Screen>

                <Stack.Screen
                  name="CategoryPage"
                  options={({ navigation }) => ({
                    title: '',
                    headerBackTitleVisible: false,
                    header: () => {
                      const statusBarHeight = Platform.OS === 'android'
                        ? StatusBar.currentHeight || 24
                        : 0;

                      return (
                        <View
                          style={{
                            backgroundColor: '#ffd400',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: 16,
                            height: 60,
                            paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <HeaderBackButton onPress={() => navigation.goBack()} />

                            <TouchableOpacity
                              onPress={() => navigation.goBack()}
                              activeOpacity={0.7}
                              style={{ marginLeft: -6, paddingVertical: 10, paddingRight: 8 }}
                            >
                              {!isAndroid ? (
                                <Text style={{ fontSize: 18, color: '#007AFF' }}>
                                  Gricko
                                </Text>
                              ) : null}
                            </TouchableOpacity>
                          </View>

                          <View />

                          {/* RIGHT: Icons */}
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                              onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                            >
                              <PreviousOrderIcon navigation={navigation} scale={scale} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPressOut={() => navigation.navigate('CartScreen')}
                              style={{ marginHorizontal: 4 }}
                            >
                              <CartIcon navigation={navigation} scale={scale} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    },
                  })}
                >
                  {(props) => <CategoryPage {...props} scale={scale} />}
                </Stack.Screen>

                <Stack.Screen
                  name="CartScreen"
                  component={(props: any) => (
                    <CartScreen {...props} scale={scale} drinks={drinks} />
                  )}
                  options={({ navigation }) => ({
                    title: isCroatianLanguage ? "Košarica" : "Cart",
                    headerBackTitleVisible: false,
                    header: () => {
                      const statusBarHeight =
                        Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

                      return (
                        <View
                          style={{
                            backgroundColor: '#ffd400',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 56,
                            paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <HeaderBackButton
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                            />

                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                              style={{ marginLeft: -6, paddingVertical: 10, paddingRight: 8 }}
                            >
                              {!isAndroid ? (
                                <Text style={{ fontSize: 18, color: '#007AFF' }}>Gricko</Text>
                              ) : null}
                            </TouchableOpacity>
                          </View>

                          <View style={{ width: 40 }} />
                        </View>
                      );
                    },
                  })}
                />

                <Stack.Screen
                  name="PreviousOrdersScreen"
                  component={({ navigation }: any) => (
                    <PreviousOrdersScreen
                      navigation={navigation}
                      isCroatianLang={isCroatianLanguage}
                      scale={scale}
                    />
                  )}
                  options={({ navigation }) => ({
                    title: '',
                    headerBackTitleVisible: false,
                    header: () => {
                      const statusBarHeight =
                        Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

                      return (
                        <View
                          style={{
                            backgroundColor: '#ffd400',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: 16,
                            height: 60,
                            paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <HeaderBackButton
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                            />

                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                              style={{ marginLeft: -6, paddingVertical: 10, paddingRight: 8 }}
                            >
                              {!isAndroid ? (
                                <Text style={{ fontSize: 18, color: '#007AFF' }}>Gricko</Text>
                              ) : null}
                            </TouchableOpacity>
                          </View>

                          <View />

                          <View style={{ flexDirection: 'row' }}></View>
                        </View>
                      );
                    },
                  })}
                />

                <Stack.Screen
                  name="OrderScreen"
                  options={({ navigation }) => ({
                    title: '',
                    headerBackTitleVisible: false,
                    header: () => {
                      const statusBarHeight =
                        Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

                      return (
                        <View
                          style={{
                            backgroundColor: '#ffd400',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: 16,
                            height: 60, 
                            paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                        >
                          {/* LEFT: Back */}
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <HeaderBackButton onPress={() => navigation.goBack()} />

                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => navigation.goBack()}
                              style={{ marginLeft: -6, paddingVertical: 10, paddingRight: 8 }}
                            >
                              {!isAndroid ? (
                                <Text style={{ fontSize: 18, color: '#007AFF' }}>Gricko</Text>
                              ) : null}
                            </TouchableOpacity>
                          </View>

                          <View />

                          <View style={{ flexDirection: 'row' }}></View>
                        </View>
                      );
                    },
                  })}
                >
                  {(props: any) => <OrderScreen {...props} scale={scale} />}
                </Stack.Screen>

                <Stack.Screen
                  name="ThankYouScreen"
                  component={ThankYouScreen}
                  initialParams={{ isCroatianLang: isCroatianLanguage, scale }}
                  options={({ navigation }) => ({
                    title: '',
                    headerBackTitleVisible: false,
                    header: () => {
                      const statusBarHeight =
                        Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

                      return (
                        <View
                          style={{
                            backgroundColor: '#ffd400',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: 16,
                            height: 60, 
                            paddingTop: Platform.OS === 'android' ? statusBarHeight / 2 : 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <HeaderBackButton
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                            />

                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                })
                              }
                              style={{ marginLeft: -6, paddingVertical: 10, paddingRight: 8 }}
                            >
                              {!isAndroid ? (
                                <Text style={{ fontSize: 18, color: '#007AFF' }}>Gricko</Text>
                              ) : null}
                            </TouchableOpacity>
                          </View>

                          <View />

                          <View style={{ flexDirection: 'row' }} />
                        </View>
                      );
                    },
                  })}
                />

              </Stack.Navigator>
              </PaperProvider>
            </SafeAreaView>
            
          </SafeAreaProvider>
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
}

