import React, { useEffect, useState } from "react";
import { backendUrl } from "../../localhostConf";
import { ScrollView, View, Text, Button, Linking } from "react-native";
import { ActivityIndicator, Card, Title } from 'react-native-paper';
import { Category } from "../models/categoryModel";
import { StyleSheet } from 'react-native';
import { isCroatian } from "../services/languageChecker";
import { CenteredLoading } from "../components/CenteredLoading";
import { useGeneral } from "../generalContext";
import { getCroDaysOfTheWeek, getDayOfTheWeek, getDaysOfTheWeek, getLocalTime } from "../services/getLocalTime";
import { Image, Platform } from 'react-native';


export default function HomePage({ navigation }: { navigation: any }) {
  const { general } = useGeneral();
  const dayofWeek = getDayOfTheWeek(getLocalTime());
  const daysOfWeek = getDaysOfTheWeek();
  const croDaysOfWeek = getCroDaysOfTheWeek();
  const isCroatianLanguage = isCroatian();
  console.log("routes ", navigation.getState().routes);

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

  const handlePress = (title: string, titleEn: string, image: string) => {
    navigation.navigate('CategoryPage', { title, titleEn });
  };

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {

    fetch(`${backendUrl}/kategorije`)
      .then(response => {
        return response.json();
      })
      .then(data => {

        const categoryList = Object.keys(data).map(key => {
          const fullTitle = key.split('|');
          return {
            title: fullTitle[0],  // Croatian
            titleEn: fullTitle[1], // English
            image: data[key],
          };
        });

        setCategories(categoryList);
      })
      .catch(error => {
        console.error('❌ Error fetching categories:', error);
      });
  }, []);


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {categories.length === 0 ? (
        <CenteredLoading />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            //maxWidth: 850,
            marginHorizontal: 'auto',
          }}
        >
        {categories.map((item, index) => (
          <View key={index} style={{ width: '50%', padding: 5 }}>
            <Card onPress={() => handlePress(item.title, item.titleEn, item.image)}>
              {Platform.OS === 'ios' ? (
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: '100%',
                    height: 200,
                    resizeMode: 'cover',
                    borderRadius: 10,
                  }}
                />
              ) : (
                <Card.Cover source={{ uri: item.image }} style={{ backgroundColor: 'white' }} />
              )}
              <Card.Content>
                <Title style={{ color: 'black' }}>
                  {isCroatianLanguage ? item.title : item.titleEn}
                </Title>
              </Card.Content>
            </Card>
          </View>
        ))}
          <View style={{ width: '100%', backgroundColor: 'white', marginTop: 5, padding: 10 }}>
            <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>
                  Radno vrijeme:
                </Text>
                {general?.workTime && isEveryTimeSame(general.workTime, true) ? (
                  <Text style={{ fontSize: 12, marginBottom: 3, textAlign: 'center' }}>
                    Radni dan: {general.workTime[daysOfWeek[1]]?.openingTime ?? '-'} - {general.workTime[daysOfWeek[1]]?.closingTime ?? '-'}
                  </Text>
                ) : (
                  general?.workTime ? daysOfWeek.map((day, index) => {
                    if (day === "Sunday") return null;
                    const time = general.workTime[day];
                    return (
                      <Text key={index} style={{ fontSize: 12, marginBottom: 3, textAlign: 'center' }}>
                        {isCroatianLanguage ? croDaysOfWeek[index] : day}: {time?.openingTime ?? '-'} - {time?.closingTime ?? '-'}
                      </Text>
                    );
                  }) : <Text style={{ textAlign: 'center' }}>Nema radnog vremena.</Text>
                )}


                <Text style={{ fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                  {isCroatianLanguage ? "Nedjelja" : "Sunday"}: {general?.workTime?.Sunday?.openingTime ?? '-'} - {general?.workTime?.Sunday?.closingTime ?? '-'}
                </Text>
              </View>

              <View style={{
                flex: 1, paddingHorizontal: 10

              }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>
                  Vrijeme dostave:
                </Text>
                {general?.workTime && isEveryTimeSame(general.workTime, false) ? (
                  <Text style={{ fontSize: 12, marginBottom: 3, textAlign: 'center' }}>
                    Radni dan: {general.workTime[daysOfWeek[1]]?.deliveryOpeningTime ?? '-'} - {general.workTime[daysOfWeek[1]]?.deliveryClosingTime ?? '-'}
                  </Text>
                ) : (
                  general?.workTime ? daysOfWeek.map((day, index) => {
                    if (day === "Sunday") return null;
                    const time = general.workTime[day];
                    return (
                      <Text key={index} style={{ fontSize: 12, marginBottom: 3, textAlign: 'center' }}>
                        {isCroatianLanguage ? croDaysOfWeek[index] : day}: {time?.deliveryOpeningTime ?? '-'} - {time?.deliveryClosingTime ?? '-'}
                      </Text>
                    );
                  }) : <Text style={{ textAlign: 'center' }}>Nema vremena dostave.</Text>
                )}

                <Text style={{ fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                  {isCroatianLanguage ? "Nedjelja" : "Sunday"}: {general?.workTime?.Sunday?.deliveryOpeningTime ?? '-'} - {general?.workTime?.Sunday?.deliveryClosingTime ?? '-'}
                </Text>
              </View>
            </View>
            {/* Privacy Policy Link */}
            <Text
              style={{ fontSize: 12, color: 'blue', textDecorationLine: 'underline', textAlign: 'center' }}
              onPress={() => {
                // Ovdje dodajte navigaciju ili otvaranje linka za Privacy Policy
                Linking.openURL('https://ff-gricko.web.app/privacy/');
              }}
            >
              Privacy Policy
            </Text>
          </View>

        </ScrollView>
      )}
    </View>
  );

}


