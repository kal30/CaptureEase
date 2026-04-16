import React from 'react';
import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LOG_TYPES } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

const actionCards = [
  {
    key: 'meds',
    title: LOG_TYPES.medication?.displayLabel || 'Meds',
    subtitle: 'Time, dose',
    emoji: LOG_TYPES.medication?.icon || '💊',
    bg: '#DBEEED',
    border: '#D7E2D6',
    text: '#355534',
  },
  {
    key: 'sleep',
    title: LOG_TYPES.sleep?.displayLabel || 'Sleep',
    subtitle: 'Time, duration',
    emoji: LOG_TYPES.sleep?.icon || '😴',
    bg: '#CCDBE9',
    border: '#D7DAEE',
    text: '#3949AB',
  },
  {
    key: 'food',
    title: LOG_TYPES.food?.displayLabel || 'Food',
    subtitle: 'What, amount',
    emoji: LOG_TYPES.food?.icon || '🍽️',
    bg: '#faf1e8',
    border: '#E5DFD8',
    text: '#7C5A3A',
  },
  {
    key: 'toilet',
    title: LOG_TYPES.bathroom?.displayLabel || 'Toilet',
    subtitle: 'Time, type',
    emoji: LOG_TYPES.bathroom?.icon || '🚽',
    bg: '#ECEBE8',
    border: '#D4E5E2',
    text: '#267F6E',
  },
  {
    key: 'activity',
    title: LOG_TYPES.activity?.displayLabel || 'Activity',
    subtitle: 'Therapy, outings',
    emoji: LOG_TYPES.activity?.icon || '🕐',
    bg: '#F8E7F8',
    border: '#FAE5FA',
    text: LOG_TYPES.activity?.palette?.text || '#345B6C',
  },
  {
    key: 'behavior',
    title: LOG_TYPES.behavior?.displayLabel || 'Behavior',
    subtitle: 'Incidents, mood',
    emoji: LOG_TYPES.behavior?.icon || '🌪️',
    bg: '#F0D2DA',
    border: '#E4DEE0',
    text: LOG_TYPES.behavior?.palette?.text || '#4C3D78',
  },
];

const dailyActionCards = actionCards.slice(0, 4);
const observationCards = actionCards.slice(4, 6);

const quickNoteCard = {
  key: 'quick_note',
  title: 'Quick Note',
  subtitle: 'Auto-classified by AI',
  emoji: '🤖',
  bg: '#F7FFDD',
  border: '#F0F1EB',
  text: '#6B5B95',
};

const cardByKey = Object.fromEntries([...actionCards, quickNoteCard].map((card) => [card.key, card]));

const ActionCard = ({ card, onClick, isCompact = false, colSpan = 1 }) => (
  <Box
    sx={{
      gridColumn: {
        span: `span ${typeof colSpan === 'object' ? colSpan.md || colSpan.xs || 1 : colSpan}`,
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
        height: { xs: isCompact ? 42 : 'auto', md: isCompact ? 60 : 'auto' },
        aspectRatio: { xs: isCompact ? 'auto' : '1', md: isCompact ? 'auto' : '1' },
        borderRadius: '1.1rem',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 140ms ease, box-shadow 140ms ease',
        display: 'flex',
        '&:hover .action-paper': {
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
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
          position: 'relative',
          border: `1px solid ${alpha(card.border, 0.95)}`,
          borderRadius: { xs: isCompact ? '999px' : '1.35rem', md: '1.75rem' },
          bgcolor: alpha(card.bg || '#FFFFFF', 0.9),
          backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.2))',
          backdropFilter: 'blur(12px) saturate(140%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 12px 24px rgba(15, 23, 42, 0.05)',
          px: { xs: isCompact ? 0.7 : 0.5, md: 1.2 },
          py: { xs: isCompact ? 0.1 : 0.55, md: 0.95 },
          display: 'flex',
          flexDirection: isCompact ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: isCompact ? 'space-between' : 'center',
          gap: { xs: 0.08, md: 0.45 },
          textTransform: 'uppercase',
          transition: 'inherit',
          overflow: 'hidden',
        }}
      >
        {isCompact ? (
          <>
            <Box
              sx={{
                width: { xs: isCompact ? 22 : 24, md: 36 },
                height: { xs: isCompact ? 22 : 24, md: 36 },
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                color: card.text || '#1F2937',
                fontSize: { xs: isCompact ? '0.85rem' : '0.9rem', md: '1.1rem' },
                lineHeight: 1,
                bgcolor: alpha('#FFFFFF', 0.52),
                border: `1px solid ${alpha(card.border, 0.32)}`,
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.75), inset 0 -1px 3px rgba(15, 23, 42, 0.04)',
                flexShrink: 0,
              }}
            >
              {card.emoji}
            </Box>
            <Typography
              component="span"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: { xs: isCompact ? '0.66rem' : '0.56rem', md: '0.9rem' },
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                color: '#1F2937',
                textTransform: 'none',
                flex: 1,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {card.title}
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: { xs: 32, md: 56 },
                height: { xs: 32, md: 56 },
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                color: card.text || '#1F2937',
                fontSize: { xs: '1rem', md: '1.85rem' },
                lineHeight: 1,
                bgcolor: alpha('#FFFFFF', 0.45),
                border: `1px solid ${alpha(card.border, 0.4)}`,
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.75), inset 0 -1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              {card.emoji}
            </Box>
            <Typography
              component="span"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: { xs: '0.42rem', md: '0.52rem' },
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '0.05em',
                color: '#1F2937',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {card.title}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: { xs: '0.48rem', md: '0.64rem' },
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: '0.02em',
                color: '#64748B',
                textTransform: 'capitalize',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {card.subtitle}
            </Typography>
          </>
        )}
      </Paper>
    </ButtonBase>
  </Box>
);

const DashboardActionBoard = ({
  child,
  onTrack,
  onOpenMedicalLog,
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: { xs: 1.1, md: 3.1 },
            rowGap: { xs: 1.6, md: 3.25 },
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
        </Box>

        <Box
          sx={{
            mt: { xs: 2.2, md: 2.5 },
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(12, minmax(0, 1fr))',
            },
            columnGap: { xs: 1, md: 2.4 },
            rowGap: { xs: 1, md: 2.4 },
          }}
        >
          {observationCards.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onClick={() => handleCardClick(card.key)}
              colSpan={{ xs: 1, md: 4 }}
            />
          ))}
          <ActionCard
            card={cardByKey.quick_note}
            onClick={() => handleCardClick('quick_note')}
            colSpan={{ xs: 1, md: 4 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardActionBoard;
