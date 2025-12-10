import * as Location from 'expo-location';
import { checkPosition } from './checkZone';

export const getLocation = async () => {
  let locationError = "";
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      locationError = "Location permission denied";
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log("Location", location)
    return [location.coords.latitude, location.coords.longitude];
  } catch (error) {
    return null;
  }
};


export const geodecode = async (location: number[]) => {
  if (!location || location.length !== 2) return null;
  const [latitude, longitude] = location;
  
  try {
    const address = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address && address.length > 0) {
      console.log("Address:", address);
      const aboveOrBelow = checkPosition(latitude, longitude);
      const addressObject = address[0];
      const formattedAddress = `${addressObject.street} ${addressObject.streetNumber}, ${addressObject.city}`;
      const parts = formattedAddress.split(',');      
      console.log("Parts:", parts, "Formatted address:", formattedAddress);
      const result = `${parts[0]},${parts[1]}, ${aboveOrBelow}`;
      console.log("Result:", result);
      return result;
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};
