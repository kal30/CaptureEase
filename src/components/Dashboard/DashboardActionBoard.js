import React from 'react';
import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LOG_TYPES } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

const actionCards = [
  {
    key: 'meds',
    title: LOG_TYPES.medication?.displayLabel || 'Meds',
    emoji: LOG_TYPES.medication?.icon || '💊',
    bg: '#DBEEED',
    border: '#D7E2D6',
    text: '#355534',
  },
  {
    key: 'sleep',
    title: LOG_TYPES.sleep?.displayLabel || 'Sleep',
    emoji: LOG_TYPES.sleep?.icon || '😴',
    bg: '#CCDBE9',
    border: '#D7DAEE',
    text: '#3949AB',
  },
  {
    key: 'food',
    title: LOG_TYPES.food?.displayLabel || 'Food',
    emoji: LOG_TYPES.food?.icon || '🍽️',
    bg: '#faf1e8',
    border: '#E5DFD8',
    text: '#7C5A3A',
  },
  {
    key: 'activity',
    title: LOG_TYPES.activity?.displayLabel || 'Activity',
    emoji: LOG_TYPES.activity?.icon || '🕐',
    bg: '#F8E7F8',
    border: '#FAE5FA',
    text: LOG_TYPES.activity?.palette?.text || '#345B6C',
  },
  {
    key: 'behavior',
    title: LOG_TYPES.behavior?.displayLabel || 'Behavior',
    emoji: LOG_TYPES.behavior?.icon || '🌪️',
    bg: '#F0D2DA',
    border: '#E4DEE0',
    text: LOG_TYPES.behavior?.palette?.text || '#4C3D78',
  },
  {
    key: 'quick_note',
    title: 'Quick Note',
    emoji: '🤖',
    bg: '#F7FFDD',
    border: '#F0F1EB',
    text: '#6B5B95',
  },
];

const ActionCard = ({ card, onClick, colSpan = 1 }) => {
  return (
    <Box
      sx={{
        gridColumn: typeof colSpan === 'number'
          ? `span ${colSpan}`
          : {
              xs: `span ${colSpan.xs || 1}`,
              md: `span ${colSpan.md || colSpan.xs || 1}`,
            },
        minWidth: 0,
      }}
    >
      <ButtonBase
        onClick={onClick}
        data-cy={`dashboard-action-${card.key}`}
        sx={{
          width: '100%',
          minWidth: 0,
          height: 'auto',
          borderRadius: { xs: '0.9rem', md: '1.15rem' },
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 140ms ease',
          display: 'flex',
          '&:active': {
            transform: 'scale(0.97)',
            transition: 'transform 80ms ease',
          },
          '&:focus-visible': {
            outline: `2px solid ${colors.brand.ink}`,
            outlineOffset: 2,
          },
        }}
      >
        <Paper
          className="action-paper"
          elevation={0}
          sx={{
            width: '100%',
            minHeight: { xs: 52, md: 74 },
            border: `1px solid ${alpha(card.border, 0.64)}`,
            borderRadius: 'inherit',
            bgcolor: alpha(card.bg || '#FFFFFF', 0.78),
            boxShadow: 'none',
            px: { xs: 0.95, md: 1.15 },
            py: { xs: 0.55, md: 0.85 },
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: { xs: 0.65, md: 0.85 },
            textTransform: 'none',
            transition: 'inherit',
            overflow: 'hidden',
          }}
        >
          <Box
            component="span"
            sx={{
              color: card.text || '#1F2937',
              fontSize: { xs: '1.05rem', md: '1.1rem' },
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {card.emoji}
          </Box>
          <Typography
            component="span"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: { xs: '0.76rem', md: '0.9rem' },
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: '#1F2937',
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.title}
          </Typography>
        </Paper>
      </ButtonBase>
    </Box>
  );
};

const DashboardActionBoard = ({
  child,
  onTrack,
  onOpenMedicalLog,
  onOpenSleepLog,
  onOpenFoodLog,
  onQuickEntry,
  sx = {},
}) => {
  if (!child) {
    return null;
  }

  const handleCardClick = (key) => {
    switch (key) {
      case 'meds':
        if (typeof onOpenMedicalLog === 'function') {
          onOpenMedicalLog(child);
        } else if (typeof onTrack === 'function') {
          onTrack(child, 'medication');
        } else {
          onQuickEntry?.(child, 'medication');
        }
        break;
      case 'sleep':
        onOpenSleepLog?.(child);
        break;
      case 'food':
        onOpenFoodLog?.(child);
        break;
      case 'activity':
        onQuickEntry?.(child, 'activity');
        break;
      case 'behavior':
        onQuickEntry?.(child, 'incident');
        break;
      case 'quick_note':
        onQuickEntry?.(child, 'quick_note');
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
        width: '100%',
        ...sx,
      }}
    >
      <Box sx={{ px: { xs: 1, md: 1.25 }, py: { xs: 0.6, md: 0.75 }, pb: { xs: 1, md: 1.2 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 0.55, md: 1.5 },
            rowGap: { xs: 0.55, md: 1.5 },
          }}
        >
          {actionCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
              colSpan={1}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardActionBoard;
