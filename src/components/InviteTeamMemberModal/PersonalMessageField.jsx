import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PersonalMessageField = ({ personalMessage, setPersonalMessage, loading, placeholder }) => {
  const { t } = useTranslation('invite');
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        💬 {t('personalMessageLabel')}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={personalMessage}
        onChange={(e) => setPersonalMessage(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        helperText={t('personalMessageHelper')}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    </Box>
  );
};

export default PersonalMessageField;

