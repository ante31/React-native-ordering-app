import Constants from 'expo-constants';


const extra = Constants.expoConfig?.extra || {}; 

export const productionUrl = extra.productionUrl;
export const mode = extra.mode || 'development';

//export const backendUrl = productionUrl;
export const backendUrl = "http://192.168.1.65:3000";

export const backendUrlBackup = "http://10.143.213.14:3000";