import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

// EntryHeader renders the label + time + optional user, with configurable time formatting.
// Preferred order of time rendering:
// 1) timeString (precomputed by caller)
// 2) timeFormatter(time)
// 3) Intl.DateTimeFormat(locale, timeOptions).format(time)
const EntryHeader = ({
  entryLabel,
  entryColor,
  labelBackground,
  labelTextColor,
  loggedByUser,
  // time display (choose one of the below approaches)
  timeString,
  time, // Date instance
  timeFormatter, // (date: Date) => string
  locale, // e.g., 'en-US'
  timeOptions, // Intl.DateTimeFormatOptions
  hideTime = false,
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

  const loggerInitials = React.useMemo(() => {
    if (!loggedByUser) return null;
    return String(loggedByUser)
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  }, [loggedByUser]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: { xs: 0.75, md: 1 }, mb: { xs: 0.75, md: 0.85 }, pr: { xs: 4.5, md: 5 } }}>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, md: 0.75 }, flexWrap: 'wrap' }}>
          <Box
            sx={{
              px: { xs: 0.85, md: 0.95 },
              py: { xs: 0.35, md: 0.38 },
              borderRadius: 0.35,
              bgcolor: labelBackground || entryColor,
              color: labelTextColor || '#FFFFFF',
              fontSize: { xs: '0.78rem', md: '0.8rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {entryLabel}
          </Box>
        </Box>
        {computedTime && !hideTime && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: { xs: '0.66rem', md: '0.7rem' }, fontWeight: 500, lineHeight: 1.05, mt: 0.25 }}
          >
            {computedTime}
          </Typography>
        )}
      </Box>
      {loggedByUser && loggerInitials && (
        <Avatar
          sx={{
            width: { xs: 24, md: 26 },
            height: { xs: 24, md: 26 },
            flexShrink: 0,
            fontSize: { xs: '0.68rem', md: '0.72rem' },
            fontWeight: 800,
            bgcolor: 'rgba(255, 255, 255, 0.82)',
            color: 'text.secondary',
            border: '1px solid rgba(203, 213, 225, 0.8)',
          }}
          title={loggedByUser}
        >
          {loggerInitials}
        </Avatar>
      )}
    </Box>
  );
};

export default React.memo(EntryHeader);
