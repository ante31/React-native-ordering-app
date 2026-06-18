import { General } from "../models/generalModel";
import * as Application from 'expo-application';
import semver from 'semver';
import { Platform } from 'react-native';

export const getVersion = () => {
  return Application.nativeApplicationVersion || '1.0.0';
};

export async function checkVersion(general: General, setShowForceUpdate: any) {
  const currentVersion = getVersion();
  const minVersionIOS = general?.minVersionIOS || '1.0.0';
  const minVersionAndroid = general?.minVersionAndroid || '1.0.0';

  const isIOS = Platform.OS === 'ios';
  const minVersion = isIOS ? minVersionIOS : minVersionAndroid;

  console.log("Verzija", currentVersion);
  console.log("Minimalna verzija", minVersion);

  if (semver.lt(currentVersion, minVersion.toString())) {
    console.log("Verzija je stara");
    setShowForceUpdate(true);
  }
  else {
    console.log("Verzija je dovoljno nova");
  }
}