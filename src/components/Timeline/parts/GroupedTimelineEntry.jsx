import React from 'react';
import {
  Box,
  ButtonBase,
  Collapse,
  Stack,
  Typography,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineEntryRow from './TimelineEntryRow.jsx';
import { alpha } from '@mui/material/styles';

const formatTimeRange = (startTime, endTime) => {
  if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
    return '';
  }

  const start = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const suffixMatch = end.match(/\s?(AM|PM)$/i);
  const endSuffix = suffixMatch?.[1] || '';
  const startTrimmed = start.replace(/\s?(AM|PM)$/i, '');
  const endTrimmed = end.replace(/\s?(AM|PM)$/i, '');

  if (start.toLowerCase().includes('am') && end.toLowerCase().includes('am')) {
    return `${startTrimmed}–${endTrimmed} AM`;
  }

  if (start.toLowerCase().includes('pm') && end.toLowerCase().includes('pm')) {
    return `${startTrimmed}–${endTrimmed} PM`;
  }

  if (endSuffix) {
    return `${startTrimmed}–${endTrimmed} ${endSuffix}`;
  }

  return `${start}–${end}`;
};

const GroupedTimelineEntry = ({
  group,
  showActions = false,
  onEditEntry = null,
  onDeleteEntry = null,
  actionMenuDisabled = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setExpanded((current) => !current);
  };

  const summaryCount = group?.entries?.length || 0;
  const summaryLabel = summaryCount === 1 ? 'Medication' : 'Medications';
  const timeRange = formatTimeRange(group.startTime, group.endTime);
  const firstEntry = group.entries?.[0];
  const accentColor = firstEntry?.presentation?.accentColor || '#64748B';
  const icon = firstEntry?.presentation?.icon || '💊';

  return (
    <Box
      role="listitem"
      aria-label={`${summaryLabel} group${timeRange ? ` from ${timeRange}` : ''}`}
      sx={{
        width: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(accentColor, 0.14)}`,
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
      }}
    >
      <ButtonBase
        onClick={toggleExpanded}
        aria-expanded={expanded}
        sx={{
          width: '100%',
          display: 'block',
          textAlign: 'left',
          px: { xs: 1.25, sm: 1.5 },
          py: 1,
          color: 'inherit',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
            {timeRange ? (
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  lineHeight: 1.15,
                  mb: 0.45,
                }}
              >
                {timeRange}
              </Typography>
            ) : null}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(accentColor, 0.1),
                  border: `1px solid ${alpha(accentColor, 0.18)}`,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: '0.86rem', lineHeight: 1 }}>
                  {icon}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  lineHeight: 1.2,
                  minWidth: 0,
                }}
              >
                {summaryLabel} ({summaryCount})
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {expanded ? <ExpandLessIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
          </Box>
        </Box>
      </ButtonBase>

      <Collapse in={expanded} timeout={180} unmountOnExit>
        <Box sx={{ px: 0.5, pb: 0.5 }}>
          <Stack spacing={0.35}>
            {group.entries.map(({ entry, presentation }, index) => (
              <TimelineEntryRow
                key={`${group.key || 'med-group'}-${entry.id}-${index}`}
                entryId={entry.id}
                entryConfig={presentation}
                isLast={index === group.entries.length - 1}
                showActions={showActions}
                onEditEntry={onEditEntry ? () => onEditEntry(entry) : null}
                onDeleteEntry={onDeleteEntry ? () => onDeleteEntry(entry) : null}
                actionMenuDisabled={actionMenuDisabled}
                nested
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(GroupedTimelineEntry);
