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
import { useState, useEffect } from "react";
import { GeneralProvider, useGeneral } from './generalContext';
import ClosedAppModal from './components/closedAppModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ForceUpdateModal from './components/ForceUpdateModal';
import NotificationsBlockedModal from './components/NotificationsBlockedModal';
import { useFonts, Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { useAppInitialization } from '../hooks/useLayoutInitalization'; 
import { scale } from './services/scale';
import CustomHeader from './components/Header';
import * as Sentry from '@sentry/react-native';
import DeliveryTypeScreen from './screens/DeliveryTypeScreen';
import { usePushNotifications } from './services/usePushNotifications';


Sentry.init({
  dsn: 'https://67aced7b9db921c21707bfe872092150@o4511349110603776.ingest.de.sentry.io/4511349112701008',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const Stack = createNativeStackNavigator();

function AppContent() {
  const [showNetworkError, setShowNetworkError] = useState(false); 
  const { menu, categories } = useAppInitialization(setShowNetworkError);
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_700Bold });
  const isCroatianLanguage = isCroatian();
  const { notificationsBlocked, setNotificationsBlocked } = useGeneral();
  const { notificationsBlocked: pushBlocked } = usePushNotifications();

  useEffect(() => {
    if (pushBlocked) setNotificationsBlocked(true);
  }, [pushBlocked]);

  if (!fontsLoaded) return null;

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      backdrop: 'rgba(59, 59, 59, 0.1)',
    },
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffd400' }}>
        <PaperProvider theme={theme}>
          <StatusBar backgroundColor="#ffd400" barStyle="dark-content" />
          <CustomMessageModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
          <ClosedAppModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
          <ForceUpdateModal isCroatianLanguage={isCroatianLanguage} scale={scale}/>
          {/* <NotificationsBlockedModal
            visible={notificationsBlocked}
            isCroatianLanguage={isCroatianLanguage}
            scale={scale}
          /> */}

          <Stack.Navigator initialRouteName="Home" screenOptions={{ contentStyle: { backgroundColor: "#fff" } }}>
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
                  menu={menu}
                  categories={categories}
                  showNetworkError={showNetworkError} 
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="CategoryPage"
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} />
              })}
            >
              {(props) => <CategoryPage {...props} scale={scale} menu={menu} />}
            </Stack.Screen>

            <Stack.Screen
              name="CartScreen"
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} showIcons={false} onBack={() => navigation.popToTop()} />
              })}
            >
              {(props) => <CartScreen {...props} scale={scale} drinks={(menu as any)["Piće"] || {}} menu={menu}/>}
            </Stack.Screen>

            <Stack.Screen
              name="PreviousOrdersScreen"
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} showIcons={false} onBack={() => navigation.popToTop()} />
              })}
            >
              {(props) => <PreviousOrdersScreen {...props} scale={scale} isCroatianLang={isCroatianLanguage} />}
            </Stack.Screen>

            <Stack.Screen
              name="DeliveryTypeScreen"
              options={({ navigation }) => ({
                header: () => <CustomHeader navigation={navigation} showIcons={false} />
              })}
            >
              {(props) => <DeliveryTypeScreen {...props} />}
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
                header: () => <CustomHeader navigation={navigation} showIcons={false} onBack={() => navigation.popToTop()} />
              })}
            >
              {(props) => <ThankYouScreen {...props} scale={scale} isCroatianLang={isCroatianLanguage} />}
            </Stack.Screen>
          </Stack.Navigator>
        </PaperProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(function App() {
  const isCroatianLanguage = isCroatian();
  return (
    <ToastProvider dangerColor="#ffd400" offsetBottom={50} swipeEnabled={true} textStyle={{ fontFamily: 'Lexend_400Regular' }}>
      <GeneralProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </GeneralProvider>
    </ToastProvider>
  );
});