import React from 'react';
import { Paper, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import colors from '../../../../assets/theme/colors';

const DateTimeSection = ({ value, onChange }) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px',
        border: `1px solid ${colors.app.cards.border}`,
        backgroundColor: colors.app.cards.background
      }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: colors.app.text.strong
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
