// Message Composer Component
// Text input area for composing and sending messages

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  Close,
  Share,
  PriorityHigh
} from '@mui/icons-material';

// Services
import { sendMessage } from '../../services/messaging';
import { MessageTypes, MessagePriority } from '../../models/messaging';
import { getMessagingTheme } from '../../assets/theme/messagingTheme';

/**
 * Message priority selector
 */
const PrioritySelector = ({ priority, onPriorityChange, anchorEl, onClose }) => {
  const priorities = [
    { value: MessagePriority.NORMAL, label: 'Normal', icon: '💬', color: 'default' },
    { value: MessagePriority.URGENT, label: 'Urgent', icon: '🚨', color: 'error' }
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      {priorities.map((p) => (
        <MenuItem
          key={p.value}
          selected={priority === p.value}
          onClick={() => {
            onPriorityChange(p.value);
            onClose();
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{p.icon}</span>
            <Typography>{p.label}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );
};

/**
 * Reply preview component
 */
const ReplyPreview = ({ replyToMessage, onCancelReply }) => {
  if (!replyToMessage) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: 'action.hover',
        borderLeft: 4,
        borderColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Replying to {replyToMessage.senderName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mt: 0.25
          }}
        >
          {replyToMessage.text || `${replyToMessage.type} message`}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onCancelReply}>
        <Close />
      </IconButton>
    </Box>
  );
};

/**
 * Main MessageComposer component
 */
const MessageComposer = ({
  conversationId,
  currentUserId,
  onMessageSent,
  isMobile = false,
  replyToMessage = null,
  onCancelReply = null
}) => {
  const theme = useTheme();
  const messagingTheme = getMessagingTheme(theme);
  
  // State management
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [priority, setPriority] = useState(MessagePriority.NORMAL);
  const [priorityAnchor, setPriorityAnchor] = useState(null);

  // Refs
  const textFieldRef = useRef(null);
  const fileInputRef = useRef(null);

  /**
   * Handle message text change
   */
  const handleTextChange = (event) => {
    setMessageText(event.target.value);
    setError(null); // Clear any previous errors
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Send message
   */
  const handleSendMessage = async () => {
    const trimmedText = messageText.trim();
    
    // Validation
    if (!trimmedText || !conversationId || !currentUserId) {
      return;
    }

    if (sending) {
      return; // Prevent double-sending
    }

    try {
      setSending(true);
      setError(null);

      console.log('📤 Sending message:', { conversationId, text: trimmedText, priority });

      // Prepare message data
      const messageData = {
        conversationId,
        senderId: currentUserId,
        senderName: 'Current User', // TODO: Get from user context
        text: trimmedText,
        type: MessageTypes.TEXT,
        priority,
        replyTo: replyToMessage?.id || null,
        metadata: {}
      };

      const result = await sendMessage(messageData);

      if (result.success) {
        console.log('✅ Message sent successfully:', result.messageId);
        
        // Clear composer
        setMessageText('');
        setPriority(MessagePriority.NORMAL);
        
        // Cancel reply if active
        if (onCancelReply) {
          onCancelReply();
        }

        // Create message object for immediate UI update
        const sentMessage = {
          id: result.messageId,
          ...messageData,
          createdAt: new Date(),
          updatedAt: new Date(),
          readBy: { [currentUserId]: new Date() },
          isEdited: false,
          isDeleted: false
        };

        // Notify parent component
        onMessageSent?.(sentMessage);

        // Focus back to input
        textFieldRef.current?.focus();
      } else {
        console.error('Failed to send message:', result.error);
        setError(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle file attachment
   */
  const handleFileAttach = () => {
    // TODO: Implement file attachment
    console.log('📎 File attachment not yet implemented');
    fileInputRef.current?.click();
  };

  /**
   * Handle emoji picker (placeholder)
   */
  const handleEmojiPicker = () => {
    // TODO: Implement emoji picker
    console.log('😀 Emoji picker not yet implemented');
  };

  /**
   * Handle share content (for sharing incidents/timeline entries)
   */
  const handleShareContent = () => {
    // TODO: Implement content sharing
    console.log('🔗 Content sharing not yet implemented');
  };

  /**
   * Handle priority selection
   */
  const handlePriorityClick = (event) => {
    setPriorityAnchor(event.currentTarget);
  };

  const handlePriorityClose = () => {
    setPriorityAnchor(null);
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  // Focus input on mount
  useEffect(() => {
    if (!isMobile) {
      textFieldRef.current?.focus();
    }
  }, [conversationId, isMobile]);

  // Auto-resize text field (basic implementation)
  const maxRows = isMobile ? 3 : 4;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px 20px 0 0',
        borderTop: `2px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        background: `linear-gradient(to bottom, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
      }}
    >
      {/* Reply Preview */}
      <ReplyPreview replyToMessage={replyToMessage} onCancelReply={onCancelReply} />

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mx: 2, mt: 1, mb: 0 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Priority Indicator */}
      {priority === MessagePriority.URGENT && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Chip
            size="small"
            icon={<PriorityHigh />}
            label="Urgent Message"
            color="error"
            variant="outlined"
            onDelete={() => setPriority(MessagePriority.NORMAL)}
          />
        </Box>
      )}

      {/* Main Composer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 2,
          ...(priority === MessagePriority.URGENT && { pt: 1 })
        }}
      >
        {/* Action Buttons (Left) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Tooltip title="Attach file">
            <IconButton
              size="small"
              onClick={handleFileAttach}
              disabled={sending}
              sx={{ color: 'text.secondary' }}
            >
              <AttachFile />
            </IconButton>
          </Tooltip>

          {!isMobile && (
            <Tooltip title="Share content">
              <IconButton
                size="small"
                onClick={handleShareContent}
                disabled={sending}
                sx={{ color: 'text.secondary' }}
              >
                <Share />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Text Input */}
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={maxRows}
          placeholder="Type your message..."
          value={messageText}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          disabled={sending}
          variant="outlined"
          size="small"
          sx={{
            ...messagingTheme.search.input,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.default,
              minHeight: 48,
              borderRadius: '24px',
              border: `2px solid ${theme.palette.divider}`,
              transition: messagingTheme.transitions.fast,
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                borderColor: theme.palette.primary.light,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
              },
            },
            '& .MuiInputBase-input': {
              py: 1.5,
              px: 2,
              lineHeight: 1.4,
              fontSize: '0.95rem',
              '&::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7,
              }
            }
          }}
        />

        {/* Action Buttons (Right) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {!isMobile && (
            <Tooltip title="Add emoji">
              <IconButton
                size="small"
                onClick={handleEmojiPicker}
                disabled={sending}
                sx={{ color: 'text.secondary' }}
              >
                <EmojiEmotions />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Message priority">
            <IconButton
              size="small"
              onClick={handlePriorityClick}
              disabled={sending}
              sx={{
                color: priority === MessagePriority.URGENT ? 'error.main' : 'text.secondary'
              }}
            >
              <PriorityHigh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Send Button */}
        <Tooltip title={messageText.trim() ? 'Send message (Enter)' : 'Enter a message to send'}>
          <Box>
            <IconButton
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending || !conversationId}
              sx={{
                ...messagingTheme.buttons.messages,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                width: 48,
                height: 48,
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: messagingTheme.transitions.fast,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'scale(1.05) translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                },
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  transform: 'none',
                  boxShadow: 'none',
                }
              }}
            >
              {sending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )}
            </IconButton>
          </Box>
        </Tooltip>
      </Box>

      {/* Priority Selector Menu */}
      <PrioritySelector
        priority={priority}
        onPriorityChange={handlePriorityChange}
        anchorEl={priorityAnchor}
        onClose={handlePriorityClose}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={(e) => {
          console.log('Selected files:', e.target.files);
          // TODO: Handle file selection
        }}
        style={{ display: 'none' }}
      />
    </Paper>
  );
};

export default MessageComposer;