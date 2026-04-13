import React from 'react';
import { Paper, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import { incidentSectionSx } from '../incidentTheme';

const DateTimeSection = ({ value, onChange }) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={0}
      sx={{ p: 3, mb: 3, ...incidentSectionSx('#FFFFFF') }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary
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
