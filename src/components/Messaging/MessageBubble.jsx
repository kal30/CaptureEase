// MessageBubble Component
// Individual message bubble with actions, metadata, and styling

import React from 'react';
import { Box, Typography, Avatar, Paper, Chip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Info, Reply, Check, DoneAll } from '@mui/icons-material';

import { formatMessageTime } from '../../utils/dateUtils';
import { getMessagingTheme } from '../../assets/theme/messagingTheme';

const MessageBubble = ({
  message,
  currentUserId,
  showAvatar = true,
  showTimestamp = true,
  onReply,
}) => {
  const theme = useTheme();
  const messagingTheme = getMessagingTheme(theme);
  const isOwnMessage = message.senderId === currentUserId;
  const isRead = message.readBy && Object.keys(message.readBy).length > 1; // More than just sender

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 1,
        mb: 1,
        ...(isOwnMessage && {
          flexDirection: 'row-reverse',
        }),
      }}
    >
      {/* Avatar (only show for other users' messages) */}
      {showAvatar && !isOwnMessage && (
        <Avatar
          sx={{
            ...messagingTheme.childContext.avatar,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {message.senderName?.charAt(0)?.toUpperCase() || '?'}
        </Avatar>
      )}

      {/* Message content */}
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Sender name (only for other users' messages) */}
        {!isOwnMessage && showAvatar && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mb: 0.5,
              ml: 1,
            }}
          >
            {message.senderName}
          </Typography>
        )}

        {/* Reply indicator */}
        {message.replyTo && (
          <Box
            sx={{
              maxWidth: '100%',
              mb: 0.5,
              opacity: 0.7,
              borderLeft: 2,
              borderColor: 'primary.main',
              pl: 1,
              ...(isOwnMessage && {
                borderRight: 2,
                borderLeft: 0,
                pr: 1,
                pl: 0,
              }),
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Replying to message
            </Typography>
          </Box>
        )}

        {/* Message bubble */}
        <Paper
          elevation={0}
          className="message-bubble"
          sx={{
            px: 2,
            py: 1.5,
            position: 'relative',
            maxWidth: '100%',
            wordBreak: 'break-word',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: messagingTheme.transitions.fast,
            ...(isOwnMessage
              ? {
                  ...messagingTheme.messageBubble.own,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }
              : {
                  ...messagingTheme.messageBubble.other,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }),
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          {/* Message text */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
            }}
          >
            {message.text}
          </Typography>

          {/* Message metadata */}
          {message.metadata && message.metadata.incidentId && (
            <Chip
              size="small"
              label="Important Moment Shared"
              icon={<Info />}
              sx={{
                mt: 1,
                height: 24,
                fontSize: '0.7rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'inherit',
              }}
            />
          )}

          {/* Edited indicator */}
          {message.isEdited && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                opacity: 0.7,
                fontStyle: 'italic',
                fontSize: '0.7rem',
              }}
            >
              edited
            </Typography>
          )}

          {/* Message actions */}
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              ...(isOwnMessage ? { left: -50 } : { right: -50 }),
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transition: messagingTheme.transitions.fast,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '.message-bubble:hover &': {
                opacity: 1,
              },
            }}
            className="message-actions"
          >
            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{
                width: 28,
                height: 28,
                backgroundColor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Reply sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Paper>

        {/* Timestamp and read status */}
        {showTimestamp && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              ...(isOwnMessage && {
                flexDirection: 'row-reverse',
              }),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: '0.7rem',
              }}
            >
              {formatMessageTime(message.createdAt)}
            </Typography>

            {/* Read status for own messages */}
            {isOwnMessage && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isRead ? (
                  <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />
                ) : (
                  <Check sx={{ fontSize: 14, color: 'text.disabled' }} />
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;

