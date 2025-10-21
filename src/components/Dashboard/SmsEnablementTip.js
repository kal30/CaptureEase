import React from 'react';
import { Alert, Typography, Box } from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';
import { usePhoneStatus } from '../../hooks/usePhoneStatus';

/**
 * Shows a tip about enabling SMS logging per child
 * Only shows if user is phone-verified and no children have SMS enabled
 */
const SmsEnablementTip = ({ children = [] }) => {
  const { verified: phoneVerified, loading } = usePhoneStatus();
  
  // Don't show while loading
  if (loading) {
    return null;
  }
  
  // Don't show if phone is not verified
  if (!phoneVerified) {
    return null;
  }
  
  // Check if any children have SMS enabled
  const hasSmsEnabledChildren = children.some(child => 
    child?.settings?.notifications?.smsEnabled === true
  );
  
  // Don't show if any children already have SMS enabled
  if (hasSmsEnabledChildren) {
    return null;
  }
  
  // Don't show if no children
  if (children.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="info"
        icon={<MessageIcon />}
        sx={{
          borderRadius: 2,
          backgroundColor: 'info.light',
          '& .MuiAlert-icon': {
            color: 'info.main'
          }
        }}
      >
        <Typography variant="body2">
          <strong>Tip:</strong> You can enable SMS logging per child from each card below. 
          Your phone number is verified and ready!
        </Typography>
      </Alert>
    </Box>
  );
};

export default SmsEnablementTip;