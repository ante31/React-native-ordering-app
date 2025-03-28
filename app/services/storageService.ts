import { StorageModel } from '../models/storageModel';
import * as SecureStore from 'expo-secure-store';


const storeData = async (key: string, value: any) => {
  try {
    // Store the value securely
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    console.log("Data saved successfully!");

    // Get the current list of order keys from SecureStore
    const storedKeys = await SecureStore.getItemAsync('order_keys');
    const keys = storedKeys ? JSON.parse(storedKeys) : [];

    // Add the new key to the list
    if (!keys.includes(key)) {
      keys.push(key);
    }

    // Store the updated list of keys back in SecureStore
    await SecureStore.setItemAsync('order_keys', JSON.stringify(keys));

  } catch (error) {
    console.error("Error saving data", error);
  }
};

const getData = async (key: string) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error retrieving data", error);
  }
};
const removeData = async (key: string) => {
  try {
    // First remove the item from SecureStore
    await SecureStore.deleteItemAsync(key);
    console.log(`Data with key "${key}" has been deleted.`);

    // Remove the key from the order_keys array in SecureStore
    const orderKeys = await SecureStore.getItemAsync("order_keys");
    const updatedOrderKeys = orderKeys ? JSON.parse(orderKeys) : [];

    // Filter out the deleted key
    const newOrderKeys = updatedOrderKeys.filter((orderKey: string) => orderKey !== key);

    // Update the order_keys in SecureStore
    await SecureStore.setItemAsync("order_keys", JSON.stringify(newOrderKeys));

    console.log(`Item with ID "${key}" has been removed from order_keys.`);
  } catch (error) {
    console.error("Error deleting data", error);
  }
};


export { storeData, getData, removeData };