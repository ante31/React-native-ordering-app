import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Orderform from '../components/OrderForm';
// import Slider from '../components/Slider';
import 'react-native-get-random-values';
import Picker from '../components/Picker';
import { RadioOrderSelection } from '../components/RadioOrderSelection';
import { appButtonsDisabled } from '../services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';
import { OrderDetails } from '../components/OrderDetails';
import { useGeneral } from '../generalContext';
import { isDeliveryClosed } from '../services/isAppClosed';
import CouponList from '../components/CouponList';
import useOrdersHook from '@/hooks/useOrders';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OrderScreen({ route, navigation, scale, }: { route: any; navigation: any; scale: any; }) 
{
  const styles = getStyles(scale);
  const { cartState, storageOrder, isDelivery } = route.params;
  const { general } = useGeneral();

  const dayOfWeek = getDayOfTheWeek( getLocalTime(), general?.holidays );

  const {
  orderData,
  setOrderData,

  errors,
  setErrors,

  coupons,
  selectedCoupon,
  useCoupon,

  saveData,
  setSaveData,

  isSlidRight,
  setIsSlidRight,

  selectedDeliveryOption,
  setSelectedDeliveryOption,

  timeString,
  setTimeString,

  ui,
  setUiValue,

  totalPrice,
  orderPrice,

  handleSubmit,
  isCroatianLang,
} = useOrdersHook({
  cartState,
  storageOrder,
  isDelivery,
  navigation,
});

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={styles.container}
    >
      <ScrollView>
        {/* <Slider
          workingHours={
            general?.workTime[dayOfWeek]
          }
          isSlidRight={isSlidRight}
          setIsSlidRight={setIsSlidRight}
          initialSide={
            storageOrder
              ? storageOrder.isDelivery
                ? !isDeliveryClosed(general?.workTime[dayOfWeek]) ? "left": "right"
                : "right"
              : "left"
          }
          isCroatianLang={isCroatianLang}
          scale={scale}
          setDisplayDeliveryClosedMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayDeliveryClosedMessage",
              value
            )
          }
        /> */}

        <View style={styles.deliveryTypeBanner}>
          <MaterialIcons
            name={isDelivery ? 'delivery-dining' : 'storefront'}
            size={28}
            color="#ffd400"
          />
          <Text style={styles.deliveryTypeText}>
            {isDelivery
              ? (isCroatianLang ? 'Dostava na adresu' : 'Delivery to address')
              : (isCroatianLang ? 'Preuzimanje u objektu' : 'Pickup in store')}
          </Text>
        </View>

        <RadioOrderSelection
          selectedDeliveryOption={
            selectedDeliveryOption
          }
          setSelectedDeliveryOption={
            setSelectedDeliveryOption
          }
          setShowPicker={(value: boolean) =>
            setUiValue(
              "showPicker",
              value
            )
          }
          displayMessage={
            ui.displayMessage
          }
          setDisplayMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayMessage",
              value
            )
          }
          displayWorkTimeMessage={
            ui.displayWorkTimeMessage
          }
          setDisplayWorkTimeMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayWorkTimeMessage",
              value
            )
          }
          displayDeliveryClosedMessage={
            ui.displayDeliveryClosedMessage
          }
          setDisplayDeliveryClosedMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayDeliveryClosedMessage",
              value
            )
          }
          displaySecondMessage={
            ui.displaySecondMessage
          }
          setDisplaySecondMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displaySecondMessage",
              value
            )
          }
          timeString={timeString}
          isSlidRight={!isDelivery}
          isCroatianLang={
            isCroatianLang
          }
          general={general}
          scale={scale}
        />

        <Picker
          showPicker={ui.showPicker}
          setShowPicker={(
            value: boolean
          ) =>
            setUiValue(
              "showPicker",
              value
            )
          }
          timeString={timeString}
          setTimeString={
            setTimeString
          }
          isSlidRight={!isDelivery}
          general={general}
          setDisplayWorkTimeMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayWorkTimeMessage",
              value
            )
          }
          setDisplayMessage={(
            value: boolean
          ) =>
            setUiValue(
              "displayMessage",
              value
            )
          }
        />

        <Divider style={styles.divider} />

        <Text style={styles.title}>
          {isCroatianLang
            ? "Podaci za narudžbu"
            : "Order data"}
        </Text>

        <View
          style={
            styles.paddingContainer
          }
        >
          <Orderform
            isDelivery={isDelivery}
            orderData={orderData}
            setOrderData={
              setOrderData
            }
            errors={errors}
            setErrors={setErrors}
            saveData={saveData}
            setSaveData={
              setSaveData
            }
            isCroatianLang={
              isCroatianLang
            }
            scale={scale}
          />
        </View>

        <Divider style={styles.divider} />

        <OrderDetails
          isCroatianLang={
            isCroatianLang
          }
          orderPrice={orderPrice}
          isSlidRight={!isDelivery}
          general={general}
          selectedCoupon={
            selectedCoupon
          }
          scale={scale}
        />

        {coupons.length > 0 && (
          <CouponList
            isCroatianLang={
              isCroatianLang
            }
            coupons={coupons}
            selectedCoupon={
              selectedCoupon
            }
            useCoupon={useCoupon}
            scale={scale}
            general={general}
            orderTotalPrice={
              orderPrice
            }
          />
        )}
      </ScrollView>



      <Button
        mode="contained"
        style={[
          styles.orderButton,

          general?.workTime &&
            appButtonsDisabled(
              general?.appStatus,
              general.workTime[
                dayOfWeek
              ],
              general.holidays
            ) &&
            styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={
          ui.isSubmitting ||
          !general?.workTime ||
          appButtonsDisabled(
            general?.appStatus,
            general.workTime[
              dayOfWeek
            ],
            general.holidays
          )
        }
      >
        <Text
          allowFontScaling={false}
          style={[
            {
              fontSize:
                scale.isTablet()
                  ? 30
                  : 18,

              fontFamily:
                "Lexend_400Regular",
            },

            styles.textPosition,

            general?.workTime &&
              appButtonsDisabled(
                general?.appStatus,
                general.workTime[
                  dayOfWeek
                ],
                general.holidays
              ) &&
              styles.disabledText,
          ]}
        >
          {isCroatianLang
            ? ui.isSubmitting
              ? "Slanje..."
              : `Završi narudžbu - ${
                  !isDelivery
                    ? "Preuzimanje"
                    : "Dostava"
                }`
            : ui.isSubmitting
            ? "Sending..."
            : `Confirm order - ${
                !isDelivery
                  ? "Pickup"
                  : "Delivery"
              }`}
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
    deliveryTypeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: '#fffbea',
      borderBottomWidth: 1,
      borderBottomColor: '#ffe566',
      gap: 10,
    },
    deliveryTypeText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: scale.light(17),
      color: '#333',
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

    textPosition: {
      color: '#fff',
      lineHeight: scale.isTablet() ? 50 : 30, 
      textAlignVertical: 'center', 
    },

    timePickerButton: {
      marginVertical: 10,
    },
    divider: {
      marginHorizontal: 10,
    },
    disabledButton: {
      backgroundColor: '#B0BEC5', 
      opacity: 0.6, 
    },
    disabledText: {
      color: '#fff', 
    }
  });

