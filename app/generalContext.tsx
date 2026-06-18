// GeneralContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { General } from './models/generalModel';
import { backendUrl } from '@/localhostConf';
import { isClosedMessageDisplayed } from './services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from './services/getLocalTime';
import semver from 'semver';
import { Platform } from 'react-native';
import { safeFetch } from './services/safeFetch';
import { io } from 'socket.io-client';
import { checkVersion } from './services/checkVersion';

type GeneralContextType = {
  general: General | null;
  showClosedAppModal: boolean;
  setShowClosedAppModal: (value: boolean) => void;
  forceUpdateAcknowledged: boolean;
  setForceUpdateAcknowledged: (value: boolean) => void;
  customMessageAcknowledged: boolean;
  setCustomMessageAcknowledged: (value: boolean) => void;
  showForceUpdate: boolean;
  setShowForceUpdate: (value: boolean) => void;
  showCustomMessage: boolean;
  setShowCustomMessage: (value: boolean) => void;
};


const socket = io(backendUrl, { transports: ['websocket'] });

const GeneralContext = createContext<GeneralContextType | null>(null);

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
  const [general, setGeneral] = useState<General | null>(null);
  const [showClosedAppModal, setShowClosedAppModal] = useState(false);
  const [forceUpdateAcknowledged, setForceUpdateAcknowledged] = useState(false);
  const [customMessageAcknowledged, setCustomMessageAcknowledged] = useState(false);
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [showCustomMessage, setShowCustomMessage] = useState(false);

  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const response = await safeFetch(`${backendUrl}/general`);
        const data = await response.json();
        console.log(' [Fetch] General data fetched:', data);
        setGeneral(data);
      } catch (error) {
        console.error(' [Fetch] Error fetching general data:', error);
      }
    };

    // Prvo fetchaj
    fetchGeneral();

    socket.on('connect', () => {
      console.log(' [Socket] Spojeno s backendom:', socket.id);
    });

    const handleGeneralUpdate = (newGeneralData: any) => {
      console.log(' [Socket] Primljeni general podaci:', newGeneralData);
      setGeneral(newGeneralData);
    };

    socket.on('general-update', handleGeneralUpdate);

    socket.on('connect_error', (err) => {
      console.log(' [Socket] connect error:', err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('general-update', handleGeneralUpdate);
      socket.off('connect_error');
    };
  }, []);


  let dayofWeek: string | null = null;

  if (general?.holidays) {
    dayofWeek = getDayOfTheWeek(getLocalTime(), general.holidays);
  }



  useEffect(() => {
    if (!general || !dayofWeek) return;

    const checkAppStatus = () => {
      console.log("Checking app status:", general.appStatus, general.workTime[dayofWeek]);
      if (isClosedMessageDisplayed(general.appStatus, general.workTime[dayofWeek], general.holidays) && !forceUpdateAcknowledged) {
        setShowClosedAppModal(true);
      }
      if (general.message.active) {
        setShowCustomMessage(true);
      }
    };

    checkAppStatus();
    const interval = setInterval(checkAppStatus, 60000);

    return () => clearInterval(interval);
  }, [general, dayofWeek, forceUpdateAcknowledged]);


  // Check app version
  useEffect(() => {
    checkVersion(general as General, setShowForceUpdate);
  }, [general]);


  return (
    <GeneralContext.Provider
      value={{
        general,
        showClosedAppModal,
        setShowClosedAppModal,
        forceUpdateAcknowledged,
        setForceUpdateAcknowledged,
        customMessageAcknowledged,
        setCustomMessageAcknowledged,
        showForceUpdate,
        setShowForceUpdate,
        showCustomMessage,
        setShowCustomMessage
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