import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const LogDateField = ({
  value,
  onClick,
  label = 'Date',
  placeholder = 'Select date',
  showLabel = true,
  sx = {},
  ...props
}) => (
  <TextField
    fullWidth
    label={showLabel ? label : undefined}
    value={value || placeholder}
    onClick={onClick}
    variant="outlined"
    InputLabelProps={
      showLabel
        ? {
            shrink: true,
          }
        : undefined
    }
    inputProps={{
      readOnly: true,
      'aria-label': `${label.toLowerCase()} picker`,
    }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <CalendarTodayIcon sx={{ fontSize: 16 }} />
        </InputAdornment>
      ),
    }}
    sx={{
      width: '100%',
      minWidth: 0,
      '& .MuiInputBase-root': {
        minHeight: 66,
        borderRadius: '22px',
        fontWeight: 400,
        fontSize: { xs: '0.95rem', sm: '1rem' },
        color: '#334155',
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      },
      '& .MuiOutlinedInput-input': {
        fontWeight: 400,
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e4dcca',
        borderWidth: '1px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d8d0be',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d0c7b6',
      },
      '& .MuiInputLabel-root': {
        color: '#6b7280',
        fontWeight: 400,
        fontSize: '0.92rem',
      },
      '& .MuiInputLabel-root.MuiFormLabel-root:not(.MuiInputLabel-shrink)': {
        transform: 'translate(14px, 18px) scale(1)',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#6b7280',
      },
      '& .MuiInputAdornment-root': {
        color: '#111827',
      },
      '& input': {
        paddingTop: '1.05rem',
        paddingBottom: '1rem',
      },
      '& input::-webkit-calendar-picker-indicator': {
        opacity: 0,
        display: 'none',
      },
      ...sx,
    }}
    {...props}
  />
);

export default LogDateField;
