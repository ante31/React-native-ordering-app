import React from 'react';
import { View, Text, Linking } from 'react-native';
import { useGeneral } from '../generalContext';
import { getCroDaysOfTheWeek, getDayOfTheWeek, getDaysOfTheWeek, getLocalTime } from "../services/getLocalTime";

const Footer = ({ scale, general, isCroatianLanguage }: any) => {
  const dayofWeek = getDayOfTheWeek(getLocalTime());
  const daysOfWeek = getDaysOfTheWeek();
  const croDaysOfWeek = getCroDaysOfTheWeek();

  const isEveryTimeSame = (workTime: any, preuzimanje: any) => {
    let isSame = true;
    if (preuzimanje) {
      for (let i = 1; i < daysOfWeek.length - 1; i++) {
        if (workTime[daysOfWeek[i]] === "Sunday") {
          console.log(`Skipping comparison for ${daysOfWeek[i]}`);
          continue;
        }
        if (!workTime[daysOfWeek[i + 1]]) {
          console.log(`No work time information for ${daysOfWeek[i + 1]}`);
          break;
        }
        if (workTime[daysOfWeek[i]].openingTime !== workTime[daysOfWeek[i + 1]].openingTime || workTime[daysOfWeek[i]].closingTime !== workTime[daysOfWeek[i + 1]].closingTime) {
          console.log(`Mismatch found: ${daysOfWeek[i]} (${workTime[daysOfWeek[i]].openingTime} - ${workTime[daysOfWeek[i]].closingTime}) vs ${daysOfWeek[i + 1]} (${workTime[daysOfWeek[i + 1]].openingTime} - ${workTime[daysOfWeek[i + 1]].closingTime})`);
          isSame = false;
          break;
        }
      }
    }
    else {
      for (let i = 1; i < daysOfWeek.length - 1; i++) {
        if (workTime[daysOfWeek[i]] === "Sunday") continue;
        if (!workTime[daysOfWeek[i + 1]]) break;
        if (workTime[daysOfWeek[i]].deliveryOpeningTime !== workTime[daysOfWeek[i + 1]].deliveryOpeningTime || workTime[daysOfWeek[i]].deliveryClosingTime !== workTime[daysOfWeek[i + 1]].deliveryClosingTime) {
          isSame = false;
          break;
        }
      }
    }
    return isSame;
  };

  return (
    <View style={{ width: '100%', backgroundColor: '#ffd400', marginTop: 5, padding: 10 }}>
      <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: scale.light(14), marginBottom: 5, textAlign: 'center' }}>
            {isCroatianLanguage ? 'Radno vrijeme:' : 'Working hours:'}
          </Text>
          {general?.workTime && isEveryTimeSame(general.workTime, true) ? (
            <Text
              style={{
                fontFamily: 'Lexend_400Regular',
                fontSize: scale.light(12),
                marginBottom: 3,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {isCroatianLanguage ? 'Radni dan' : 'Weekday'}:{' '}
              {`${general.workTime[daysOfWeek[1]]?.openingTime ?? '-'}\u00A0–\u00A0${general.workTime[daysOfWeek[1]]?.closingTime ?? '-'}`}
            </Text>

          ) : (
            general?.workTime ? daysOfWeek.map((day, index) => {
              if (day === "Sunday") return null;
              const time = general.workTime[day];
              return (
                <Text
                  key={index}
                  style={{
                    fontFamily: 'Lexend_400Regular',
                    fontSize: scale.light(12),
                    marginBottom: 3,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {isCroatianLanguage ? croDaysOfWeek[index] : day}:{' '}
                  {`${time?.openingTime ?? '-'}\u00A0–\u00A0${time?.closingTime ?? '-'}`}
                </Text>
              );
            }) : <Text style={{ textAlign: 'center', fontSize: scale.light(12) }}>Učitavanje...</Text>
          )}
          <Text
            style={{
              fontFamily: 'Lexend_400Regular',
              fontSize: scale.light(12),
              marginBottom: 10,
              textAlign: 'center',
            }}
            numberOfLines={2}
          >
            {isCroatianLanguage ? 'Nedjelja' : 'Sunday'}:{' '}
            {(general?.workTime?.Sunday?.openingTime ?? '-') + '\u00A0–\u00A0' + (general?.workTime?.Sunday?.closingTime ?? '-')}
          </Text>
        </View>

        <View style={{
          flex: 1

        }}>
          <Text style={{ fontSize: scale.light(14), fontFamily: 'Lexend_700Bold', marginBottom: 5, textAlign: 'center' }}>
            {isCroatianLanguage ? 'Vrijeme dostave:' : 'Delivery hours:'}
          </Text>
          {general?.workTime && isEveryTimeSame(general.workTime, false) ? (
            <Text
              style={{
                fontFamily: 'Lexend_400Regular',
                fontSize: scale.light(12),
                marginBottom: 3,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {isCroatianLanguage ? 'Radni dan' : 'Weekday'}:{' '}
              {(general.workTime[daysOfWeek[1]]?.deliveryOpeningTime ?? '-') +
                '\u00A0–\u00A0' +
                (general.workTime[daysOfWeek[1]]?.deliveryClosingTime ?? '-')}
            </Text>
          ) : (
            general?.workTime ? daysOfWeek.map((day, index) => {
              if (day === "Sunday") return null;
              const time = general.workTime[day];
              return (
                <Text
                  key={index}
                  style={{
                    fontFamily: 'Lexend_400Regular',
                    fontSize: scale.light(12),
                    marginBottom: 3,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {(isCroatianLanguage ? croDaysOfWeek[index] : day) + ': '}
                  {(time?.deliveryOpeningTime ?? '-') +
                    '\u00A0–\u00A0' +
                    (time?.deliveryClosingTime ?? '-')}
                </Text>
              );
            }) : <Text style={{ fontFamily: 'Lexend_400Regular', textAlign: 'center', fontSize: scale.light(12) }}>Nema vremena dostave.</Text>
          )}
            <Text
              style={{
                fontFamily: 'Lexend_400Regular',
                fontSize: scale.light(12),
                marginBottom: 10,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {(isCroatianLanguage ? 'Nedjelja' : 'Sunday') + ': '}
              {(general?.workTime?.Sunday?.deliveryOpeningTime ?? '-') +
                '\u00A0–\u00A0' +
                (general?.workTime?.Sunday?.deliveryClosingTime ?? '-')}
            </Text>
        </View>
      </View>
      <Text
        style={{ fontFamily: 'Lexend_400Regular', fontSize: scale.light(12), color: 'blue', textDecorationLine: 'underline', textAlign: 'center' }}
        onPress={() => {
          Linking.openURL('https://ff-gricko.web.app/privacy/');
        }}
      >
        {isCroatianLanguage ? "Politika privatnosti" : "Privacy Policy"}
      </Text>
    </View>
  );
}

export default Footer;