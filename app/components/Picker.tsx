import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; 
import * as Haptics from "expo-haptics"; 
import { isCroatian } from "../services/languageChecker";
import { getDayOfTheWeek, getLocalTime, getLocalTimeHours, getLocalTimeMinutes } from "../services/getLocalTime";
import { useGeneral } from "../generalContext";
import { checkTimeValidity } from "../services/checkTimeValidity";
import { formatTime } from "../services/formatTime";
import { getUpdatedTime } from "../services/getUpdatedTime";

const Picker = ({ showPicker, setShowPicker, timeString, setTimeString, isSlidRight, setDisplayWorkTimeMessage, setDisplayMessage }: any) => {
    const isCroatianLanguage = isCroatian();
    const {general} = useGeneral();
    const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

    const closingTime = isSlidRight ? general?.workTime[dayofWeek].deliveryClosingTime : general?.workTime[dayofWeek].closingTime;
    const openingTime = isSlidRight ? general?.workTime[dayofWeek].deliveryOpeningTime : general?.workTime[dayofWeek].openingTime;
  
    const [closingHour, closingMinutes] = (closingTime || "23:00").split(":").map(Number);
    const [openingHour, openingMinutes] = (openingTime || "09:00").split(":").map(Number);

    const [offset, setOffset] = useState(general? isSlidRight ? general.deliveryTime : general.pickUpTime: 45);


    const [currentTime, setCurrentTime] = useState(getUpdatedTime(offset));

    const refreshTime = () => {
        const newTime = getUpdatedTime(offset);
            setCurrentTime(newTime);

            // De-format the timeString into hours and minutes
            const [pickedHours, pickedMinutes] = timeString.split(":").map(Number);

            // Check if current time surpassed picked duration
            if (
                newTime.hours > pickedHours || 
                (newTime.hours === pickedHours && newTime.minutes > pickedMinutes)
            ) {
                setTimeString(formatTime(newTime));
            }
            //check if time before opening is chosen
            else if(pickedHours < openingHour || (pickedHours === openingHour && pickedMinutes < openingMinutes)){
                setTimeString(openingTime);
                setDisplayWorkTimeMessage(true); // Trigger the message display

            }

            // Ensure max time is 23:00
            if (pickedHours > 23 || (pickedHours === 23 && pickedMinutes >= 0)) {
                setTimeString("23:00");
            }
    }

    useEffect(() => {
        setOffset(general? isSlidRight ? general.deliveryTime : general.pickUpTime: 45);
        refreshTime();
        const interval = setInterval(() => {
            refreshTime();
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [timeString, isSlidRight]); // Add `timeString` and `offset` as dependencies


    const onConfirm = (pickedDuration: { hours: number; minutes: number; }) => {

        checkTimeValidity(pickedDuration, setTimeString, setDisplayMessage, setDisplayWorkTimeMessage, setShowPicker, isSlidRight, general);
    };

    const areHoursDisabled = () => {
        return currentTime.hours > closingHour || (currentTime.hours === closingHour && currentTime.minutes >= closingMinutes);
    };

    return (
        <View style={{ backgroundColor: "#F1F1F1", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <TimerPickerModal
                hoursPickerIsDisabled = {areHoursDisabled()}
                minutesPickerIsDisabled = {areHoursDisabled()}
                visible={showPicker}
                setIsVisible={setShowPicker}
                onConfirm={onConfirm}
                hideSeconds
                hourLimit={{ max: closingHour, min: currentTime.hours <= openingHour ? openingHour : currentTime.hours }}
                initialValue={{ 
                    hours: currentTime.hours <= openingHour ? openingHour : currentTime.hours, 
                    minutes: currentTime.hours <= openingHour ? openingMinutes : currentTime.minutes
                }}
                
                minuteInterval={5}
                onCancel={() => setShowPicker(false)}
                closeOnOverlayPress
                LinearGradient={LinearGradient}
                Haptics={Haptics}
                styles={{ theme: "light" }}
                confirmButtonText={isCroatianLanguage ? "Potvrdi" : "Confirm"}
                cancelButtonText={isCroatianLanguage ? "Odustani" : "Cancel"}
            />
        </View>
    );
};

export default Picker;
