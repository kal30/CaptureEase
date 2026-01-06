import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Close, IosShare, AddToHomeScreen } from '@mui/icons-material';
import useIsMobile from '../../hooks/useIsMobile';

const STORAGE_KEY = 'captureease_a2hs_dismissed';

const isIosDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const safeGetDismissed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch (error) {
    return false;
  }
};

const safeSetDismissed = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch (error) {
    // Ignore storage errors (private mode, etc.)
  }
};

const AddToHomeScreenPrompt = () => {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const isIos = useMemo(isIosDevice, []);

  useEffect(() => {
    setDismissed(safeGetDismissed());
  }, []);

  useEffect(() => {
    if (!isMobile || isStandalone()) return undefined;
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isMobile]);

  if (!isMobile || dismissed || isStandalone()) return null;

  const showIos = isIos;
  const showPrompt = showIos || deferredPrompt;

  if (!showPrompt) return null;

  const handleDismiss = () => {
    safeSetDismissed();
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.18)',
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.5,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center'
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Add CaptureEase to your home screen
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {showIos
            ? 'Tap share, then “Add to Home Screen” for quick access.'
            : 'Launch faster and keep logging with one tap.'}
        </Typography>
      </Box>
      {showIos ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IosShare fontSize="small" />
        </Box>
      ) : (
        <Button
          size="small"
          variant="contained"
          onClick={handleInstall}
          startIcon={<AddToHomeScreen fontSize="small" />}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      )}
      <IconButton size="small" onClick={handleDismiss} sx={{ ml: -0.5 }}>
        <Close fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default AddToHomeScreenPrompt;
