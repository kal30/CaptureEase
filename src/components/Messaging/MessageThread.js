// Message Thread Component
// Displays messages in a conversation with real-time updates

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
// Icons handled inside subcomponents

// Services and utils
import { getMessages, markMessageAsRead } from '../../services/messaging';
import { needsDateSeparator } from '../../utils/dateUtils';
// (theme used inside subcomponents)

// Components
import MessageComposer from './MessageComposer';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import MessageSkeleton from './MessageSkeleton';
import ThreadHeader from './ThreadHeader';
import MessageList from './MessageList';

// MessageBubble extracted to separate file

// DateSeparator extracted to separate file

// MessageSkeleton extracted to separate file

/**
 * Main MessageThread component
 */
const MessageThread = ({
  conversation,
  currentUserId,
  onConversationUpdate,
  isMobile = false
}) => {
  const { t } = useTranslation('terms');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination state (for future use)
  // const [hasMoreMessages, setHasMoreMessages] = useState(false);
  // const [loadingMore, setLoadingMore] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  /**
   * Load messages for the conversation
   */
  const loadMessages = useCallback(async (isLoadMore = false) => {
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

        // setHasMoreMessages(result.hasMore || false); // Commented out since pagination is not implemented

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
      // setLoadingMore(false); // Commented out since loadingMore is not used
    }
  }, [conversation?.id, currentUserId]);

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
  }, [conversation?.id, currentUserId, loadMessages]);

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
        <ThreadHeader conversation={conversation} isMobile={isMobile} loading />

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
      <ThreadHeader conversation={conversation} isMobile={isMobile} />

      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: 'grey.50',
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
              color: 'text.secondary',
            }}
          >
            <Box sx={{ fontSize: '3rem', opacity: 0.3 }}>💬</Box>
            <Typography variant="h6" sx={{ opacity: 0.7 }}>
              {t('no_messages_yet')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center' }}>
              {t('start_conversation_prompt')}
            </Typography>
          </Box>
        ) : (
          <MessageList
            groupedMessages={groupedMessages}
            currentUserId={currentUserId}
            onReply={handleReply}
            endRef={messagesEndRef}
          />
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
