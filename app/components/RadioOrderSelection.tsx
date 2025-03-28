import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HelperText, RadioButton } from "react-native-paper";
import { appButtonsDisabled, onlyCustomOrders } from "../services/isAppClosed";
import { getDayOfTheWeek, getLocalTime, getLocalTimeHours, getLocalTimeMinutes } from "../services/getLocalTime";
import { useGeneral } from "../generalContext";

export const RadioOrderSelection = ({selectedDeliveryOption, setSelectedDeliveryOption, setShowPicker, displayMessage, setDisplayMessage, displayWorkTimeMessage, setDisplayWorkTimeMessage, displaySecondMessage, setDisplaySecondMessage, timeString, isSlidRight, isCroatianLang}: any) => {
    const dayofWeek = getDayOfTheWeek(getLocalTime());
    const {general} = useGeneral();
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
            }, 5000); // Hide message after 5 seconds

            return () => clearTimeout(timer); // Clean up the timeout on component unmount
        }
    }, [displayMessage, setDisplayMessage]);

    useEffect(() => {
        if (displayWorkTimeMessage) {
            const timer = setTimeout(() => {
                setDisplayWorkTimeMessage(false);
            }, 5000); // Hide message after 5 seconds

            return () => clearTimeout(timer); // Clean up the timeout on component unmount
        }
    }, [displayWorkTimeMessage, setDisplayWorkTimeMessage]);

    useEffect(() => {
        if (displaySecondMessage) {
            const timer = setTimeout(() => {
                setDisplaySecondMessage(false);
            }, 5000); // Hide message after 5 seconds

            return () => clearTimeout(timer); // Clean up the timeout on component unmount
        }
    }, [displaySecondMessage, setDisplaySecondMessage]);
    

    return (
    <View style={[styles.radioButtonContainer, styles.paddingContainer]}>
        {displayWorkTimeMessage && (
            <HelperText type="error" visible={!!displayWorkTimeMessage}>
            {
            isCroatianLang 
            ?  isSlidRight 
            ? `Radno vrijeme dostave je od ${general?.workTime[dayofWeek].deliveryOpeningTime} do ${general?.workTime[dayofWeek].deliveryClosingTime}`
            : `Radno vrijeme fast fooda je od ${general?.workTime[dayofWeek].openingTime} do ${general?.workTime[dayofWeek].closingTime}`  
            : isSlidRight 
            ? `The delivery working hours are from ${general?.workTime[dayofWeek].deliveryOpeningTime} to ${general?.workTime[dayofWeek].deliveryClosingTime}` 
            : `The pickup working hours are from ${general?.workTime[dayofWeek].openingTime} to ${general?.workTime[dayofWeek].closingTime}`        
            }
            </HelperText>  
        )}
        <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
           onPress={() => {
                if (onlyCustomOrders(general?.workTime[dayofWeek])) {
                    setDisplayWorkTimeMessage(true);
                } else {
                    // If not disabled, proceed with the original logic
                    setSelectedDeliveryOption('standard');
                    console.log("Set to standard");
                    setShowPicker();
                    setDisplayMessage(false);
                    console.log("LT", getLocalTimeHours(), getLocalTimeMinutes());
                }
            }}
            disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
        >
            <RadioButton
                disabled={onlyCustomOrders(general?.workTime[dayofWeek]) || appButtonsDisabled(general?.workTime[dayofWeek])}
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
            {selectedDeliveryOption==='standard' && !appButtonsDisabled(general?.workTime[dayofWeek]) && <View >
                <View style={styles.box}>
                    <MaterialIcons name="access-time" size={20} color="#DA291C" />
                    <Text style={styles.radioButtonText}> {isSlidRight? general?.deliveryTime: general?.pickUpTime} min</Text>
                </View>
            </View>}
        </TouchableOpacity>
        {displayMessage && (
            <HelperText type="error" visible={!!displayMessage}>
            {
            isCroatianLang ?  
                isSlidRight 
                ? `Minimalno vrijeme za dostavu je ${general?.deliveryTime} min`
                : `Minimalno vrijeme za preuzimanje je ${general?.pickUpTime} min`  
            : isSlidRight 
                ? `Minimum delivery time is ${general?.deliveryTime} min`
                : `Minimum pickup time is ${general?.pickUpTime} min`
            }
            </HelperText>  
        )}
        {displaySecondMessage && (
            <HelperText type="error" visible={!!displaySecondMessage}>
            {onlyCustomOrders(general?.workTime[dayofWeek]) &&
            isCroatianLang ?  
            isSlidRight? "Odaberite vrijeme dostave ispod": "Odaberite vrijeme preuzimanja ispod"
            : isSlidRight? "Select delivery time below": "Select pickup time below"
            }
            </HelperText>  
        )}
        <TouchableOpacity 
            disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {setSelectedDeliveryOption('custom')
                setShowPicker(true);}}
        >
            <RadioButton
                color="#ffe521"
                value="custom"
                disabled={appButtonsDisabled(general?.workTime[dayofWeek])}
                status={selectedDeliveryOption === 'custom' ? 'checked' : 'unchecked'}
                onPress={() => {setSelectedDeliveryOption('custom')
                                setShowPicker(true);}}
            />
            <Text style={styles.radioButtonText}>
                  {isCroatianLang
                    ? `Odaberi vrijeme ${isSlidRight ? 'dostave' : 'preuzimanja'}`
                    : `Select ${isSlidRight ? 'delivery' : 'pickup'} time`}
            </Text>          
            {timeString != "null" && selectedDeliveryOption === 'custom' && 
            <View style={styles.box}>
                <MaterialIcons name="access-time" size={20} color="#DA291C" />
                <Text style={{color: '#000', fontSize: 18}}> {timeString}</Text>
            </View>
            }
        </TouchableOpacity>
    </View>
  );
}

const styles = {
    radioButtonContainer: {
        marginTop: 10,
      },
      radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      radioButtonText: {
        fontSize: 16,
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
        borderRadius: 8, // Za zaobljene rubove
        backgroundColor: '#f5f5f5', // Svijetla pozadina
      },
};
