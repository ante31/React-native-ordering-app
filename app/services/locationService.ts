import * as Location from 'expo-location';
import { checkPosition } from './checkZone';

export const getLocation = async () => {
  let locationError = "";
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      locationError = "Location permission denied";
      console.error("Location error", locationError);
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log("Location", location)
    return [location.coords.latitude, location.coords.longitude];
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return null;
  }
};


export const geodecode = async (location: number[]) => {
  if (!location || location.length !== 2) return null; // Ensure valid input
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
      // Extract the first and third parts, and concatenate them with a comma
      const result = `${parts[0]},${parts[1]}, ${aboveOrBelow}`;
      console.log("Result:", result);
      return result;
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};
