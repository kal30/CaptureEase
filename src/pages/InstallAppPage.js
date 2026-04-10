import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import IosShareIcon from '@mui/icons-material/IosShare';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import usePWAInstallPrompt from '../hooks/usePWAInstallPrompt';
import { useDeviceType } from '../utils/deviceDetection';
import { PRODUCT_NAME_TITLE } from '../constants/config';

const iosInstallSteps = [
  {
    title: 'Tap Share',
    description: 'Open the Share menu in Safari.',
    icon: <IosShareIcon color="primary" />,
  },
  {
    title: 'Add to Home Screen',
    description: 'Scroll down and choose Add to Home Screen.',
    icon: <AddToHomeScreenIcon color="primary" />,
  },
  {
    title: 'Open from Home Screen',
    description: 'Tap Add, then launch Lifelog from the new home screen icon.',
    icon: <HomeRoundedIcon color="primary" />,
  },
];

const androidInstallSteps = [
  {
    title: 'Tap Install',
    description: 'Use the install prompt or the browser menu when Android offers it.',
    icon: <AddToHomeScreenIcon color="primary" />,
  },
  {
    title: 'Confirm the install',
    description: 'Let the browser finish adding Lifelog to your device.',
    icon: <CheckCircleOutlineIcon color="primary" />,
  },
  {
    title: 'Open from Home Screen',
    description: 'Use the new icon on your home screen to launch the installed app.',
    icon: <HomeRoundedIcon color="primary" />,
  },
];

const InstallAppPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pwaInstallPrompt = usePWAInstallPrompt();
  const { isTabletDevice } = useDeviceType();
  const auth = getAuth();
  const [installComplete, setInstallComplete] = useState(false);
  const isAppleInstallFlow = pwaInstallPrompt.isIOS || isTabletDevice;

  const nextPath = useMemo(() => {
    const defaultNext = auth.currentUser ? '/dashboard' : '/login';
    const next = searchParams.get('next') || location.state?.next || defaultNext;
    return next.startsWith('/') ? next : '/dashboard';
  }, [auth.currentUser, location.state?.next, searchParams]);

  useEffect(() => {
    if (pwaInstallPrompt.isInstalled && !installComplete) {
      navigate(nextPath, { replace: true });
    }
  }, [installComplete, navigate, nextPath, pwaInstallPrompt.isInstalled]);

  const handleInstall = async () => {
    if (pwaInstallPrompt.canInstall) {
      const result = await pwaInstallPrompt.promptInstall();
      if (result?.outcome === 'accepted') {
        setInstallComplete(true);
      }
      return;
    }

    if (pwaInstallPrompt.isIOS) {
      window.alert('On iPhone or iPad, tap Share, then choose Add to Home Screen.');
      return;
    }

    window.alert('Use your browser menu and choose Install app or Add to Home screen.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Card
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 1.6, color: 'text.secondary' }}>
                Welcome to {PRODUCT_NAME_TITLE}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Install the app first
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                For the best mobile experience, install {PRODUCT_NAME_TITLE} on your home screen before you continue.
              </Typography>
            </Box>

            {installComplete ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleOutlineIcon color="success" />
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {PRODUCT_NAME_TITLE} is installed.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open it from your home screen icon now. That is the real app.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : isAppleInstallFlow ? (
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneIphoneIcon color="primary" />
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        iPhone / iPad install steps
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use Safari, then follow these steps to add Lifelog to your home screen.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1.25}>
                    {iosInstallSteps.map((step, index) => (
                      <Box
                        key={step.title}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid',
                          borderColor: 'primary.100',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.50',
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                            {index + 1}. {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                  </Stack>
                </Box>
            ) : (
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AddToHomeScreenIcon color="primary" />
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        Android install steps
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Follow these steps on Android to add Lifelog to your home screen.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1.25}>
                    {androidInstallSteps.map((step, index) => (
                      <Box
                        key={step.title}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid',
                          borderColor: 'primary.100',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.50',
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                            {index + 1}. {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            )}

            <Stack spacing={1.5}>
              {installComplete ? (
                <Button
                  variant="contained"
                  size="large"
                  disabled
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
                >
                  Open from your home screen
                </Button>
              ) : isAppleInstallFlow ? (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  After you add it, open Lifelog from the home screen icon.
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleInstall}
                  startIcon={<AddToHomeScreenIcon />}
                  sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
                >
                  Install app
                </Button>
              )}
              {!installComplete && !isAppleInstallFlow ? (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  When the install finishes, open Lifelog from the home screen icon.
                </Typography>
              ) : null}
              {installComplete ? (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Close this tab and open the app from your home screen icon. That is the installed app.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstallAppPage;
