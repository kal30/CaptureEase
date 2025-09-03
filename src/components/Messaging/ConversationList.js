// Conversation List Component
// Displays list of conversations with search and filtering

import React, { useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
  Chip,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  Person,
  FilterList,
  Clear
} from '@mui/icons-material';

// Utils
import { formatTimeAgo } from '../../utils/dateUtils';

/**
 * Individual conversation item component
 */
const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onClick, 
  currentUserId,
  isMobile 
}) => {
  const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;
  const lastMessage = conversation.lastMessage;
  const isGroup = conversation.type === 'group';
  
  // Generate avatar display
  const getAvatarContent = () => {
    if (isGroup) {
      return <Group />;
    }
    
    // For direct conversations, show the other person's initial
    const otherParticipant = conversation.participants?.find(p => p !== currentUserId);
    return otherParticipant?.charAt(0).toUpperCase() || '?';
  };

  const getAvatarColor = () => {
    // Use consistent color based on conversation ID
    const colors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
    const index = conversation.id?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => onClick(conversation)}
      sx={{
        mb: 0.5,
        borderRadius: 1,
        '&.Mui-selected': {
          backgroundColor: 'primary.light',
          '&:hover': {
            backgroundColor: 'primary.light',
          },
        },
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          <Avatar
            sx={{ 
              bgcolor: `${getAvatarColor()}.main`,
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48
            }}
          >
            {getAvatarContent()}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: unreadCount > 0 ? 600 : 400,
                color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {conversation.title || 'Untitled Conversation'}
            </Typography>
            {isGroup && (
              <Chip
                size="small"
                label={`${conversation.participants?.length || 0}`}
                variant="outlined"
                sx={{ minWidth: 'auto', height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            {lastMessage && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: unreadCount > 0 ? 500 : 400,
                  mb: 0.5
                }}
              >
                {lastMessage.senderId !== currentUserId && `${lastMessage.senderName}: `}
                {lastMessage.text || `${lastMessage.type} message`}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{ 
                color: 'text.disabled',
                fontSize: '0.75rem'
              }}
            >
              {lastMessage ? formatTimeAgo(lastMessage.timestamp) : formatTimeAgo(conversation.createdAt)}
            </Typography>
          </Box>
        }
        sx={{
          '& .MuiListItemText-secondary': {
            mt: 0.5
          }
        }}
      />
    </ListItemButton>
  );
};

/**
 * Loading skeleton for conversation items
 */
const ConversationSkeleton = ({ count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <ListItem key={index} sx={{ mb: 0.5 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={48} height={48} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" />}
          secondary={
            <Box>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="30%" />
            </Box>
          }
        />
      </ListItem>
    ))}
  </>
);

/**
 * Main ConversationList component
 */
const ConversationList = ({
  conversations = [],
  selectedConversation,
  onConversationSelect,
  onNewConversation,
  currentUserId,
  isMobile = false,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'group', 'direct', 'unread'

  /**
   * Filter and sort conversations
   */
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.title?.toLowerCase().includes(query) ||
        conv.lastMessage?.text?.toLowerCase().includes(query) ||
        conv.lastMessage?.senderName?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      switch (filterType) {
        case 'group':
          filtered = filtered.filter(conv => conv.type === 'group');
          break;
        case 'direct':
          filtered = filtered.filter(conv => conv.type === 'direct');
          break;
        case 'unread':
          filtered = filtered.filter(conv => (conv.unreadCounts?.[currentUserId] || 0) > 0);
          break;
        default:
          break;
      }
    }

    // Sort by last activity (most recent first)
    filtered.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    return filtered;
  }, [conversations, searchQuery, filterType, currentUserId]);

  /**
   * Get total unread count
   */
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCounts?.[currentUserId] || 0);
    }, 0);
  }, [conversations, currentUserId]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  /**
   * Clear search
   */
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  /**
   * Toggle filter type
   */
  const handleFilterToggle = () => {
    const filters = ['all', 'unread', 'group', 'direct'];
    const currentIndex = filters.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % filters.length;
    setFilterType(filters[nextIndex]);
  };

  /**
   * Get filter display text
   */
  const getFilterText = () => {
    switch (filterType) {
      case 'unread': return 'Unread';
      case 'group': return 'Groups';
      case 'direct': return 'Direct';
      default: return 'All';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Conversations
            </Typography>
            {totalUnreadCount > 0 && (
              <Badge
                badgeContent={totalUnreadCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: 20,
                    minWidth: 20
                  }
                }}
              >
                <Box sx={{ width: 20, height: 20 }} />
              </Badge>
            )}
          </Box>
        )}

        {/* Search and Filter */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" onClick={handleFilterToggle}>
            <FilterList />
          </IconButton>
          <Chip
            label={getFilterText()}
            size="small"
            variant={filterType === 'all' ? 'outlined' : 'filled'}
            onClick={handleFilterToggle}
          />
        </Box>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <List sx={{ px: 1 }}>
            <ConversationSkeleton count={6} />
          </List>
        ) : filteredConversations.length === 0 ? (
          // Empty state
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              px: 3,
              color: 'text.secondary'
            }}
          >
            <Box sx={{ fontSize: '3rem', opacity: 0.3 }}>
              {searchQuery ? '🔍' : '💬'}
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.7, textAlign: 'center' }}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center' }}>
              {searchQuery ? 
                'Try a different search term or clear the search to see all conversations.' :
                'Start a new conversation with your care team members.'
              }
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 1, py: 0 }}>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={onConversationSelect}
                currentUserId={currentUserId}
                isMobile={isMobile}
              />
            ))}
          </List>
        )}
      </Box>

      {/* New Conversation FAB */}
      <Box
        sx={{
          position: 'relative',
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Fab
          size={isMobile ? 'medium' : 'small'}
          color="primary"
          onClick={onNewConversation}
          sx={{
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
          aria-label="Start new conversation"
        >
          <Add />
        </Fab>
      </Box>
    </Box>
  );
};

export default ConversationList;