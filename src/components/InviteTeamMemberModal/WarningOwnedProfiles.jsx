import React from 'react';
import { Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const WarningOwnedProfiles = () => {
  const { t } = useTranslation('invite');
  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
        {t('warningOwnedProfilesTitle')}
      </Typography>
      <Typography variant="body2">{t('warningOwnedProfilesBody')}</Typography>
    </Alert>
  );
};

export default WarningOwnedProfiles;

