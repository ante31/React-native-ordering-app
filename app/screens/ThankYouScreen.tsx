import { Text, View, BackHandler, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import { useEffect, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { HeaderBackButton } from '@react-navigation/elements';

export default function ThankYouScreen({ route, navigation }: any) {
  const { isCroatianLang, notificationResult, scale } = route.params;
  const styles = getStyles(scale);
  const nav = useNavigation();
  console.log("NR", notificationResult)
  
    useEffect(() => {
      const backAction = () => {
        console.log("Back button pressed, navigating to root");
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return true;
      };
  
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }, [navigation]);

  return (
      <View style={styles.container}>
        {isCroatianLang ?
          <Image
            source={require('../../assets/images/thankYou-cro.png')}
            style={styles.image}
          />:
          <Image
            source={require('../../assets/images/thankYou-eng.png')}
            style={styles.image}
          />}
          {/* <Text style={styles.boldText}>{isCroatianLang ? "Hvala na narudžbi!" : "Thank you for your order!"}</Text> */}
          <View style={styles.textContainer}>
            {notificationResult? 
              <Text style={styles.boldText}>{isCroatianLang ? "Uskoro ćete primiti potvrdu." : "You will receive a confirmation message shortly."}</Text>
              :
              <Text style={styles.lightText}>{isCroatianLang ? "Status narudžbe možete vidjeti u posljednjim narudžabama. Ako želite primiti obavijesti o statusu narudžbe, molimo vas da omogučite obavijesti." : "You can check the status of your order in your recent orders. If you want to receive notification about the status of your order, please enable notifications."}</Text>
            }
          </View>
          <View style={{position: 'absolute', bottom: 20, width: '100%', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  console.log("Navigating to Home");
                  // Reset the navigation stack and navigate to Home screen
                  navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                  });
              }}
              style={styles.button}
              >
              <Text allowFontScaling={false} style={styles.buttonText}>{isCroatianLang? "Natrag": "Back"}</Text>
              </TouchableOpacity>
          </View>
      </View>
  );
}

const getStyles = (scale: any) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      },
    textContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      marginHorizontal: 20
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: 40,
      },
      boldText: {
        fontSize: 20,
        fontFamily: "Lexend_700Bold",
        color: "#333",
        marginBottom: 10,
      },
      lightText: {
        textAlign: 'center',
        fontFamily: "Lexend_400Regular",
        fontSize: 16,
        color: "#666",
      },
      button: {
        height: scale.isTablet() ? 100 : 50,
        marginBottom: 20,
        backgroundColor: "#ffd400",
        padding: 15,
        borderRadius: 5,
        width: "90%",
        alignItems: "center",
      },
      buttonText: {
        fontFamily: "Lexend_700Bold",
        lineHeight: scale.isTablet() ? 50 : 20, 
        fontSize: scale.isTablet() ? 30 : 17,
        color: "#fff",
      },
      icon: {
        marginRight: 30,
      },
      backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
      },
});