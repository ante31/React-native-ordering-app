import { Text, View, BackHandler, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import { useEffect, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { HeaderBackButton } from '@react-navigation/elements';

export default function ThankYouScreen({ route, navigation }: any) {
    const { isCroatianLang } = route.params;
    const nav = useNavigation();

    const handleHeaderBack = () => {
        console.log("Header back button pressed, navigating to Home");
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return true;
      };
    
      useLayoutEffect(() => {
        navigation.setOptions({
          gestureEnabled: true,
          headerLeft: () => (
            <View style={styles.backButtonContainer}>
              {Platform.OS === 'ios' ? (
                <>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      left: -50,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      padding: 0,
                      backgroundColor: 'transparent',
                    }}
                    onPressOut={handleHeaderBack}
                  />
                  <HeaderBackButton
                    onPress={() => {}}
                    style={{
                      marginRight: 10,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </>
              ) : (
                <>
                  <HeaderBackButton
                    onPress={() => {}}
                    style={{ marginRight: 10, marginLeft: -10 }}
                  />
                  <TouchableOpacity
                    style={[StyleSheet.absoluteFillObject, { padding: 0 }]}
                    onPressOut={handleHeaderBack}
                  />
                </>
              )}
            </View>
          ),
        });
      }, [navigation]);
    
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
            <Image
                source={{
                uri: "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg",
                }}
                style={styles.image}
            />
            <Text style={styles.boldText}>{isCroatianLang ? "Hvala na narudžbi!" : "Thank you for your order!"}</Text>
            <Text style={styles.lightText}>{isCroatianLang ? "Uskoro ćete primiti potvrdu." : "You will receive a confirmation message shortly."}</Text>
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
                <Text style={styles.buttonText}>{isCroatianLang? "Natrag": "Back"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      },
    image: {
        width: 200,
        height: 200,
        marginBottom: 40,
      },
      boldText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
      },
      lightText: {
        fontSize: 16,
        color: "#666",
      },
      button: {
        height: 60,
        marginBottom: 20,
        backgroundColor: "#FFC72C",
        padding: 15,
        borderRadius: 5,
        width: "90%",
        alignItems: "center",
      },
      buttonText: {
        fontSize: 18,
        fontWeight: "bold",
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