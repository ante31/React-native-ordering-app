import Constants from 'expo-constants';


const extra = Constants.expoConfig?.extra || {}; 

export const productionUrl = extra.productionUrl;
export const mode = extra.mode || 'development';

export const backendUrl = productionUrl;
// export const backendUrl = "http://192.168.1.85:3000"; // Za lokalni razvoj

export const backendUrlBackup = productionUrl;