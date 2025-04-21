import { useState } from 'react';
import { TextInput, HelperText, Checkbox, ActivityIndicator } from "react-native-paper";
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { geodecode, getLocation } from '../services/locationService';
import DropdownComponent from './DropdownPicker';

const Orderform = ({ orderData, setOrderData, errors, saveData, setSaveData, isCroatianLang }: any) => {
  const [loading, setLoading] = useState(false);
  const theme = {
    colors: {
      primary: 'black',
      underlineColor: 'transparent',
      text: 'red', // Label color is controlled by the 'text' color in React Native Paper theme
    },
  };

  const handleLocationPress = async (event: any) => {
    event.stopPropagation(); // Prevents input field from being focused
    Keyboard.dismiss(); // Manually dismiss the keyboard to prevent unwanted focus

    setLoading(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }    
    const location = await getLocation();
    
    if (location) {
      const geoaddress = await geodecode(location);
      if (geoaddress) {
        const [part1, part2, part3] = geoaddress.split(", ");
        console.log("P3", part3)
        if (part3 === "aerodrom"){
          setOrderData({ ...orderData, address: part1, zone: "Resnik i Divulje" });
        }
        else if (part2 === "Kaštel Novi"){
          if (part3 === "above"){
            setOrderData({ ...orderData, address: part1, zone: "Rudine" });
          }
          else{
            setOrderData({ ...orderData, address: part1, zone: part2 });
          }
        }
        else if (part2 === "Kaštel Stari"){
          if (part3 === "above"){
            setOrderData({ ...orderData, address: part1, zone: "Radun" });
          }
          else{
            setOrderData({ ...orderData, address: part1, zone: part2 });
          }
        }
        else if (part2 === "Kaštel Lukšić"){
          if (part3 === "above"){
            setOrderData({ ...orderData, address: part1, zone: "Kaštel Lukšić poviše magistrale" });
          }
          else{
            setOrderData({ ...orderData, address: part1, zone: part2 });
          }
        }
        else if (part3 !== "outside"){
          setOrderData({ ...orderData, address: part1, zone: part2 });
        }
        else{
          setOrderData({ ...orderData, address: part1})
        }

        console.log("Formatted Address:", geoaddress);
      }
    }

    setLoading(false);
  };

  return (
    <View>
      <TextInput 
        label={isCroatianLang ? 'Ime' : 'Name'}
        mode="outlined" 
        value={orderData.name} 
        onChangeText={(text) => setOrderData({ ...orderData, name: text })} 
        left={<TextInput.Icon icon="account" color="#ffcc00" />}
        style={styles.input}
        theme={theme} />
      {errors.name && <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>}

      <TextInput 
        label={isCroatianLang ? 'Telefon' : 'Phone number'}
        mode="outlined"
        keyboardType="phone-pad"
        value={orderData.phone}
        left={<TextInput.Icon icon="phone" color="#ffcc00" />}
        onChangeText={(text) => setOrderData({ ...orderData, phone: text })} style={styles.input} 
        theme={theme} />
      {errors.phone && <HelperText type="error" visible={!!errors.phone}>{errors.phone}</HelperText>}
   
      {orderData.isDelivery && <TextInput 
        label={isCroatianLang ? 'Adresa' : 'Address'}
        mode="outlined"
        value={orderData.address}
        onChangeText={(text) => setOrderData({ ...orderData, address: text })}
        left={<TextInput.Icon icon="map-marker" color="#ffcc00" />}
        right={
          !loading ? (
            <TextInput.Icon 
              icon="crosshairs-gps" 
              color="#ffcc00" 
              onPress={(event) => handleLocationPress(event)} 
              />
          ): (
            <TextInput.Icon
              icon={() => <ActivityIndicator size="small" color="#ffcc00" />}
            />
          )
        }        
        style={styles.input}
        theme={theme} />}
      {errors.address && orderData.isDelivery && <HelperText type="error" visible={!!errors.address}>{errors.address}</HelperText>}

      {orderData.isDelivery && (
        <DropdownComponent orderData={orderData} setOrderData={setOrderData} isCroatianLang={isCroatianLang}/>
      )}
      {errors.zone && orderData.isDelivery && <HelperText type="error" visible={!!errors.zone}>{errors.zone}</HelperText>}

      <TextInput 
        label={isCroatianLang ? 'Napomena' : 'Note'}
        mode="outlined"
        value={orderData.note}
        onChangeText={(text) => setOrderData({ ...orderData, note: text })}
        left={<TextInput.Icon icon="comment-text-outline" color="#ffcc00" />}
        style={styles.input}
        theme={theme} />

      {/* <View style={styles.checkboxTextContainer}>
        <Checkbox
          status={saveData ? 'checked' : 'unchecked'} // Check if the full key is in selectedExtras
          onPress={() => {
            setSaveData(!saveData);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }} 
          color="#ffe521"
        />
        <Text onPress={() => {
            setSaveData(!saveData);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }} 
        >
          {isCroatianLang ? 'Spremi podatke' : 'Save order'}
        </Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxTextContainer: { 
    flexDirection: 'row', alignItems: 'center' 
  },
  input: {
    marginBottom: 10,
  },
  container: {
    position: "relative",
  },
});

export default Orderform;
