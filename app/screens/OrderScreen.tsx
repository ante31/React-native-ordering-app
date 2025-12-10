import React, { useEffect, useState, useRef, useCallback, use } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { backendUrl } from '../../localhostConf';
import Orderform from '../components/OrderForm';
import validateForm from '../services/validateForm';
import Slider from '../components/Slider';
import { StorageModel } from '../models/storageModel';
import { storeData } from '../services/storageService';
import 'react-native-get-random-values';
import Picker from '../components/Picker';
import { RadioOrderSelection } from '../components/RadioOrderSelection';
import { isCroatian } from '../services/languageChecker';
import { useCart } from '../cartContext';
import * as SecureStore from 'expo-secure-store';
import { usePushNotifications } from '../services/usePushNotifications';
import { updateMealPopularity } from '../services/updateMealPopularity';
import { appButtonsDisabled } from '../services/isAppClosed';
import { getDayOfTheWeek, getLocalTime, setTimeInISOString } from '../services/getLocalTime';
import { OrderDetails } from '../components/OrderDetails';
import { useGeneral } from '../generalContext';
import { checkTimeValidity } from '../services/checkTimeValidity';
import { checkNotificationPermission } from '../services/checkNotificationsPermission';
import { safeFetch } from '../services/safeFetch';
import { isDeliveryClosed } from '../services/isAppClosed';

