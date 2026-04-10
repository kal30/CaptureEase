import React from 'react';
import { Alert, Button, Collapse, Stack } from '@mui/material';
import useServiceWorkerUpdate from '../../hooks/useServiceWorkerUpdate';
import useStandaloneMode from '../../hooks/useStandaloneMode';

const PWAUpdateBanner = () => {
  const { applyUpdate, dismissUpdate, updateAvailable } = useServiceWorkerUpdate();
  const isStandalone = useStandaloneMode();

  if (!isStandalone || !updateAvailable) {
    return null;
  }

  return (
    <Collapse in={updateAvailable} appear>
      <Alert
        severity="info"
        sx={{
          borderRadius: 0,
          alignItems: 'center',
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={0.25}>
            <strong>New version available</strong>
            <span>Tap reload to get the latest Lifelog changes.</span>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={dismissUpdate}>
              Later
            </Button>
            <Button size="small" variant="contained" onClick={applyUpdate}>
              Reload
            </Button>
          </Stack>
        </Stack>
      </Alert>
    </Collapse>
  );
};

export default PWAUpdateBanner;
