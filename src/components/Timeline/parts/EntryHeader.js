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
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.25 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: entryColor, lineHeight: 1.15 }}>
          {entryLabel}
        </Typography>
        {computedTime && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500, lineHeight: 1.05 }}
          >
            {computedTime}
          </Typography>
        )}
      </Box>
      {loggedByUser && (
        <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
          by {loggedByUser}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(EntryHeader);
