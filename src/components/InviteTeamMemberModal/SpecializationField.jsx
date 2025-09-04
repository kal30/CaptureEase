import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SpecializationField = ({ specialization, setSpecialization, loading }) => {
  const { t } = useTranslation('invite');
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        🩺 {t('specializationLabel')}
      </Typography>
      <TextField
        fullWidth
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        placeholder={t('specializationPlaceholder')}
        disabled={loading}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    </Box>
  );
};

export default SpecializationField;

