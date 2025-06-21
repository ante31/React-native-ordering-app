import { useEffect, useState } from 'react';
import { TextInput, HelperText, Checkbox, ActivityIndicator } from "react-native-paper";
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { geodecode, getLocation } from '../services/locationService';
import DropdownComponent from './DropdownPicker';

const Orderform = ({ orderData, setOrderData, errors, setErrors, saveData, setSaveData, isCroatianLang, scale }: any) => {
  const styles = getStyles(scale);
  const [loading, setLoading] = useState(false);
  const theme = {
    fonts: {
    regular: {
      fontFamily: 'Lexend_400Regular',
      fontWeight: 'normal',
    },
  },
    colors: {
      primary: 'black',
      underlineColor: 'transparent',
      text: 'red', // Label color is controlled by the 'text' color in React Native Paper theme
    },
  };


  useEffect(() => {
    setErrors((prevErrors: any) => {
      const updatedErrors = { ...prevErrors };
      let changed = false;

      if (orderData.name && orderData.name.length >= 2 && orderData.name.length <= 50 && !/[^a-zA-Z\s]/.test(orderData.name)) {
        if (updatedErrors.name) {
          delete updatedErrors.name;
          changed = true;
        }
      }

      if (orderData.phone && /^\+?[0-9]{7,15}$/.test(orderData.phone)) {
        if (updatedErrors.phone) {
          delete updatedErrors.phone;
          changed = true;
        }
      }

      if (orderData.isDelivery && orderData.address && orderData.address.length >= 5 && orderData.address.length <= 100) {
        if (updatedErrors.address) {
          delete updatedErrors.address;
          changed = true;
        }
      }

      if (orderData.isDelivery && orderData.zone) {
        if (updatedErrors.zone) {
          delete updatedErrors.zone;
          changed = true;
        }
      }

      return changed ? updatedErrors : prevErrors;
    });
  }, [orderData]);


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
        placeholder={isCroatianLang ? 'Ime' : 'Name'}
        mode="outlined" 
        value={orderData.name} 
        onChangeText={(text) => setOrderData({ ...orderData, name: text })} 
        left={<TextInput.Icon icon="account" color="#ffcc00" />}
        style={styles.input}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            outline: errors.name ? 'red' : theme.colors.primary, // 👈 conditional outline color
          },
          fonts: {
            ...theme.fonts,
            regular: {
              fontFamily: 'Lexend_400Regular',
              fontWeight: 'normal',
            },
          },
        }}
      />
      {errors.name && <HelperText style={styles.helperText} type="error" visible={!!errors.name}>{errors.name}</HelperText>}

      <TextInput 
        placeholder={isCroatianLang ? 'Telefon' : 'Phone number'}
        mode="outlined"
        keyboardType="phone-pad"
        value={orderData.phone}
        left={<TextInput.Icon icon="phone" color="#ffcc00" />}
        onChangeText={(text) => setOrderData({ ...orderData, phone: text })} style={styles.input} 
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            outline: errors.phone ? 'red' : theme.colors.primary, // 👈 conditional outline color
          },
          fonts: {
            ...theme.fonts,
            regular: {
              fontFamily: 'Lexend_400Regular',
              fontWeight: 'normal',
            },
          },
        }}
      />
      {errors.phone && <HelperText style={styles.helperText} type="error" visible={!!errors.phone}>{errors.phone}</HelperText>}   
      {orderData.isDelivery && <TextInput 
        placeholder={isCroatianLang ? 'Adresa' : 'Address'}
        mode="outlined"
        value={orderData.address}
        onChangeText={(text) => setOrderData({ ...orderData, address: text })}
        left={<TextInput.Icon icon="map-marker" color="#ffcc00" />}
        right={
          !loading ? (
            <TextInput.Icon 
              icon="crosshairs-gps" 
              style={{ marginRight: scale.isTablet() ? 30 : 4 }}
              size={scale.light(24)}
              color="#ffcc00" 
              onPress={(event) => handleLocationPress(event)} 
              />
          ): (
            <TextInput.Icon
              icon={() => <ActivityIndicator 
              style={{ marginRight: scale.isTablet() ? 30 : 4 }}
              size={scale.light(24)} 
              color="#ffcc00" />}
            />
          )
        }        
        style={styles.input}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            outline: errors.address && orderData.isDelivery ? 'red' : theme.colors.primary, // 👈 conditional outline color
          },
          fonts: {
            ...theme.fonts,
            regular: {
              fontFamily: 'Lexend_400Regular',
              fontWeight: 'normal',
            },
          },
        }}
      />}

      {errors.address && orderData.isDelivery && <HelperText style={styles.helperText} type="error" visible={!!errors.address}>{errors.address}</HelperText>}
      {orderData.isDelivery && (
        <DropdownComponent errors={errors} orderData={orderData} setOrderData={setOrderData} isCroatianLang={isCroatianLang} scale={scale}/>
      )}
      {errors.zone && orderData.isDelivery && <HelperText style={styles.helperText} type="error" visible={!!errors.zone}>{errors.zone}</HelperText>}

      <TextInput
        placeholder={isCroatianLang ? 'Napomena' : 'Note'}
        mode="outlined"
        value={orderData.note}
        onChangeText={(text) => setOrderData({ ...orderData, note: text })}
        left={<TextInput.Icon icon="comment-text-outline" color="#ffcc00" />}
        style={styles.input}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
          },
          fonts: {
            ...theme.fonts,
            regular: {
              fontFamily: 'Lexend_400Regular',
              fontWeight: 'normal',
            },
          },
        }}
      />

    </View>
  );
};

const getStyles = (scale: any) =>
  StyleSheet.create({
  checkboxTextContainer: { 
    flexDirection: 'row', alignItems: 'center' 
  },
  input: {
    fontFamily: 'Lexend_400Regular',
    marginBottom: scale.isTablet() ? 20 : 10,
    height: scale.isTablet() ? 70 : 50,
    fontSize: scale.light(16),
  },
  container: {
    position: "relative",
  },
  helperText: {
    fontSize: scale.light(12),
    marginBottom: scale.isTablet() ? 20 : 10,
  },
});

export default Orderform;
