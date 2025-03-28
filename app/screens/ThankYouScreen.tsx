import { Text, View, BackHandler, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

export default function ThankYouScreen({ route, navigation }: any) {
    const { isCroatianLang } = route.params;
    const nav = useNavigation();

    useEffect(() => {
        // Override the header back button to reset the stack and navigate to Home
        const handleHeaderBack = () => {
            console.log("Header back button pressed, navigating to Home");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
            return true; // Prevent default back behavior
        };

        // Override the default header back button
        navigation.setOptions({
            headerLeft: () => null, // Remove the default back button
            gestureEnabled: false, // Disable swipe back (iOS)
        });

        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPressOut={handleHeaderBack}>
                    <AntDesign
                        style={styles.icon}
                        color="black"
                        name="arrowleft"
                        size={20}
                    />
                </TouchableOpacity>
            ),
            gestureEnabled: false, // Disable swipe back (iOS)
        });

        // Custom hardware back button behavior
        const backAction = () => {
            console.log("Back button pressed, navigating to root");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
            return true; // Prevent default back behavior
        };

        BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", backAction);
        };
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
});