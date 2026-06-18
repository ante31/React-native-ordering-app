  
  import { backendUrl, backendUrlBackup } from "../../localhostConf";
  
export const safeFetch = async (url: string, options = {}) => {
  try {
    const res = await fetch(url, options);
    return res; // <-- NE THROW based on ok
  } catch (err: any) {
    console.warn("Primary failed, trying backup:", err.message);

    return fetch(
      url.replace(backendUrl, backendUrlBackup),
      options
    );
  }
};