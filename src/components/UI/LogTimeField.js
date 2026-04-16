import React, { useId, useRef } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const LogTimeField = ({
  value,
  onChange,
  label = 'Time',
  showLabel = true,
  sx = {},
}) => {
  const inputId = useId();
  const inputRef = useRef(null);

  const handleOpenPicker = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    if (typeof inputEl.showPicker === 'function') {
      inputEl.showPicker();
      return;
    }

    inputEl.focus();
    inputEl.click();
  };

  return (
    <TextField
      id={inputId}
      inputRef={inputRef}
      fullWidth
      label={showLabel ? label : undefined}
      type="time"
      value={value}
      onChange={onChange}
      variant="outlined"
      InputLabelProps={{
        shrink: showLabel,
      }}
      inputProps={{
        'aria-label': `${label.toLowerCase()} picker`,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              size="small"
              onClick={handleOpenPicker}
              sx={{
                p: 0.35,
                color: '#111827',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 16 }} />
            </IconButton>
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
    />
  );
};

export default LogTimeField;
