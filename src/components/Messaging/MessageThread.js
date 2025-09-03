// Message Thread Component
// Displays messages in a conversation with real-time updates

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import {
  Info,
  MoreVert,
  Reply,
  Check,
  DoneAll
} from '@mui/icons-material';

// Services and utils
import { getMessages, markMessageAsRead } from '../../services/messaging';
import { formatMessageTime, getDateGroupLabel, needsDateSeparator } from '../../utils/dateUtils';

// Components
import MessageComposer from './MessageComposer';

/**
 * Individual message bubble component
 */
const MessageBubble = ({ 
  message, 
  currentUserId, 
  showAvatar = true,
  showTimestamp = true,
  onReply 
}) => {
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
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            bgcolor: 'primary.main'
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
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
        }}
      >
        {/* Sender name (only for other users' messages) */}
        {!isOwnMessage && showAvatar && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mb: 0.5,
              ml: 1
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
                pl: 0
              })
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Replying to message
            </Typography>
          </Box>
        )}

        {/* Message bubble */}
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
            position: 'relative',
            maxWidth: '100%',
            wordBreak: 'break-word',
            ...(isOwnMessage && {
              borderBottomRightRadius: 4,
            }),
            ...(!isOwnMessage && {
              borderBottomLeftRadius: 4,
            }),
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
                color: 'inherit'
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
                fontSize: '0.7rem'
              }}
            >
              edited
            </Typography>
          )}

          {/* Message actions */}
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              ...(isOwnMessage ? { left: -40 } : { right: -40 }),
              display: 'flex',
              opacity: 0,
              transition: 'opacity 0.2s',
              '.message-bubble:hover &': {
                opacity: 1
              }
            }}
            className="message-actions"
          >
            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Reply fontSize="small" />
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
                flexDirection: 'row-reverse'
              })
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: '0.7rem'
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

/**
 * Date separator component
 */
const DateSeparator = ({ date }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      my: 2,
      gap: 2
    }}
  >
    <Divider sx={{ flex: 1 }} />
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        backgroundColor: 'background.paper',
        px: 2,
        py: 0.5,
        borderRadius: 1,
        fontWeight: 500
      }}
    >
      {getDateGroupLabel(date)}
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Box>
);

/**
 * Message loading skeleton
 */
const MessageSkeleton = ({ isOwnMessage = false }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: isOwnMessage ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 1,
      mb: 2,
    }}
  >
    {!isOwnMessage && (
      <CircularProgress size={32} thickness={2} />
    )}
    <Box
      sx={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
      }}
    >
      <Paper
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
          opacity: 0.6,
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 0.8 }
          }
        }}
      >
        <Typography variant="body2">
          Loading message...
        </Typography>
      </Paper>
    </Box>
  </Box>
);

/**
 * Main MessageThread component
 */
const MessageThread = ({
  conversation,
  currentUserId,
  onConversationUpdate,
  isMobile = false
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  /**
   * Load messages for the conversation
   */
  const loadMessages = async (isLoadMore = false) => {
    if (!conversation?.id || !currentUserId) return;

    try {
      if (!isLoadMore) setLoading(true);
      setError(null);

      console.log('📨 Loading messages for conversation:', conversation.id);

      const options = {
        limit: 50,
        includeDeleted: false,
        ...(isLoadMore && messages.length > 0 && {
          before: messages[0]?.createdAt
        })
      };

      const result = await getMessages(conversation.id, currentUserId, options);

      if (result.success) {
        const newMessages = result.messages || [];
        
        if (isLoadMore) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }

        setHasMoreMessages(result.hasMore || false);
        console.log(`✅ Loaded ${newMessages.length} messages`);

        // Mark unread messages as read
        await markUnreadMessagesAsRead(newMessages);
      } else {
        console.error('Failed to load messages:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Mark unread messages as read
   */
  const markUnreadMessagesAsRead = async (messagesToCheck) => {
    if (!currentUserId) return;

    try {
      const unreadMessages = messagesToCheck.filter(msg => 
        msg.senderId !== currentUserId && 
        (!msg.readBy || !msg.readBy[currentUserId])
      );

      for (const message of unreadMessages) {
        await markMessageAsRead(message.id, currentUserId);
      }

      if (unreadMessages.length > 0) {
        console.log(`✅ Marked ${unreadMessages.length} messages as read`);
        // Refresh conversation list to update unread counts
        onConversationUpdate?.();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  /**
   * Handle new message sent
   */
  const handleMessageSent = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
    onConversationUpdate?.();
    
    // Scroll to bottom after a short delay
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle reply to message
   */
  const handleReply = (message) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message.id);
  };

  /**
   * Group messages by date and consecutive sender
   */
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message, index) => {
      const previousMessage = messages[index - 1];
      const needsDateSep = needsDateSeparator(message.createdAt, previousMessage?.createdAt);
      const isSameSender = previousMessage?.senderId === message.senderId;
      const isWithinTimeThreshold = previousMessage && 
        (new Date(message.createdAt) - new Date(previousMessage.createdAt)) < 300000; // 5 minutes

      // Add date separator if needed
      if (needsDateSep) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        groups.push({
          type: 'date',
          date: message.createdAt,
          id: `date-${message.createdAt}`
        });
        currentGroup = null;
      }

      // Start new group or add to existing
      if (!currentGroup || !isSameSender || !isWithinTimeThreshold) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          type: 'messages',
          senderId: message.senderId,
          senderName: message.senderName,
          messages: [message],
          id: `group-${message.id}`
        };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      setMessages([]);
      loadMessages();
    }
  }, [conversation?.id, currentUserId]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.senderId === currentUserId || !lastMessageRef.current) {
        scrollToBottom();
      }
      lastMessageRef.current = lastMessage;
    }
  }, [messages, loading]);

  if (loading && messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {conversation?.type === 'group' ? '👥' : '👤'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {conversation?.title || 'Loading...'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Loading messages...
            </Typography>
          </Box>
        </Box>

        {/* Loading messages */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <MessageSkeleton />
          <MessageSkeleton isOwnMessage />
          <MessageSkeleton />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            Failed to load messages: {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {conversation?.type === 'group' ? '👥' : '👤'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {conversation?.title || 'Conversation'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {conversation?.participants?.length || 0} participants
          </Typography>
        </Box>
        <IconButton>
          <MoreVert />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: 'grey.50'
        }}
      >
        {groupedMessages.length === 0 ? (
          // Empty state
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              color: 'text.secondary'
            }}
          >
            <Box sx={{ fontSize: '3rem', opacity: 0.3 }}>💬</Box>
            <Typography variant="h6" sx={{ opacity: 0.7 }}>
              No messages yet
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center' }}>
              Start the conversation by sending a message below.
            </Typography>
          </Box>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <Fade key={group.id} in={true}>
                <div>
                  {group.type === 'date' ? (
                    <DateSeparator date={group.date} />
                  ) : (
                    <Box className="message-bubble" sx={{ mb: 2 }}>
                      {group.messages.map((message, index) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          currentUserId={currentUserId}
                          showAvatar={index === 0}
                          showTimestamp={index === group.messages.length - 1}
                          onReply={handleReply}
                        />
                      ))}
                    </Box>
                  )}
                </div>
              </Fade>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Composer */}
      <MessageComposer
        conversationId={conversation?.id}
        currentUserId={currentUserId}
        onMessageSent={handleMessageSent}
        isMobile={isMobile}
      />
    </Box>
  );
};

export default MessageThread;