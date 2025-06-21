// GeneralContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { General } from './models/generalModel';
import { backendUrl } from '@/localhostConf';
import { isClosedMessageDisplayed } from './services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from './services/getLocalTime';
import * as Application from 'expo-application'; 
import semver from 'semver';
import { Platform } from 'react-native';
import { safeFetch } from './services/safeFetch';

type GeneralContextType = {
  general: General | null;
  showClosedAppModal: boolean;
  setShowClosedAppModal: (value: boolean) => void;
  infoAcknowledged: boolean;
  setInfoAcknowledged: (value: boolean) => void;
  showForceUpdate: boolean;
  setShowForceUpdate: (value: boolean) => void;
};



const GeneralContext = createContext<GeneralContextType | null>(null);

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
  const [general, setGeneral] = useState<General | null>(null);
  const [showClosedAppModal, setShowClosedAppModal] = useState(false);
  const [infoAcknowledged, setInfoAcknowledged] = useState(false);
  const [showForceUpdate, setShowForceUpdate] = useState(false);

  // Fetch general data
  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const response = await safeFetch(`${backendUrl}/general`);
        const data = await response.json();
        setGeneral(data);
      } catch (error) {
        console.error('Error fetching general data:', error);
      }
    };

    fetchGeneral();
  }, []);

  let dayofWeek: string | null = null;

  if (general?.holidays) {
    dayofWeek = getDayOfTheWeek(getLocalTime(), general.holidays);
  }

  // if (general)
  //   console.log("owfefd", isClosedMessageDisplayed(general.workTime[dayofWeek]))


  // Check app status and show modal if needed
  useEffect(() => {
    if (!general || !dayofWeek) return;

    const checkAppStatus = () => {
      if (isClosedMessageDisplayed(general.workTime[dayofWeek]) && !infoAcknowledged) {
        setShowClosedAppModal(true);
      }
    };

    checkAppStatus();
    const interval = setInterval(checkAppStatus, 60000);

    return () => clearInterval(interval);
  }, [general, dayofWeek, infoAcknowledged]);


// Check app version
  useEffect(() => {
  async function checkVersion() {
      // Verzija aplikacije - ako ne koristiš Expo, možeš dohvatiti iz native koda ili package.json
      const currentVersion = Application.nativeApplicationVersion || '1.0.0';
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

  checkVersion();
}, [general]);


  return (
    <GeneralContext.Provider
      value={{
        general,
        showClosedAppModal,
        setShowClosedAppModal,
        infoAcknowledged,
        setInfoAcknowledged,
        showForceUpdate,
        setShowForceUpdate,
      }}
    >
      {children}
    </GeneralContext.Provider>

  );
};

export const useGeneral = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error('useGeneral must be used within a GeneralProvider');
  }
  return context;
};