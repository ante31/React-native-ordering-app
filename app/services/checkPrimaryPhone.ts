import { getData } from '../services/storageService';
import * as SecureStore from 'expo-secure-store';

const checkPrimaryPhone = async (phone: string) => {
    try {
      // Provjeri imamo li već spremljen primarni broj
      const primaryPhone = await getData('primary_phone');

      if (!primaryPhone && phone) {
        // Ako ne postoji, postavi trenutni broj iz forme kao primarni
        await SecureStore.setItemAsync('primary_phone', phone);
        console.log("Primary phone set silently:", phone);
      }
    } catch (error) {
      console.error("Error checking primary phone", error);
    }
  };

export { checkPrimaryPhone };