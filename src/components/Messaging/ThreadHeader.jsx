// ThreadHeader Component
// Displays conversation avatar, title, participant info, and menu

import React from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Avatar sx={{ bgcolor: 'primary.main' }}>{isGroup ? '👥' : '👤'}</Avatar>
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
