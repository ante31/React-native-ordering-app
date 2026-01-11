import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet} from "react-native";
import { HelperText, RadioButton } from "react-native-paper";
import { appButtonsDisabled, onlyCustomOrders } from "../services/isAppClosed";
import { getDayOfTheWeek, getLocalTime, getLocalTimeHours, getLocalTimeMinutes } from "../services/getLocalTime";
import { useGeneral } from "../generalContext";

export const RadioOrderSelection = ({selectedDeliveryOption, setSelectedDeliveryOption, setShowPicker, displayMessage, setDisplayMessage, displayWorkTimeMessage, setDisplayWorkTimeMessage, displaySecondMessage, setDisplaySecondMessage, displayDeliveryClosedMessage, setDisplayDeliveryClosedMessage, timeString, isSlidRight, isCroatianLang, scale}: any) => {
    const styles = getStyles(scale);
    const {general} = useGeneral();
    const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

    useEffect(() => {
      console.log("selectedDeliveryOption in RadioOrderSelection", selectedDeliveryOption);
    }, [selectedDeliveryOption]);

    useEffect(() => {
        if (onlyCustomOrders(general?.workTime[dayofWeek]) && selectedDeliveryOption === 'standard') {
            setSelectedDeliveryOption('custom'); 
            setShowPicker(true);
        }
    }, [general, selectedDeliveryOption, setSelectedDeliveryOption, setShowPicker]);

    useEffect(() => {
        if (displayMessage) {
            const timer = setTimeout(() => {
                setDisplayMessage(false);
            }, 5000); 
            return () => clearTimeout(timer); 
        }
    }, [displayMessage, setDisplayMessage]);

    useEffect(() => {
        if (displayWorkTimeMessage) {
            const timer = setTimeout(() => {
                setDisplayWorkTimeMessage(false);
            }, 5000);

            return () => clearTimeout(timer); 
        }
    }, [displayWorkTimeMessage, setDisplayWorkTimeMessage]);

    useEffect(() => {
        if (displaySecondMessage) {
            const timer = setTimeout(() => {
                setDisplaySecondMessage(false);
            }, 5000); 

            return () => clearTimeout(timer); 
        }
    }, [displaySecondMessage, setDisplaySecondMessage]);
    
console.log("nirnngotinh6im4poim", isCroatianLang ?  
                !isSlidRight 
                ? `Minimalno vrijeme za dostavu je ${general?.deliveryTime} min`
                : `Minimalno vrijeme za preuzimanje je ${general?.pickUpTime} min`  
            : !isSlidRight 
                ? `Minimum delivery time is ${general?.deliveryTime} min`
                : `Minimum pickup time is ${general?.pickUpTime} min`
        )
    return (
    <View style={[styles.radioButtonContainer, styles.paddingContainer]}>
        {displayWorkTimeMessage && (
            <HelperText type="error" visible={!!displayWorkTimeMessage}>
            {
            isCroatianLang 
            ?  !isSlidRight 
            ? `Radno vrijeme dostave je od ${general?.workTime[dayofWeek].deliveryOpeningTime} do ${general?.workTime[dayofWeek].deliveryClosingTime}`
            : `Radno vrijeme fast fooda je od ${general?.workTime[dayofWeek].openingTime} do ${general?.workTime[dayofWeek].closingTime}`  
            : !isSlidRight 
            ? `The delivery working hours are from ${general?.workTime[dayofWeek].deliveryOpeningTime} to ${general?.workTime[dayofWeek].deliveryClosingTime}` 
            : `The pickup working hours are from ${general?.workTime[dayofWeek].openingTime} to ${general?.workTime[dayofWeek].closingTime}`        
            }
            </HelperText>  
        )}
        {displayDeliveryClosedMessage && (
            <HelperText type="error" visible={!!displayDeliveryClosedMessage}>
            {
            isCroatianLang 
            ?  
            `Radno vrijeme dostave je od ${general?.workTime[dayofWeek].deliveryOpeningTime} do ${general?.workTime[dayofWeek].deliveryClosingTime}`
            :
            `The delivery working hours are from ${general?.workTime[dayofWeek].deliveryOpeningTime} to ${general?.workTime[dayofWeek].deliveryClosingTime}` 
            }
            </HelperText>  
        )}
        <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale.isTablet() ? 20 : 6 }}
           onPress={() => {
                if (onlyCustomOrders(general?.workTime[dayofWeek])) {
                    setDisplayWorkTimeMessage(true);
                } else {
                    setSelectedDeliveryOption('standard');
                    console.log("Set to standard");
                    setShowPicker();
                    setDisplayMessage(false);
                    console.log("LT", getLocalTimeHours(), getLocalTimeMinutes());
                }
            }}
            disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
        >
            <RadioButton
                disabled={onlyCustomOrders(general?.workTime[dayofWeek]) || appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
                color="#ffe521"
                value="standard"
                status={selectedDeliveryOption === 'standard' && !onlyCustomOrders(general?.workTime[dayofWeek]) ? 'checked' : 'unchecked'}
                onPress={() => {setSelectedDeliveryOption('standard')
                                console.log("Set to standard")
                                setShowPicker()
                                setDisplayMessage(false)
                            }}
            />
            <Text 
                style={styles.radioButtonText}
                
            >
                {isCroatianLang? "Standarno": "Standard"}
            </Text>
            {selectedDeliveryOption==='standard' && !appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && <View >
                <View style={styles.box}>
                    <MaterialIcons name="access-time" size={20} color="#DA291C" />
                    <Text style={styles.radioButtonText}> {!isSlidRight? general?.deliveryTime: general?.pickUpTime} min</Text>
                </View>
            </View>}
        </TouchableOpacity>
        {displayMessage && (
            <HelperText type="error" visible={!!displayMessage}>
            {
            isCroatianLang ?  
                !isSlidRight 
                ? `Minimalno vrijeme za dostavu je ${general?.deliveryTime} min`
                : `Minimalno vrijeme za preuzimanje je ${general?.pickUpTime} min`  
            : !isSlidRight 
                ? `Minimum delivery time is ${general?.deliveryTime} min`
                : `Minimum pickup time is ${general?.pickUpTime} min`
            }
            </HelperText>  
        )}
        {displaySecondMessage && (
            <HelperText type="error" visible={!!displaySecondMessage}>
            {
            isCroatianLang ?  
            !isSlidRight? "Odaberite vrijeme dostave ispod": "Odaberite vrijeme preuzimanja ispod"
            : !isSlidRight? "Select delivery time below": "Select pickup time below"
            }
            </HelperText>  
        )}
        <TouchableOpacity
  disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  }}
  onPress={() => {
    setSelectedDeliveryOption('custom');
    setShowPicker(true);
  }}
