import React from 'react';
import {
  Alert,
  Box,
  Button,
  Fade,
  Typography
} from '@mui/material';
import { Message as MessageIcon, Phone as PhoneIcon, NotificationsActive } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePhoneStatus } from '../../hooks/usePhoneStatus';

const MessagingSetupBanner = ({ childDoc = null }) => {
  const navigate = useNavigate();
  const { verified, childSmsEnabled, loading } = usePhoneStatus(null, childDoc);

  const handleSetupClick = () => {
    if (!verified) {
      navigate('/settings/messaging');
    } else {
      // Navigate to child-specific SMS settings
      // For now, navigate to messaging settings
      navigate('/settings/messaging');
    }
  };

  // Don't show banner if loading
  if (loading) {
    return null;
  }

  // Don't show banner if phone is verified and child SMS is enabled
  if (verified && childSmsEnabled) {
    return null;
  }

  // Determine banner content based on status
  const getBannerContent = () => {
    if (!verified) {
      return {
        icon: <PhoneIcon />,
        title: '📱 Verify Phone Number',
        message: 'Verify your phone number to enable SMS & WhatsApp messaging for automatic care logging.',
        buttonText: 'Verify Phone',
        buttonIcon: <PhoneIcon />
      };
    } else if (verified && !childSmsEnabled) {
      return {
        icon: <NotificationsActive />,
        title: '🔔 Enable SMS Notifications',
        message: 'Enable SMS notifications for this child to automatically log messages as care entries.',
        buttonText: 'Enable Notifications',
        buttonIcon: <NotificationsActive />
      };
    }
  };

  const content = getBannerContent();
  if (!content) {
    return null;
  }

  return (
    <Fade in={true}>
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="info"
          icon={content.icon}
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
          action={
            <Button
              color="primary"
              size="small"
              variant="contained"
              startIcon={content.buttonIcon}
              onClick={handleSetupClick}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: 'auto',
              }}
            >
              {content.buttonText}
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {content.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {content.message}
          </Typography>
        </Alert>
      </Box>
    </Fade>
  );
};

export default MessagingSetupBanner;