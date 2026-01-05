import React from 'react';
import { Box, Typography } from '@mui/material';

// EntryHeader renders the label + time + optional user, with configurable time formatting.
// Preferred order of time rendering:
// 1) timeString (precomputed by caller)
// 2) timeFormatter(time)
// 3) Intl.DateTimeFormat(locale, timeOptions).format(time)
const EntryHeader = ({
  entryLabel,
  entryColor,
  loggedByUser,
  // time display (choose one of the below approaches)
  timeString,
  time, // Date instance
  timeFormatter, // (date: Date) => string
  locale, // e.g., 'en-US'
  timeOptions, // Intl.DateTimeFormatOptions
  actions,
  badgeLabel,
}) => {
  const safeLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

  const formatWithIntl = (d) => new Intl.DateTimeFormat(safeLocale, timeOptions || { hour: '2-digit', minute: '2-digit' }).format(d);

  const computedTime = React.useMemo(() => {
    if (timeString) return timeString;
    if (time instanceof Date && !isNaN(time)) {
      if (typeof timeFormatter === 'function') return timeFormatter(time);
      return formatWithIntl(time);
    }
    return null;
  }, [timeString, time, timeFormatter, safeLocale, timeOptions]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 0.5 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: entryColor, lineHeight: 1.2 }}
      >
        {entryLabel}
        {computedTime ? ` @ ${computedTime}` : ''}
      </Typography>
      {(loggedByUser || actions || badgeLabel) && (
        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mt: -0.25
          }}
        >
          {badgeLabel && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 999,
                bgcolor: 'grey.100',
                color: 'text.secondary',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {badgeLabel}
            </Box>
          )}
          {loggedByUser && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              by {loggedByUser}
            </Typography>
          )}
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(EntryHeader);
