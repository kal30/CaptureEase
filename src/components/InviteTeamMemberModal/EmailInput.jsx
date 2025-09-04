import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const EmailInput = ({ email, setEmail, loading }) => {
  const { t } = useTranslation('invite');
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        📧 {t('emailLabel')}
      </Typography>
      <TextField
        fullWidth
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
        required
        disabled={loading}
        InputProps={{
          startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />,
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    </Box>
  );
};

export default EmailInput;

