import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import GradientButton from '../UI/GradientButton';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const ModalActions = ({ busy, disabled, onCancel }) => {
  const theme = useTheme();
  const { t } = useTranslation(['invite', 'common']);
  return (
    <>
      <Button
        onClick={onCancel}
        disabled={busy}
        sx={{
          px: 3,
          color: 'text.secondary',
          '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.05) },
        }}
      >
        {t('actions.cancel', { ns: 'common' })}
      </Button>
      <GradientButton
        type="submit"
        variant="gradient"
        disabled={disabled}
        startIcon={busy ? <CircularProgress size={16} /> : <PersonAddIcon />}
        elevated
        size="large"
      >
        {busy ? t('sending') : t('sendInvitation')}
      </GradientButton>
    </>
  );
};

export default ModalActions;