export default function OrderScreen({ route, navigation, scale }: { route: any, navigation: any, scale: any }) {
  const styles = getStyles(scale);
  const isSubmittingRef = useRef(false);
  const submissionLock = useRef(false);
  const isLocked = useRef(false);

  // useEffect(() => {
  //   const lockTimeout = setTimeout(() => {
  //     isLocked.current = false; // Unlock after 5 seconds
  //   }, 5000);
  //   return () => clearTimeout(lockTimeout); // Cleanup on unmount
  // }, [isLocked]);

  const { expoPushToken, notification } = usePushNotifications();
  const { dispatch } = useCart();
  const { cartState, storageOrder } = route.params;
  const [showPicker, setShowPicker] = useState(false);
  const [timeString, setTimeString] = useState("null");
  const [saveData, setSaveData] = useState(false);
  const isCroatianLang = isCroatian();
  const [lastOrder, setLastOrder] = useState<StorageModel | null>(null);
  const { general } = useGeneral();
  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  console.log("checkNotificationPermission ", checkNotificationPermission());

  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const permission = await checkNotificationPermission();
      setHasNotificationPermission(permission);
    }
    checkPermission();
  }, []);

  // If storageOrder is undefined or null, provide default values.
  const orderName = storageOrder?.name || lastOrder?.name || '';
  const orderPhone = storageOrder?.phone || lastOrder?.phone || '';
  const orderAddress = storageOrder?.address || lastOrder?.address || '';
  const orderZone = storageOrder?.zone || lastOrder?.zone || '';
  const orderNote = storageOrder?.note || '';

  const [isSlidRight, setIsSlidRight] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  const [errors, setErrors] = useState({ name: '', phone: '', address: '', zone: '' });
  const [displayMessage, setDisplayMessage] = useState(false);
  const [displaySecondMessage, setDisplaySecondMessage] = useState(false);
  const [displayWorkTimeMessage, setDisplayWorkTimeMessage] = useState(false);
  const [displayDeliveryClosedMessage, setDisplayDeliveryClosedMessage] = useState(false);
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
    totalPrice: orderPrice + (isSlidRight ? general?.deliveryPrice : 0)
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
      totalPrice: orderPrice + (isSlidRight ? general?.deliveryPrice : 0),
    }))

    if (timeString !== "undefined:undefined" && timeString !== "null") {
      console.log("ffvf", timeString)
      checkTimeValidity({ hours: Number(timeString.split(":")[0]), minutes: Number(timeString.split(":")[1]) }, setTimeString, setDisplayMessage, setDisplayWorkTimeMessage, setShowPicker, isSlidRight, general);
    }
  }, [isSlidRight])

  const handleSubmit = async () => {
    console.log("submit clicked");
    if (isDeliveryClosed(general?.workTime[dayOfWeek]) && isSlidRight) {
      setDisplayWorkTimeMessage(true);
      return;
    }
    if (isLocked.current) return;
    isLocked.current = true; // Lock instantly


    // Calculate current time
    const currentDate = getLocalTime();
    console.log("loggg", currentDate);
    const manipulativeCurrentDate = getLocalTime();
    console.log("shrek1", manipulativeCurrentDate);

    let deadline = "";

    // Fake currentDate to be 23:00 in Europe/Zagreb time

    if (selectedDeliveryOption === "standard") {
      console.log("Standard:");
      // Standard case: add the predefined time (delivery or pickup)
      const additionalTime = orderData.isDelivery ? (general?.deliveryTime || 0) : (general?.pickUpTime || 0);
      manipulativeCurrentDate.setMinutes(manipulativeCurrentDate.getMinutes() + additionalTime);

      deadline = manipulativeCurrentDate.toISOString();

    } else if (selectedDeliveryOption === "custom") {
      // Convert timeString (e.g., "16:18") into a full date string
      const [hours, minutes] = timeString.split(':').map(Number);
      deadline = setTimeInISOString(manipulativeCurrentDate.toISOString(), hours, minutes);


      if (!timeString || !timeString.includes(":")) {
        console.log("Invalid or missing time string");
        setDisplaySecondMessage(true);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        isLocked.current = false;
        return;
      }
    }

    // Validate form and submit only after the update
    const notificationResult = await checkNotificationPermission();

    if (validateForm(orderData, isSlidRight, setErrors, general?.minOrder, isCroatianLang)) {
      try {
        // console.log("expoPushToken", expoPushToken);
        // console.log("check123", notificationResult)
        if (!notificationResult || expoPushToken) {
          const orderDataWithToken = {
            ...orderData,
            token: expoPushToken?.data,
            totalPrice: orderPrice + (isSlidRight ? general?.deliveryPrice : 0),
            timeOption: selectedDeliveryOption,
            time: currentDate,
            deadline: deadline,
            language: isCroatianLang ? "hr" : "en",
            zone: orderData.isDelivery ? orderData.zone : '',
          };

          const response = await safeFetch(`${backendUrl}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDataWithToken),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log("Ne radi", errorText)
            // throw new Error(`Server error: ${response.status} ${errorText}`);
          }

          const { id } = await response.json();
          if (id) {
            console.log('Orderdata:', orderData);
            await storeData(id, orderDataWithToken);
            updateMealPopularity(orderData.cartItems);
            dispatch({ type: 'CLEAR_CART' });
            navigation.navigate('ThankYouScreen', { isCroatianLang, notificationResult });
          } else {
            throw new Error('Missing order ID in response.');
          }
        }
        else {
          console.log('Missing expoPushToken.');
        }
      } catch (err: any) {
        alert(`${isCroatianLang ? "Greška u izvršavanju narudžbe. Pokušajte ponovo" : "Error submitting order. Please try again"}`);
        console.error(err);
      }
    } else {
      isLocked.current = false;
      console.log("Form validation failed");
    }
    isSubmittingRef.current = false;
    submissionLock.current = false;
    setIsSubmitting(false);
    isLocked.current = false;
}

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView >
        <Slider
          workingHours={general?.workTime[dayOfWeek]}
          isSlidRight={isSlidRight}
          setIsSlidRight={setIsSlidRight}
          boxWidth={boxWidth}
          setBoxWidth={setBoxWidth}
          orderData={orderData}
          setOrderData={setOrderData}
          initialSide={storageOrder?.isDelivery ? (isDeliveryClosed(general?.workTime[dayOfWeek]) ? 'left' : 'right') : 'left'}
          isCroatianLang={isCroatianLang}
          scale={scale}
          setDisplayDeliveryClosedMessage={setDisplayDeliveryClosedMessage}
        />


        <RadioOrderSelection
          selectedDeliveryOption={selectedDeliveryOption}
          setSelectedDeliveryOption={setSelectedDeliveryOption}
          setShowPicker={setShowPicker}
          displayMessage={displayMessage}
          setDisplayMessage={setDisplayMessage}
          displayWorkTimeMessage={displayWorkTimeMessage}
          setDisplayWorkTimeMessage={setDisplayWorkTimeMessage}
          displayDeliveryClosedMessage={displayDeliveryClosedMessage}
          setDisplayDeliveryClosedMessage={setDisplayDeliveryClosedMessage}
          displaySecondMessage={displaySecondMessage}
          setDisplaySecondMessage={setDisplaySecondMessage}
          timeString={timeString}
          isSlidRight={isSlidRight}
          isCroatianLang={isCroatianLang}
          general={general}
          scale={scale}
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
        <Text style={styles.title}>{isCroatianLang ? 'Podaci za narudžbu' : 'Order data'}</Text>
        <View style={styles.paddingContainer}>
          <Orderform
            orderData={orderData}
            setOrderData={setOrderData}
            errors={errors}
            setErrors={setErrors}
            saveData={saveData}
            setSaveData={setSaveData}
            isCroatianLang={isCroatianLang}
            scale={scale}
          />
        </View>
        <Divider style={styles.divider} />
        <OrderDetails
          isCroatianLang={isCroatianLang}
          orderPrice={orderPrice}
          isSlidRight={isSlidRight}
          general={general}
          scale={scale}
        />

      </ScrollView>
      <Button
        mode="contained"
        style={[
          styles.orderButton,
          general?.workTime && appButtonsDisabled(general?.appStatus, general.workTime[dayOfWeek], general.holidays) && styles.disabledButton
        ]}
        onPress={() => {   if (!isLocked.current) handleSubmit(); }}
        disabled={!general?.workTime || appButtonsDisabled(general?.appStatus, general.workTime[dayOfWeek], general.holidays)
          || (hasNotificationPermission && !expoPushToken) || isSubmitting
        }
      >
        <Text allowFontScaling={false} style={[
          { fontSize: scale.isTablet() ? 30 : 20, fontFamily: 'Lexend_400Regular' },
          styles.textPosition,
          general?.workTime && appButtonsDisabled(general?.appStatus, general.workTime[dayOfWeek], general.holidays) && styles.disabledText // Change text color when disabled
        ]}>
          {isCroatianLang ? 'Završi narudžbu' : 'Confirm order'}
        </Text>
      </Button>

    </KeyboardAvoidingView>
  );
}

const getStyles = (scale: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    paddingContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    title: {
      fontFamily: 'Lexend_400Regular',
      fontSize: scale.light(22),
      marginBottom: 0,
      paddingLeft: 20,
      paddingVertical: 10,
    },
    orderButton: {
      backgroundColor: '#ffd400',
      color: '#fff',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 5,
      paddingVertical: 5,

    },
    button: {
      // height: scale.light(50),  // makni ovo
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginBottom: 20,
      backgroundColor: "#ffd400",
      borderRadius: 5,
      width: "90%",
      alignItems: "center",
      justifyContent: "center",
    },
    textPosition: {
      color: '#fff',
      lineHeight: scale.isTablet() ? 50 : 30, // Adjust this to control vertical alignment and prevent cropping
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
