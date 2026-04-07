// ThreadHeader Component
// Displays conversation avatar, title, participant info, and menu

import React from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import colors from '../../assets/theme/colors';

const ThreadHeader = ({ conversation, isMobile = false, loading = false, onMenuClick }) => {
  const { t } = useTranslation('terms');
  const isGroup = conversation?.type === 'group';
  const title = loading
    ? conversation?.title || t('loading_messages')
    : conversation?.title || 'Conversation';

  const count = conversation?.participants?.length || 0;
  const subtitle = loading
    ? t('loading_messages')
    : t(count === 1 ? 'participants_one' : 'participants_other', { count });

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: colors.landing.borderLight,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: colors.landing.pageBackground,
        backgroundImage: `linear-gradient(180deg, ${colors.landing.pageBackground} 0%, ${colors.landing.panelSoft} 100%)`,
      }}
    >
      <Avatar sx={{ bgcolor: colors.brand.ink, color: colors.landing.heroText }}>{isGroup ? '👥' : '👤'}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      </Box>
      <IconButton onClick={onMenuClick} aria-label="Thread menu">
        <MoreVert />
      </IconButton>
    </Box>
  );
};

export default ThreadHeader;
