import React from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AddToHomeScreen as AddToHomeScreenIcon,
  Close as CloseIcon,
  PhoneIphone as PhoneIphoneIcon,
} from '@mui/icons-material';

const InstallPromptBanner = ({ canInstall, isIOS, onInstall, onDismiss }) => {
  const title = isIOS
    ? 'Add CaptureEz to your iPhone Home Screen'
    : 'Install CaptureEz on Android';

  const subtitle = isIOS
    ? 'Quick access like an app.'
    : 'Quick access like an app on Android.';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 1.25,
        border: '1px solid rgba(99, 102, 241, 0.18)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,255,0.98) 100%)',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(99, 102, 241, 0.10)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            {isIOS ? <PhoneIphoneIcon /> : <AddToHomeScreenIcon />}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
              {subtitle}
            </Typography>

            {isIOS ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ mt: 1.25, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.7)' }}
              >
                On iPhone or iPad, tap Share, then choose Add to Home Screen.
              </Alert>
            ) : null}

            {canInstall && !isIOS ? (
              <Button
                variant="contained"
                startIcon={<AddToHomeScreenIcon />}
                onClick={onInstall}
                sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800 }}
              >
                Install on Android
              </Button>
            ) : null}
          </Box>

          <IconButton
            aria-label="Dismiss install prompt"
            onClick={onDismiss}
            size="small"
            sx={{ mt: -0.25, color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default InstallPromptBanner;
