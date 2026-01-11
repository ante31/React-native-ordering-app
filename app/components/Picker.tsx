import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; 
import * as Haptics from "expo-haptics"; 
import { isCroatian } from "../services/languageChecker";
import { getDayOfTheWeek, getLocalTime } from "../services/getLocalTime";
import { useGeneral } from "../generalContext";
import { checkTimeValidity } from "../services/checkTimeValidity";
import { formatTime } from "../services/formatTime";
import { getUpdatedTime } from "../services/getUpdatedTime";

const Picker = ({ showPicker, setShowPicker, timeString, setTimeString, isSlidRight, setDisplayWorkTimeMessage, setDisplayMessage }: any) => {
    const isCroatianLanguage = isCroatian();
    const { general } = useGeneral();
    const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

    // Definiraj offset: ako je isSlidRight TRUE, to je Preuzimanje (mali offset)
    const offset = general ? (isSlidRight ? general.pickUpTime : general.deliveryTime) : 45;

    const closingTime = isSlidRight ? general?.workTime[dayofWeek].closingTime : general?.workTime[dayofWeek].deliveryClosingTime;
    const openingTime = isSlidRight ? general?.workTime[dayofWeek].openingTime : general?.workTime[dayofWeek].deliveryOpeningTime;
  
    const [closingHour, closingMinutes] = (closingTime || "23:00").split(":").map(Number);
    const [openingHour, openingMinutes] = (openingTime || "09:00").split(":").map(Number);

    // Inicijalizacija s 0 da izbjegnemo suvišne pozive funkcije pri svakom renderu
    const [currentTime, setCurrentTime] = useState({ hours: 0, minutes: 0 });

    const refreshTime = (offsetArg: number) => {
        const newTime = getUpdatedTime(offsetArg);
        setCurrentTime(newTime);
        
        const [pickedHours, pickedMinutes] = timeString.split(":").map(Number);
        
        // 1. Ispravak ako je trenutno vrijeme prestiglo odabrano
        if (newTime.hours > pickedHours || (newTime.hours === pickedHours && newTime.minutes > pickedMinutes)) {
            setTimeString(formatTime(newTime));
        }
        // 2. Ispravak ako je vrijeme prije otvaranja
        else if (pickedHours < openingHour || (pickedHours === openingHour && pickedMinutes < openingMinutes)) {
            setTimeString(openingTime);
            setDisplayWorkTimeMessage(true);
        }
        // 3. Ispravak ako je vrijeme nakon zatvaranja
        else if (pickedHours > closingHour || (pickedHours === closingHour && pickedMinutes >= closingMinutes)) {
            setTimeString(formatTime({ hours: closingHour, minutes: closingMinutes }));
        }
    };

    useEffect(() => {
        // Pozovi refresh samo kad se promijeni mod (isSlidRight) ili offset
        refreshTime(offset);

        const interval = setInterval(() => {
            refreshTime(offset);
        }, 60000);

        return () => clearInterval(interval);
    }, [isSlidRight, offset]); // timeString je namjerno izbačen da se spriječi loop

    const onConfirm = (pickedDuration: { hours: number; minutes: number; }) => {
        checkTimeValidity(pickedDuration, setTimeString, setDisplayMessage, setDisplayWorkTimeMessage, setShowPicker, isSlidRight, general);
    };

    const areHoursDisabled = () => {
        return currentTime.hours > closingHour || (currentTime.hours === closingHour && currentTime.minutes >= closingMinutes);
    };

    return (
        <View style={{ backgroundColor: "#F1F1F1", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <TimerPickerModal
                hoursPickerIsDisabled={areHoursDisabled()}
                minutesPickerIsDisabled={areHoursDisabled()}
                visible={showPicker}
                setIsVisible={setShowPicker}
                onConfirm={onConfirm}
                hideSeconds
                hourLimit={{ 
                    max: closingHour, 
                    min: currentTime.hours <= openingHour ? openingHour : currentTime.hours 
                }}
                initialValue={{ 
                    hours: currentTime.hours <= openingHour ? openingHour : currentTime.hours, 
                    minutes: currentTime.hours <= openingHour ? openingMinutes : currentTime.minutes
                }}
                minuteInterval={5}
                onCancel={() => setShowPicker(false)}
                closeOnOverlayPress
                LinearGradient={LinearGradient}
                Haptics={Haptics}
                styles={{ theme: "light", text: { fontFamily: "Lexend_400Regular" }}}
                confirmButtonText={isCroatianLanguage ? "Potvrdi" : "Confirm"}
                cancelButtonText={isCroatianLanguage ? "Odustani" : "Cancel"}
            />
        </View>
    );
};

export default Picker;