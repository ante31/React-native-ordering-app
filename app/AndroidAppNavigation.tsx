import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomePage from './screens/HomeScreen';
import CategoryPage from './screens/CategoryScreen';
import CartScreen from './screens/CartScreen';
import OrderScreen from './screens/OrderScreen';
import ThankYouScreen from './screens/ThankYouScreen';
import { PreviousOrdersScreen } from './screens/PreviousOrdersScreen';
import NewScreen from './screens/NewScreen';
import CartIcon from './components/CartIcon'; // Adjust path as needed

const Stack = createNativeStackNavigator();

const AndroidAppNavigation = ({ route }: { route: any }) => {
    const { isCroatianLanguage } = route.params;
      return (
    <Stack.Navigator initialRouteName="Home">
      {/* Home Screen */}
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={({ navigation }) => ({
            title: 'Gricko',
            headerTitleAlign: 'center',
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
        name="PreviousOrdersScreen"
        component={PreviousOrdersScreen}
        options={{
            title: isCroatianLanguage ? 'Prethodne narudžbe' : 'Previous orders'
        }}
        />
        <Stack.Screen
        name="NewScreen"
        component={NewScreen}
        options={{ title: 'NewScreen' }}
        />
    </Stack.Navigator>
  );
};

export default AndroidAppNavigation;
