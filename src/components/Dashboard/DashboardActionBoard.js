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
    bg: '#F5FAF1',
    border: coreActionMap.meds?.color || '#D97706',
    lightBorder: '#F3E8FF',
  },
  {
    key: 'sleep',
    title: coreActionMap.sleep?.label || 'Sleep',
    subtitle: 'Time, duration',
    emoji: coreActionMap.sleep?.icon || '😴',
    bg: '#EFF2FF',
    border: coreActionMap.sleep?.color || '#4C1D95',
    lightBorder: '#F3E8FF',
  },
  {
    key: 'food',
    title: coreActionMap.food?.label || 'Food',
    subtitle: 'What, amount',
    emoji: coreActionMap.food?.icon || '🍽️',
    bg: '#FFF8F1',
    border: coreActionMap.food?.color || '#2563EB',
    lightBorder: '#F3E8FF',
  },
  {
    key: 'toilet',
    title: coreActionMap.toilet?.label || 'Toilet',
    subtitle: 'Time, type',
    emoji: coreActionMap.toilet?.icon || '🚽',
    bg: '#F0FFFB',
    border: coreActionMap.toilet?.color || '#64748B',
    lightBorder: '#F3E8FF',
  },
  {
    key: 'activity',
    title: coreActionMap.activity?.label || 'Activity',
    subtitle: 'Therapy, outings',
    emoji: coreActionMap.activity?.icon || '🕐',
    bg: '#F0FAFE',
    border: coreActionMap.activity?.color || '#F43F5E',
    lightBorder: '#F3E8FF',
  },
  {
    key: 'behavior',
    title: coreActionMap.behavior?.label || 'Behavior',
    subtitle: 'Incidents, mood',
    emoji: coreActionMap.behavior?.icon || '🌪️',
    bg: '#F5F3FF',
    border: coreActionMap.behavior?.color || '#B45309',
    lightBorder: '#F3E8FF',
  },
];

const dailyActionCards = actionCards.slice(0, 4);
const observationCards = actionCards.slice(4, 6);

const quickNoteCard = {
  key: 'quick_note',
  title: 'Quick Note (auto-classified)',
  subtitle: 'Free-form entry with optional tags',
  emoji: '🤖',
  bg: '#F8FAFC',
  border: '#059669',
  lightBorder: '#F3E8FF',
};

const cardByKey = Object.fromEntries([...actionCards, quickNoteCard].map((card) => [card.key, card]));

const ActionCard = ({ card, onClick, isCompact = false, colSpan = 1 }) => (
  <Box
    sx={{
      gridColumn: `span ${colSpan}`,
    }}
  >
    <ButtonBase
      onClick={onClick}
      data-cy={`dashboard-action-${card.key}`}
      sx={{
        width: '100%',
        height: isCompact ? '60px' : 'auto',
        aspectRatio: isCompact ? 'auto' : '1',
        borderRadius: '0.75rem',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 140ms ease, box-shadow 140ms ease',
        display: 'flex',
        '&:hover .action-paper': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        },
        '&:active': {
          transform: 'scale(0.95)',
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
          height: '100%',
          border: `2px solid ${card.border}`,
          borderRadius: '1.25rem',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          px: 0.75,
          py: isCompact ? 0.5 : 0.75,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isCompact ? 0.2 : 0.4,
          textTransform: 'uppercase',
          transition: 'inherit',
        }}
      >
        <Box
          sx={{
            fontSize: isCompact ? '1.2rem' : '1.6rem',
            lineHeight: 1,
          }}
        >
          {card.emoji}
        </Box>
        <Typography
          component="span"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: isCompact ? '0.55rem' : '0.625rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '0.05em',
            color: '#1F2937',
          }}
        >
          {card.title}
        </Typography>
        {!isCompact && (
          <Typography
            component="span"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.625rem',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '0.02em',
              color: '#94A3B8',
              textTransform: 'capitalize',
            }}
          >
            {card.subtitle}
          </Typography>
        )}
      </Paper>
    </ButtonBase>
  </Box>
);

const QuickNoteCard = ({ card, onClick }) => (
  <Box
    sx={{
      gridColumn: 'span 4',
    }}
  >
    <ButtonBase
      onClick={onClick}
      data-cy={`dashboard-action-${card.key}`}
      sx={{
        width: '100%',
        borderRadius: '1.5rem',
        textAlign: 'left',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transition: 'all 140ms ease',
        height: '48px',
        display: 'flex',
        '&:hover .quick-note-paper': {
          bgcolor: '#E8EEF5',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 80ms ease',
        },
        '&:focus-visible': {
          outline: `2px solid ${colors.brand.ink}`,
          outlineOffset: 2,
        },
      }}
    >
      <Paper
        className="quick-note-paper"
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '1.25rem',
          border: `2px solid ${card.border}`,
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          px: 1.2,
          py: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 0.8,
          textTransform: 'uppercase',
          transition: 'inherit',
        }}
      >
        <Box
          sx={{
            fontSize: '1.2rem',
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
            fontSize: '0.625rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '0.05em',
            color: '#475569',
          }}
        >
          Quick Note
        </Typography>
      </Paper>
    </ButtonBase>
  </Box>
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
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
        width: '100%',
        ...sx,
      }}
    >
      <Box sx={{ px: { xs: 1, md: 1.25 }, py: { xs: 0.6, md: 0.75 }, pb: { xs: 1, md: 1.2 } }}>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', md: '0.74rem' },
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colors.landing.textMuted,
            mb: 0.4,
          }}
        >
          Daily Logging
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: { xs: 2.5, md: 3.5 },
            rowGap: { xs: 3, md: 4 },
          }}
        >
          {dailyActionCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
              colSpan={1}
            />
          ))}

          {observationCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
              isCompact
              colSpan={2}
            />
          ))}

          <QuickNoteCard
            card={cardByKey.quick_note}
            onClick={() => handleCardClick('quick_note')}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardActionBoard;
