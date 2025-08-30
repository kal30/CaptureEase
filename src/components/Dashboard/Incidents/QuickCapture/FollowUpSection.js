import React from 'react';
import { 
  Paper, 
  Typography, 
  FormControlLabel, 
  Switch, 
  Box 
} from '@mui/material';

const FollowUpSection = ({ 
  scheduleFollowUp,
  onChange,
  followUpScheduleText 
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={scheduleFollowUp}
            onChange={onChange}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              🔔 Smart Follow-up
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scheduleFollowUp 
                ? `Check-ins scheduled: ${followUpScheduleText}`
                : "Get smart reminders timed for this incident type"
              }
            </Typography>
          </Box>
        }
      />
    </Paper>
  );
};

export default FollowUpSection;