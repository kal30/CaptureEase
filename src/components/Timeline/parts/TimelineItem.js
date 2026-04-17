import React from 'react';
import { Box } from '@mui/material';
import colors from '../../../assets/theme/colors';

const TimelineItem = ({
  entryId,
  color,
  icon,
  children,
  ariaLabel,
  timeLabel,
  reserveTimeSlot = false,
  isFirst = false,
  isLast = false,
  hideAnchor = false,
  neutralRail = false,
  cardBackground = '#ffffff',
  cardBorderColor = 'rgba(148, 163, 184, 0.18)',
}) => (
  <Box
    id={entryId ? `timeline-entry-${entryId}` : undefined}
    data-entry-id={entryId || undefined}
    sx={{
      position: 'relative',
      pb: 0,
      mb: isLast ? 0 : { xs: 1.1, md: 1.5 },
      pl: timeLabel || reserveTimeSlot ? { xs: 7.2, md: 8.5 } : 0,
      isolation: 'isolate',
      backgroundColor: timeLabel || reserveTimeSlot ? '#FFFFFF' : 'transparent',
    }}
    role="listitem"
    aria-label={ariaLabel}
  >
    {timeLabel ? (
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: { xs: 0, md: 2 },
          width: { xs: 56, md: 66 },
          textAlign: 'left',
          color: 'text.secondary',
          fontWeight: 700,
          fontSize: { xs: '0.74rem', md: '0.8rem' },
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {timeLabel}
      </Box>
    ) : null}
    {!isFirst && !hideAnchor && (
      <Box
        sx={{
          position: 'absolute',
          left: timeLabel || reserveTimeSlot ? { xs: 62, md: 74 } : { xs: 18, md: 21 },
          top: 0,
          height: { xs: 8, md: 12 },
          width: '1px',
          backgroundColor: neutralRail ? 'rgba(226, 232, 240, 0.7)' : 'rgba(226, 232, 240, 0.7)',
          zIndex: 0,
        }}
      />
    )}

    {!hideAnchor && (
      <Box
        sx={{
          position: 'absolute',
          left: timeLabel || reserveTimeSlot ? { xs: 55, md: 66 } : { xs: 11, md: 13 },
          top: { xs: 4, md: 6 },
          width: { xs: 16, md: 20 },
          height: { xs: 16, md: 20 },
          borderRadius: '50%',
          bgcolor: '#ffffff',
          border: { xs: '2px solid', md: '3px solid' },
          borderColor: color,
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: '0.58rem', md: '0.7rem' },
          color,
        }}
      >
        {icon || '•'}
      </Box>
    )}

    {!isLast && (
      <Box
        sx={{
          position: 'absolute',
          left: timeLabel || reserveTimeSlot ? { xs: 62, md: 74 } : { xs: 18, md: 21 },
          top: hideAnchor ? 0 : { xs: 20, md: 26 },
          bottom: 0,
          width: '1px',
          backgroundColor: neutralRail ? 'rgba(226, 232, 240, 0.7)' : 'rgba(226, 232, 240, 0.7)',
          zIndex: 0,
        }}
      />
    )}

    <Box
      className="timeline-entry-card"
      sx={{
        ml: timeLabel
          ? { xs: 1.15, md: 1.45 }
          : { xs: 4.7, md: 5.7 },
        mr: { xs: 0.75, md: 1 },
        px: { xs: 1.35, md: 1.65 },
        pr: { xs: 1.75, md: 2.1 },
        py: { xs: 1.15, md: 1.5 },
        bgcolor: cardBackground,
        borderRadius: 0.7,
        border: `1px solid ${cardBorderColor}`,
        boxShadow: `0 1px 2px ${colors.app.cards.paperShadow}`,
        position: 'relative',
        overflow: 'visible',
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  </Box>
);

export default React.memo(TimelineItem);
