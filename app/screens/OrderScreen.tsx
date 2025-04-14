import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, TouchableOpacity, Text } from 'react-native';
import { DefaultTheme, TextInput, Button, IconButton, RadioButton, Divider, HelperText } from 'react-native-paper';
import { backendUrl } from '../../localhostConf';
import Orderform from '../components/OrderForm';
import validateForm from '../services/validateForm';
import Slider from '../components/Slider';
import { General } from '../models/generalModel';
import { StorageModel } from '../models/storageModel';
import { storeData } from '../services/storageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'; 
import Picker from '../components/Picker';
import { RadioOrderSelection } from '../components/RadioOrderSelection';
import { isCroatian } from '../services/languageChecker';
import { useCart } from '../cartContext';
import * as SecureStore from 'expo-secure-store';
import { usePushNotifications } from '../services/usePushNotifications';
import { updateMealPopularity } from '../services/updateMealPopularity';
import { isClosedMessageDisplayed, appButtonsDisabled } from '../services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';
import { OrderDetails } from '../components/OrderDetails';
import { useGeneral } from '../generalContext';
import { checkTimeValidity } from '../services/checkTimeValidity';

export default function OrderScreen({ route, navigation }: { route: any, navigation: any }) {
  const { expoPushToken, notification } = usePushNotifications();
  const { dispatch } = useCart();
  const { cartState, storageOrder } = route.params;
  const [showPicker, setShowPicker] = useState(false);
  const [timeString, setTimeString] = useState("null");
  const [saveData, setSaveData] = useState(false);
  const isCroatianLang = isCroatian();
  const [lastOrder, setLastOrder] = useState<StorageModel | null>(null);
  const {general} = useGeneral();
  const dayOfWeek = getDayOfTheWeek(getLocalTime());
  //    setOrderData(prev => ({ ...prev, totalPrice: orderPrice + (isSlidRight? general?.deliveryPrice: 0) }))

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedKeys = await SecureStore.getItemAsync('order_keys');
        const keys = storedKeys ? JSON.parse(storedKeys) : [];
  
        if (keys.length === 0) return; // No orders stored
  
        const lastKey = keys[keys.length - 1]; // Get last stored key
        const lastOrder = await SecureStore.getItemAsync(lastKey);
        if (lastOrder) {
          setLastOrder({ id: lastKey, ...JSON.parse(lastOrder) }); // Store only the last order
        }
      } catch (error) {
        console.error('Error loading last order', error);
      }
    };
  
    loadOrders();
  }, []);

  console.log("isCroatianLang ", isCroatianLang)
  

  // If storageOrder is undefined or null, provide default values.
  const orderName = storageOrder?.name || lastOrder?.name || '';
  const orderPhone = storageOrder?.phone || lastOrder?.phone || '';
  const orderAddress = storageOrder?.address || lastOrder?.address || '';
  const orderZone = storageOrder?.zone || lastOrder?.zone || '';
  const orderNote = storageOrder?.note || '';

  const [isSlidRight, setIsSlidRight] = useState(storageOrder?.isDelivery || false);
  const [boxWidth, setBoxWidth] = useState(0);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  const [errors, setErrors] = useState({ name: '', phone: '', address: '', zone: '' });
  const [displayMessage, setDisplayMessage] = useState(false);
  const [displaySecondMessage, setDisplaySecondMessage] = useState(false);
  const [displayWorkTimeMessage, setDisplayWorkTimeMessage] = useState(false);
  const orderPrice = cartState.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

  const [orderData, setOrderData] = useState({
    name: orderName,
    phone: orderPhone,
    address: orderAddress,
    zone: orderZone,
    note: orderNote,
    isDelivery: isSlidRight,
    timeOption: selectedDeliveryOption,
    cartItems: cartState.items,
    time: '',
    deadline: '',
    token: '',
    status: "pending",
    language: isCroatianLang ? "hr" : "en",
    totalPrice: orderPrice + (isSlidRight? general?.deliveryPrice: 0)
  });


  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      name: orderName,
      phone: orderPhone,
      address: orderAddress,
      note: orderNote,
    }));
  }, [orderName, orderPhone, orderAddress, orderNote]);

  console.log("orderData ", orderData);

  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      totalPrice: orderPrice + (isSlidRight? general?.deliveryPrice: 0),
    }))

    console.log("TSTS", timeString)
    if (timeString !== "undefined:undefined" && timeString !== "null") {
      console.log("ffvf", timeString)
      checkTimeValidity({ hours: Number(timeString.split(":")[0]), minutes: Number(timeString.split(":")[1]) }, setTimeString, setDisplayMessage, setDisplayWorkTimeMessage, setShowPicker, isSlidRight, general);
    }
  }, [isSlidRight])

  const handleSubmit = async () => {
    // Calculate current time
    const currentDate = getLocalTime();
    console.log("loggg", currentDate);
    const manipulativeCurrentDate = getLocalTime();
    
    let deadline = "";
    
    // Fake currentDate to be 23:00 in Europe/Zagreb time

    console.log("Isappclosed ", isClosedMessageDisplayed(general?.workTime[dayOfWeek]));
    
    if (selectedDeliveryOption === "standard") {
      console.log("Standard:");
      // Standard case: add the predefined time (delivery or pickup)
      const additionalTime = orderData.isDelivery ? (general?.deliveryTime || 0) : (general?.pickUpTime || 0);
      manipulativeCurrentDate.setMinutes(manipulativeCurrentDate.getMinutes() + additionalTime);
      
      deadline = manipulativeCurrentDate.toISOString(); // Converts to format like "2025-02-24T15:56:12.000Z"
    
    } else if (selectedDeliveryOption === "custom") {
      console.log("Custom:");
      // Convert timeString (e.g., "16:18") into a full date string
      const [hours, minutes] = timeString.split(':').map(Number);
      manipulativeCurrentDate.setHours(hours+1, minutes, 0, 0); // Set the extracted time
      console.log("KRAJnik", manipulativeCurrentDate)

      if (manipulativeCurrentDate instanceof Date && !isNaN(manipulativeCurrentDate.getTime())) {
        console.log("manipulativeCurrentDate", manipulativeCurrentDate);
       deadline = manipulativeCurrentDate.toISOString(); // Format: "2025-02-24T16:18:00.000Z"
      }
      else{
        setDisplaySecondMessage(true);
        return;
      }
      
    }
    
    console.log("deadline", deadline);
    console.log("orderdata", orderData)
    console.log("JEBEMti", orderPrice, isSlidRight, general?.deliveryPrice, orderPrice + (isSlidRight? general?.deliveryPrice: 0))
  
    // Now update orderData with the calculated values

    let id = "";
  
    // Validate form and submit only after the update
    if (validateForm(orderData, isSlidRight, setErrors, general?.minOrder, isCroatianLang)) {
      try {
        console.log("expoPushToken", expoPushToken);
        if (expoPushToken) {
          const orderDataWithToken = {
            ...orderData,
            token: expoPushToken.data,
            totalPrice: orderPrice + (isSlidRight ? general?.deliveryPrice : 0),
            time: currentDate,
            deadline: deadline,
            language: isCroatianLang ? "hr" : "en",
          };
      
          const response = await fetch(`${backendUrl}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDataWithToken),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${errorText}`);
          }
      
          const { id } = await response.json();
          if (id) {
            await storeData(id, orderDataWithToken); 
            updateMealPopularity(orderData.cartItems);
            dispatch({ type: 'CLEAR_CART' });
            navigation.navigate('ThankYouScreen', { isCroatianLang });
          } else {
            throw new Error('Missing order ID in response.');
          }
        }
      } catch (err: any) {
        alert(`Order failed: ${err.message}`);
        console.error(err);
      }      
    } else {
      console.log("Form validation failed");
    }
  };

  console.log("timeString ", timeString)
  console.log("selectedDeliveryOption ", selectedDeliveryOption);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView >
        <Slider 
          isSlidRight={isSlidRight} 
          setIsSlidRight={setIsSlidRight} 
          boxWidth={boxWidth} 
          setBoxWidth={setBoxWidth} 
          orderData={orderData} 
          setOrderData={setOrderData}
          initialSide={storageOrder?.isDelivery ? 'right' : 'left'} 
          isCroatianLang={isCroatianLang}
        />


        <RadioOrderSelection 
          selectedDeliveryOption = {selectedDeliveryOption}
          setSelectedDeliveryOption = {setSelectedDeliveryOption}
          setShowPicker = {setShowPicker}
          displayMessage = {displayMessage}
          setDisplayMessage = {setDisplayMessage}
          displayWorkTimeMessage = {displayWorkTimeMessage}
          setDisplayWorkTimeMessage = {setDisplayWorkTimeMessage}
          displaySecondMessage = {displaySecondMessage}
          setDisplaySecondMessage = {setDisplaySecondMessage}
          timeString = {timeString}
          isSlidRight = {isSlidRight}
          isCroatianLang = {isCroatianLang}
          general = {general}
        />

        <Picker 
          showPicker={showPicker} 
          setShowPicker={setShowPicker} 
          timeString={timeString} 
          setTimeString={setTimeString} 
          isSlidRight={isSlidRight} 
          general={general} 
          setDisplayWorkTimeMessage={setDisplayWorkTimeMessage} 
          setDisplayMessage={setDisplayMessage}
        />

        <Divider style={styles.divider} />
        <Text style={styles.title}>{isCroatianLang ? 'Podaci za narudžbu': 'Order data'}</Text>
        <View style={styles.paddingContainer}>
          <Orderform 
            orderData={orderData} 
            setOrderData={setOrderData} 
            errors={errors} 
            saveData={saveData} 
            setSaveData={setSaveData}
            isCroatianLang={isCroatianLang}
          />
        </View>
        <Divider style={styles.divider} />
        <OrderDetails 
          isCroatianLang={isCroatianLang}
          orderPrice={orderPrice}
          isSlidRight={isSlidRight}
          general={general}
        />
        
      </ScrollView>
      <Button 
        mode="contained" 
          style={[
            styles.orderButton, 
            general?.workTime && appButtonsDisabled(general.workTime[dayOfWeek]) && styles.disabledButton
          ]}
          onPress={() => { handleSubmit(); }} 
          disabled={!general?.workTime || appButtonsDisabled(general.workTime[dayOfWeek])} 
        > 

        <Text style={[
          { fontSize: 26 }, 
          styles.textPosition, 
          general?.workTime && appButtonsDisabled(general.workTime[dayOfWeek]) && styles.disabledText // Change text color when disabled
        ]}>
          {isCroatianLang ? 'Završi narudžbu' : 'Confirm order'}
        </Text>
      </Button>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  paddingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 0,
    paddingLeft: 20,
    paddingVertical: 10,
  },
  orderButton: {
    backgroundColor: '#FFC72C',
    color: '#fff',
    justifyContent: 'center', // Ensure content is vertically centered
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  textPosition: {
    color: '#fff',
    lineHeight: 30, // Adjust this to control vertical alignment and prevent cropping
    textAlignVertical: 'center', // Ensures text is vertically centered
  },
  
  timePickerButton: {
    marginVertical: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5', // Disabled background color
    opacity: 0.6, // Reduce opacity for disabled state
  },
  disabledText: {
    color: '#fff', // Light grey text when disabled
  }
});
