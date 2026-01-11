import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartScreen from './screens/CartScreen';
import { CartProvider } from './cartContext';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import OrderScreen from './screens/OrderScreen';
import { ToastProvider } from "react-native-toast-notifications";
import { PreviousOrdersScreen } from './screens/PreviousOrdersScreen';
import { isCroatian } from './services/languageChecker';
import ThankYouScreen from './screens/ThankYouScreen';
import CustomMessageModal from './components/CustomMessageModal';
import { useState } from "react";
import { GeneralProvider } from './generalContext';
import ClosedAppModal from './components/closedAppModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ForceUpdateModal from './components/ForceUpdateModal';
import { useFonts, Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { useAppInitialization } from '../hooks/useLayoutInitalization'; 
import { scale } from './services/scale';
import CustomHeader from './components/Header';

const Stack = createNativeStackNavigator();

export default function App() {  
  const [showNetworkError, setShowNetworkError] = useState(false); 
  const { specials, drinks } = useAppInitialization(); // Sva logika je ovdje
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_700Bold });

  const isCroatianLanguage = isCroatian();

  if (!fontsLoaded) return null;

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
                

                <Stack.Navigator initialRouteName="Home">
                  <Stack.Screen
                    name="Home"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader navigation={navigation} type="home" />
                    })}
                  >
                    {(props) => (
                      <HomePage 
                        {...props} 
                        scale={scale} 
                        drinks={drinks} 
                        specials={specials} 
                        showNetworkError={showNetworkError} 
                        setShowNetworkError={setShowNetworkError} 
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen
                    name="CategoryPage"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader navigation={navigation} />
                    })}
                  >
                    {(props) => <CategoryPage {...props} scale={scale} />}
                  </Stack.Screen>

                  <Stack.Screen
                    name="CartScreen"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader 
                        navigation={navigation} 
                        showIcons={false} 
                        onBack={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} 
                      />
                    })}
                  >
                    {(props) => <CartScreen {...props} scale={scale} drinks={drinks} />}
                  </Stack.Screen>

                  <Stack.Screen
                    name="PreviousOrdersScreen"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader 
                        navigation={navigation} 
                        showIcons={false} 
                        onBack={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} 
                      />
                    })}
                  >
                    {(props) => <PreviousOrdersScreen {...props} scale={scale} isCroatianLang={isCroatianLanguage} />}
                  </Stack.Screen>

                  <Stack.Screen
                    name="OrderScreen"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader navigation={navigation} showIcons={false} />
                    })}
                  >
                    {(props: any) => <OrderScreen {...props} scale={scale} />}
                  </Stack.Screen>

                  <Stack.Screen
                    name="ThankYouScreen"
                    options={({ navigation }) => ({
                      header: () => <CustomHeader 
                        navigation={navigation} 
                        showIcons={false} 
                        onBack={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} 
                      />
                    })}
                  >
                    {(props) => <ThankYouScreen {...props} scale={scale} isCroatianLang={isCroatianLanguage} />}
                  </Stack.Screen>
                </Stack.Navigator>
              </PaperProvider>
            </SafeAreaView>
            
          </SafeAreaProvider>
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
}