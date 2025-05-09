// GeneralContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { General } from './models/generalModel';
import { backendUrl } from '@/localhostConf';
import { isClosedMessageDisplayed } from './services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from './services/getLocalTime';

type GeneralContextType = {
  general: General | null;
  showClosedAppModal: boolean;
  setShowClosedAppModal: (value: boolean) => void;
  infoAcknowledged: boolean;
  setInfoAcknowledged: (value: boolean) => void;
};

const GeneralContext = createContext<GeneralContextType | null>(null);

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
  const [general, setGeneral] = useState<General | null>(null);
  const [showClosedAppModal, setShowClosedAppModal] = useState(false);
  const [infoAcknowledged, setInfoAcknowledged] = useState(false);

  // Fetch general data
  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const response = await fetch(`${backendUrl}/general`);
        const data = await response.json();
        setGeneral(data);
      } catch (error) {
        console.error('Error fetching general data:', error);
      }
    };

    fetchGeneral();
  }, []);

  let dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

  if (general)
    console.log("boga", isClosedMessageDisplayed(general.workTime[dayofWeek]))


  // Check app status and show modal if needed
  useEffect(() => {
    const checkAppStatus = () => {
      if (general && isClosedMessageDisplayed(general.workTime[dayofWeek]) && !infoAcknowledged) {
        setShowClosedAppModal(true);
      }
    };

    if (general) {
      checkAppStatus();

      const interval = setInterval(() => {
        checkAppStatus();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [general, infoAcknowledged]);

  return (
    <GeneralContext.Provider
      value={{
        general,
        showClosedAppModal,
        setShowClosedAppModal,
        infoAcknowledged,
        setInfoAcknowledged,
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