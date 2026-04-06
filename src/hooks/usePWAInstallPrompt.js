import { useCallback, useEffect, useMemo, useState } from 'react';

const DISMISS_UNTIL_KEY = 'captureez:pwa-install-dismissed-until';
const INSTALLED_KEY = 'captureez:pwa-install-installed';
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

const isBrowser = typeof window !== 'undefined';

const isStandaloneMode = () => {
  if (!isBrowser) return false;
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
  );
};

const isIOSPlatform = () => {
  if (!isBrowser) return false;
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
};

const readDismissUntil = () => {
  if (!isBrowser) return 0;
  const raw = window.localStorage.getItem(DISMISS_UNTIL_KEY);
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

const usePWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (!isBrowser) return false;
    return isStandaloneMode() || window.localStorage.getItem(INSTALLED_KEY) === 'true';
  });
  const [dismissUntil, setDismissUntil] = useState(() => readDismissUntil());
  const [isIOS, setIsIOS] = useState(() => isIOSPlatform());

  useEffect(() => {
    if (!isBrowser) return undefined;

    setIsIOS(isIOSPlatform());
    setIsInstalled((current) => current || isStandaloneMode() || window.localStorage.getItem(INSTALLED_KEY) === 'true');
    setDismissUntil(readDismissUntil());

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, 'true');
      window.localStorage.removeItem(DISMISS_UNTIL_KEY);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    if (!isBrowser) return;
    const until = Date.now() + DISMISS_DURATION_MS;
    window.localStorage.setItem(DISMISS_UNTIL_KEY, String(until));
    setDismissUntil(until);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choiceResult?.outcome === 'accepted') {
      window.localStorage.setItem(INSTALLED_KEY, 'true');
      window.localStorage.removeItem(DISMISS_UNTIL_KEY);
      setIsInstalled(true);
    }

    return choiceResult;
  }, [deferredPrompt]);

  const shouldShowPrompt = useMemo(() => {
    if (isInstalled) return false;
    if (dismissUntil && Date.now() < dismissUntil) return false;
    return Boolean(deferredPrompt) || isIOS;
  }, [deferredPrompt, dismissUntil, isIOS, isInstalled]);

  return {
    canInstall: Boolean(deferredPrompt),
    dismissPrompt,
    isIOS,
    isInstalled,
    promptInstall,
    shouldShowPrompt,
  };
};

export default usePWAInstallPrompt;
