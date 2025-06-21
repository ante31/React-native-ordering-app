  
  import { backendUrl, backendUrlBackup } from "../../localhostConf";
  
  export const safeFetch = async (url: string, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Primary fetch failed');
      return res;
    } catch (err: any) {
      console.warn(`Primary fetch failed, trying backup: ${err.message}`);
      const resBackup = await fetch(url.replace(backendUrl, backendUrlBackup), options);
      return resBackup;
    }
  };