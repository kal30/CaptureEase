import { useEffect, useState } from 'react';

const UPDATE_EVENT = 'lifelog:sw-update-available';
const CLEAR_EVENT = 'lifelog:sw-update-cleared';

const useServiceWorkerUpdate = () => {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleUpdateAvailable = (event) => {
      setRegistration(event.detail?.registration || null);
      setUpdateAvailable(true);
    };

    const handleUpdateCleared = () => {
      setRegistration(null);
      setUpdateAvailable(false);
    };

    window.addEventListener(UPDATE_EVENT, handleUpdateAvailable);
    window.addEventListener(CLEAR_EVENT, handleUpdateCleared);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdateAvailable);
      window.removeEventListener(CLEAR_EVENT, handleUpdateCleared);
    };
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const dismissUpdate = () => {
    setRegistration(null);
    setUpdateAvailable(false);
  };

  return {
    applyUpdate,
    dismissUpdate,
    updateAvailable,
  };
};

export default useServiceWorkerUpdate;
