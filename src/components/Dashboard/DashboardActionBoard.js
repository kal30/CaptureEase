import React from 'react';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CORE_ENTRY_ACTIONS } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

const coreActionMap = CORE_ENTRY_ACTIONS.reduce((acc, action) => {
  acc[action.key] = action;
  return acc;
}, {});

const actionCards = [
  {
    key: 'meds',
    title: coreActionMap.meds?.label || 'Meds',
    subtitle: 'Time, dose',
    emoji: coreActionMap.meds?.icon || '💊',
    bg: '#EAF4D8',
    border: '#D5E2B5',
    accent: '#4D6B23',
  },
  {
    key: 'sleep',
    title: coreActionMap.sleep?.label || 'Sleep',
    subtitle: 'Time, duration',
    emoji: coreActionMap.sleep?.icon || '😴',
    bg: '#EAF2FA',
    border: '#C9DAEA',
    accent: '#325B7C',
  },
  {
    key: 'food',
    title: coreActionMap.food?.label || 'Food',
    subtitle: 'What, amount',
    emoji: coreActionMap.food?.icon || '🍽️',
    bg: '#FFF2DD',
    border: '#E8D3A6',
    accent: '#8A5B12',
  },
  {
    key: 'toilet',
    title: coreActionMap.toilet?.label || 'Toilet',
    subtitle: 'Time, type',
    emoji: coreActionMap.toilet?.icon || '🚽',
    bg: '#EAF6F4',
    border: '#C9E3DD',
    accent: '#2C6A5E',
  },
  {
    key: 'activity',
    title: 'Activity',
    subtitle: 'Therapy, outings',
    emoji: '📍',
    bg: '#F7C9AF',
    border: '#E5A88D',
    accent: '#7D351C',
  },
  {
    key: 'behavior',
    title: 'Behavior',
    subtitle: 'Incidents, mood',
    emoji: '🌋',
    bg: '#F5BED5',
    border: '#E099B6',
    accent: '#7B2248',
  },
];

const dailyActionCards = actionCards.slice(0, 4);
const observationCards = actionCards.slice(4, 6);

const quickNoteCard = {
  key: 'quick_note',
  title: 'Quick Note (auto-classified)',
  subtitle: 'Free-form entry with optional tags',
  emoji: '🤖',
  bg: '#F6F3E8',
  border: '#DDD7C0',
  accent: '#4B4331',
};

const cardByKey = Object.fromEntries([...actionCards, quickNoteCard].map((card) => [card.key, card]));

const ActionCard = ({ card, onClick, spanFull = false }) => (
  <ButtonBase
    onClick={onClick}
    data-cy={`dashboard-action-${card.key}`}
    sx={{
      width: '100%',
      minWidth: 0,
      minHeight: spanFull ? { xs: 54, md: 62 } : { xs: 74, md: 96 },
      borderRadius: '12px',
      overflow: 'hidden',
      textAlign: 'center',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
      '&:focus-visible': {
        outline: `2px solid ${colors.brand.ink}`,
        outlineOffset: 3,
      },
    }}
  >
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        borderRadius: '12px',
        borderColor: card.border,
        bgcolor: card.bg,
        boxShadow: `0 3px 8px ${alpha(card.border, 0.14)}`,
        px: { xs: 1, md: 1.25 },
        py: spanFull ? { xs: 0.8, md: 1 } : { xs: 0.9, md: 1.2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none',
      }}
    >
      <Stack spacing={0.2} alignItems="center" sx={{ maxWidth: 180, width: '100%' }}>
        <Typography
          component="span"
          sx={{
            fontSize: spanFull ? { xs: '0.82rem', md: '0.88rem' } : { xs: '0.95rem', md: '1.1rem' },
            lineHeight: 1,
          }}
        >
          {card.emoji}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: spanFull ? { xs: '0.74rem', md: '0.8rem' } : { xs: '0.8rem', md: '0.9rem' },
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: card.accent,
          }}
        >
          {card.title}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: spanFull ? { xs: '0.6rem', md: '0.64rem' } : { xs: '0.62rem', md: '0.68rem' },
            fontWeight: 500,
            lineHeight: 1.15,
            color: alpha(card.accent, 0.9),
          }}
        >
          {card.subtitle}
        </Typography>
      </Stack>
    </Paper>
  </ButtonBase>
);

const DashboardActionBoard = ({
  child,
  onTrack,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onQuickEntry,
  sx = {},
}) => {
  if (!child) {
    return null;
  }

  const handleCardClick = (key) => {
    switch (key) {
      case 'meds':
        if (typeof onTrack === 'function') {
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
      case 'toilet':
        onOpenBathroomLog?.(child);
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
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '16px',
        borderColor: colors.landing.borderLight,
        bgcolor: colors.landing.surface,
        boxShadow: `0 8px 20px ${colors.landing.shadowSoft}`,
        overflow: 'hidden',
        maxHeight: { xs: 340, sm: 'none' },
        overflowY: { xs: 'auto', sm: 'visible' },
        WebkitOverflowScrolling: 'touch',
        maxWidth: 720,
        mx: 'auto',
        ...sx,
      }}
    >
      <Box sx={{ px: { xs: 1, md: 1.25 }, py: { xs: 0.8, md: 1 }, pb: { xs: 1.25, md: 1 } }}>
        <Typography
          sx={{
            fontSize: { xs: '0.72rem', md: '0.76rem' },
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colors.landing.textMuted,
            mb: 0.5,
          }}
        >
          Daily Logging
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: { xs: 0.7, md: 0.9 },
          }}
        >
          {dailyActionCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontSize: { xs: '0.72rem', md: '0.76rem' },
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colors.landing.textMuted,
            mt: { xs: 1, md: 1.1 },
            mb: 0.5,
          }}
        >
          Observations
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: { xs: 0.7, md: 0.9 },
          }}
        >
          {observationCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
            />
          ))}
        </Box>

        <Box sx={{ mt: { xs: 0.7, md: 0.9 } }}>
          <ActionCard
            card={cardByKey.quick_note}
            onClick={() => handleCardClick('quick_note')}
            spanFull
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default DashboardActionBoard;
