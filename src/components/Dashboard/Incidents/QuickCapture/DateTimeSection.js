import React, { useMemo, useState } from 'react';
import { Box, Popover, Stack } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import colors from '../../../../assets/theme/colors';
import LogDateField from '../../../UI/LogDateField';
import LogTimeField from '../../../UI/LogTimeField';

const formatDisplayDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatTimeValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '00:00';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const DateTimeSection = ({ value, onChange }) => {
  const currentValue = useMemo(
    () => (value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date()),
    [value]
  );
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleDateChange = (nextDate) => {
    if (!nextDate || Number.isNaN(nextDate.getTime())) {
      return;
    }

    const nextValue = new Date(currentValue);
    nextValue.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    onChange(nextValue);
    setDatePickerAnchor(null);
  };

  const handleTimeChange = (event) => {
    const [hours, minutes] = String(event.target.value || '00:00')
      .split(':')
      .map((part) => Number(part));

    const nextValue = new Date(currentValue);
    nextValue.setHours(
      Number.isFinite(hours) ? hours : 0,
      Number.isFinite(minutes) ? minutes : 0,
      0,
      0
    );
    onChange(nextValue);
  };

  return (
    <Box
      sx={{
        p: { xs: 1.1, sm: 1.25 },
        borderRadius: '24px',
        bgcolor: colors.brand.ice,
        border: `1px solid ${colors.brand.tint}`,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
        <Box sx={{ flex: 1.05, minWidth: 0 }}>
          <LogDateField
            label="Date"
            value={formatDisplayDate(currentValue)}
            onClick={handleDatePickerOpen}
          />
        </Box>

        <Box sx={{ flex: 0.95, minWidth: 0 }}>
          <LogTimeField
            label="Time"
            value={formatTimeValue(currentValue)}
            onChange={handleTimeChange}
          />
        </Box>
      </Stack>

      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '16px',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
            overflow: 'hidden',
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={currentValue}
            onChange={handleDateChange}
          />
        </LocalizationProvider>
      </Popover>
    </Box>
  );
};

export default DateTimeSection;
