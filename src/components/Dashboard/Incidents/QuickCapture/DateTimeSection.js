import React from 'react';
import { Paper, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DateTimeSection = ({ value, onChange }) => {
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
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: '#1f2937'
        }}
      >
        ⏰ When did this incident occur?
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label="Incident Date & Time"
          value={value}
          onChange={(newValue) => onChange(newValue || new Date())}
          slotProps={{
            textField: {
              fullWidth: true
            }
          }}
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default DateTimeSection;