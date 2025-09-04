import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ModalHeader = () => {
  const theme = useTheme();
  const { t } = useTranslation('invite');
  return (
    <Box>
      <PersonAddIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('headerTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('headerSubtitle')}
        </Typography>
      </Box>
    </Box>
  );
};

export default ModalHeader;
