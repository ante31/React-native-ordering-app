import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import { Image, TouchableOpacity, StatusBar, View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import CartScreen from './screens/CartScreen';
import { CartProvider } from './cartContext';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import CartIcon from './components/CartIcon';
import PreviousOrderIcon from './components/PreviousOrderIcon';
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
import { isTablet } from "./services/isTablet";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import { Dimensions } from 'react-native';
import { usePushNotifications } from './services/usePushNotifications';
import ForceUpdateModal from './components/ForceUpdateModal';
import { useFonts, Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';

const Stack = createNativeStackNavigator();

export default function App() {  
  const [showNetworkError, setShowNetworkError] = useState(false);  
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
      const exaggeratedRatio = 1 + (ratio - 1) * 2; // duplo veća razlika
      return Math.round(size * exaggeratedRatio);
    },
    heavy: (size: number) => {
      const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
      const heavyRatio = ratio > 1 ? ratio * 1.5 : ratio; // Heavier scaling on larger screens
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
                  barStyle="dark-content"   // text/icons color: 'light-content' or 'dark-content'
                />
                <ClosedAppModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
                <ForceUpdateModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
                <Stack.Navigator initialRouteName="Home"   screenOptions={{
                  navigationBarColor: '#ffd400', 
                }}>
                  {/* Home Screen */}
                  <Stack.Screen
                    name="Home"
                    options={({ navigation }) => ({
                      headerTitleAlign: 'center',
                      headerBackTitleVisible: false,
                      headerRightContainerStyle: {
                        paddingRight: 10, // Proper way to control position
                      },
                      header: () => (
                        <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
                          <View
                            style={{
                              height: scale.light(50), // Will scale proportionally
                              paddingHorizontal: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottomColor: '#eee',
                            }}
                          >
                            {/* Title - centered with absolute positioning */}
                            <View>
                              <Image
                                source={require('../assets/images/nav-logo.png')}
                                style={{
                                  top: 2,
                                  width: isTablet() ? 150 : 120,
                                  height: isTablet() ? 150 : 100,
                                  resizeMode: 'contain',
                                }}
                              />
                            </View>
                      
                            {/* Right Icons - pushed to the right */}
                            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                              <TouchableOpacity
                                disabled={showNetworkError}
                                onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                                style={{ marginHorizontal: 2, marginTop: 4 }}
                              >
                                <PreviousOrderIcon navigation={navigation} scale={scale}/>
                              </TouchableOpacity>
                              <TouchableOpacity
                                disabled={showNetworkError}
                                onPressOut={() => navigation.navigate('CartScreen')}
                                style={{ marginHorizontal: 2, marginTop: 4 }}
                              >
                                <CartIcon navigation={navigation} scale={scale} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </SafeAreaView>
                      ),
                    })}

                  >
                      {(props) => <HomePage {...props} scale={scale} showNetworkError={showNetworkError} setShowNetworkError={setShowNetworkError} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name="CategoryPage"
                    options={({ navigation }) => ({
                    title: '',
                    headerTitleAlign: 'left', // Align the title to the left
                    headerBackTitleVisible: false,
                    headerRightContainerStyle: {
                      paddingRight: 10, // Proper way to control position
                    },
                    header: () => (
                      <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
                        <View
                          style={{
                            height: scale.light(50),
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
                              {!isAndroid ? <Text style={{ fontSize: scale.light(16), color: '#007AFF'}}>Gricko</Text>
                              : <Text style={{ fontSize: 18, color: 'black'}}></Text> }
                            </TouchableOpacity>
                          </View>
                
                          {/* Title */}
                          <View>
                            <Text></Text>
                          </View>
                
                          {/* Right Icons */}
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                              <TouchableOpacity
                                onPressOut={() => navigation.navigate('PreviousOrdersScreen')}
                                style={{ marginHorizontal: 2, marginTop: 4 }}
                              >
                                <PreviousOrderIcon navigation={navigation} scale={scale}/>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPressOut={() => navigation.navigate('CartScreen')}
                                style={{ marginHorizontal: 2, marginTop: 4 }}
                              >
                                <CartIcon navigation={navigation} scale={scale} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </SafeAreaView>
                    ),
                  })}
                >
                {(props) => <CategoryPage {...props} scale={scale} />}
                </Stack.Screen>
                <Stack.Screen
                  name="CartScreen"
                  component={(props: any) => <CartScreen {...props} scale={scale} meals={[]} />}
                  options={({ navigation }) => ({
                    title: isCroatianLanguage ? "Košarica" : "CartScreen",
                    headerTitleAlign: 'center',
                    headerBackTitleVisible: false,
                    header: () => (
                      <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
                        <View
                          style={{
                            height: scale.light(50),
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
                                ? <Text style={{ fontSize: scale.light(16), color: '#007AFF'}}>Gricko</Text>
                                : <Text style={{ fontSize: 18, color: 'black'}}></Text>
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
                      <PreviousOrdersScreen navigation={navigation} isCroatianLang={isCroatianLanguage} scale={scale} />
                    )}     
                    options={({ navigation }) => ({
                    title: isCroatianLanguage ? "Prethodne narudžbe" : "PreviousOrdersScreen",
                    headerTitleAlign: 'center',
                    headerBackTitleVisible: false,
                    header: () => (
                      <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
                        <View
                          style={{
                            height: scale.light(50),
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
                                ? <Text style={{ fontSize: scale.light(16), color: '#007AFF'}}>Gricko</Text>
                                : <Text style={{ fontSize: 18, color: 'black'}}></Text>
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
                  options={({ navigation }) => ({
                    title: '',
                    headerTitleAlign: 'left',
                    headerBackTitleVisible: false,
                    header: () => (
                      <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
                        <View
                          style={{
                            height: scale.light(50),
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
                            <HeaderBackButton onPress={() => navigation.goBack()}/>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => navigation.goBack()}

                              style={{ marginLeft: -6, paddingVertical: 20, paddingRight: 8 }}
                            >
                              {!isAndroid 
                                ? <Text style={{ fontSize: scale.light(16), color: '#007AFF'}}>Gricko</Text>
                                : <Text style={{ fontSize: 18, color: 'black'}}></Text>
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
                >
                  {(props: any) => <OrderScreen {...props} scale={scale} />}
                </Stack.Screen>
                <Stack.Screen
                name="ThankYouScreen"
                component={ThankYouScreen}
                initialParams={{ isCroatianLang: isCroatianLanguage, scale }}
                options={({ navigation }) => ({
                    title: '',
                    headerTitleAlign: 'left',
                    headerBackTitleVisible: false,
                    header: () => (
                      <SafeAreaView style={{ backgroundColor: '#ffd400' }}>
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
                                ? <Text style={{ fontSize: scale.light(16), color: '#007AFF'}}>Gricko</Text>
                                : <Text style={{ fontSize: 18, color: 'black'}}></Text>
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
              </Stack.Navigator>
              </PaperProvider>
            </SafeAreaView>
            
          </SafeAreaProvider>
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
}