>
  <RadioButton
    color="#ffe521"
    value="custom"
    disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
    status={selectedDeliveryOption === 'custom' ? 'checked' : 'unchecked'}
    onPress={() => {
      setSelectedDeliveryOption('custom');
      setShowPicker(true);
    }}
  />

  <Text
    style={[
      styles.radioButtonText,
      {
        flexShrink: 1,
        flexWrap: 'nowrap',
        marginRight: 5,
      },
    ]}
    numberOfLines={2}
    ellipsizeMode="tail"
  >
    {isCroatianLang
      ? `Odaberi vrijeme ${!isSlidRight ? 'dostave' : 'preuzimanja'}`
      : `Select ${!isSlidRight ? 'delivery' : 'pickup'} time`}
  </Text>

  {timeString != "null" && selectedDeliveryOption === 'custom' && (
    <View
      style={[
        styles.box,
        {
          flexDirection: 'row',
          alignItems: 'center',
        },
      ]}
    >
      <MaterialIcons name="access-time" size={20} color="#DA291C" />
      <Text
        style={{
          marginLeft: 4,
          color: '#000',
          fontSize: 18,
          fontFamily: 'Lexend_400Regular',
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {timeString}
      </Text>
    </View>
  )}
</TouchableOpacity>


    </View>
  );
}

const getStyles = (scale: any) =>
  StyleSheet.create({
    radioButtonContainer: {
        marginTop: scale.isTablet() ? 24 : 12,
      },
      radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      radioButtonText: {
        fontFamily: 'Lexend_400Regular',
        fontSize: scale.light(14),
        color: '#000',
      },
      paddingContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
      },
      box: {
        flexDirection: 'row' as 'row', 
        alignItems: 'center' as 'center', 
        padding: 5,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8, 
        backgroundColor: '#f5f5f5', 
      },
});
