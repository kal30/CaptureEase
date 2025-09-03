// Messages Page
// Main messaging interface for caregivers, therapists, and parents

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Fade,
  IconButton,
  Drawer
} from '@mui/material';
import { ArrowBack, Menu } from '@mui/icons-material';

// Hooks and Services
import { useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useChildContext } from '../contexts/ChildContext';
import { getConversations } from '../services/messaging';
import { getChildCareTeam, getAllApprovedTeamMembers } from '../services/childAccessService';

// Components
import ConversationList from '../components/Messaging/ConversationList';
import MessageThread from '../components/Messaging/MessageThread';
import NewConversationModal from '../components/Messaging/NewConversationModal';
import ChildContextHeader from '../components/Messaging/ChildContextHeader';

/**
 * Main messaging page with responsive layout
 * Desktop: Split view (conversations | messages)  
 * Mobile: Stack navigation
 */
const MessagesPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user] = useAuthState(auth);
  const { selectedChild, childrenWithAccess } = useChildContext();

  // Get child context from navigation state or use selected child
  const contextChildId = location.state?.selectedChildId || selectedChild?.id;
  const contextChild = childrenWithAccess?.find(child => child.id === contextChildId);

  // State management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState('conversations'); // 'conversations' | 'thread'

  // Child-specific messaging state
  const [messagingMode, setMessagingMode] = useState(contextChild ? 'child_specific' : 'all_contacts'); 
  // 'child_specific' = Show child's care team, 'all_contacts' = Show all approved team members
  const [availableContacts, setAvailableContacts] = useState([]);

  /**
   * Load conversations for current user
   */
  const loadConversations = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('📱 Loading conversations for user:', user.uid);

      const result = await getConversations(user.uid, {
        childId: selectedChild?.id || null,
        limit: 50
      });

      if (result.success) {
        setConversations(result.conversations || []);
        console.log(`✅ Loaded ${result.conversations?.length || 0} conversations`);
      } else {
        console.error('Failed to load conversations:', result.error);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available contacts based on messaging mode
   */
  const loadAvailableContacts = async () => {
    if (!user?.uid || !childrenWithAccess) return;

    try {
      let contacts = [];

      if (messagingMode === 'child_specific' && contextChildId) {
        // Load care team for specific child
        console.log(`👥 Loading care team for child: ${contextChildId}`);
        contacts = await getChildCareTeam(contextChildId);
      } else {
        // Load all approved team members across all children
        console.log('👥 Loading all approved team members');
        const userChildIds = childrenWithAccess.map(child => child.id);
        contacts = await getAllApprovedTeamMembers(userChildIds);
      }

      // Filter out current user
      const filteredContacts = contacts.filter(contact => contact.userId !== user.uid);
      setAvailableContacts(filteredContacts);
      
      console.log(`✅ Loaded ${filteredContacts.length} available contacts`);
    } catch (error) {
      console.error('Error loading available contacts:', error);
      setAvailableContacts([]);
    }
  };

  /**
   * Handle conversation selection
   */
  const handleConversationSelect = (conversation) => {
    console.log('💬 Selected conversation:', conversation.id);
    setSelectedConversation(conversation);
    
    // On mobile, switch to thread view
    if (isMobile) {
      setMobileView('thread');
      setMobileDrawerOpen(false);
    }
  };

  /**
   * Handle mobile back navigation
   */
  const handleMobileBack = () => {
    setMobileView('conversations');
    setSelectedConversation(null);
  };

  /**
   * Handle new conversation creation
   */
  const handleNewConversation = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowNewConversation(false);
    
    if (isMobile) {
      setMobileView('thread');
    }
  };

  /**
   * Handle messaging mode change
   */
  const handleModeChange = (newMode) => {
    console.log(`📋 Switching messaging mode: ${messagingMode} → ${newMode}`);
    setMessagingMode(newMode);
    // Clear current conversation selection when switching modes
    setSelectedConversation(null);
    if (isMobile) {
      setMobileView('conversations');
    }
  };

  // Load conversations on mount and when user/child changes
  useEffect(() => {
    loadConversations();
  }, [user?.uid, selectedChild?.id]);

  // Load available contacts when messaging mode or context changes
  useEffect(() => {
    loadAvailableContacts();
  }, [user?.uid, messagingMode, contextChildId, childrenWithAccess]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Fade in={true}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 3,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: 'primary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  fontSize: '2rem',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 0.7,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 1,
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                💬
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textAlign: 'center',
                fontFamily: '"Lancelot", serif',
              }}
            >
              Loading your messages...
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4, px: 1 }}>
        {mobileView === 'conversations' ? (
          // Mobile conversations view
          <Box>
            <ChildContextHeader
              contextChild={contextChild}
              messagingMode={messagingMode}
              onModeChange={handleModeChange}
              careTeamCount={messagingMode === 'child_specific' ? availableContacts.length : 0}
              allContactsCount={availableContacts.length}
              isMobile={true}
            />
            
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              onNewConversation={() => setShowNewConversation(true)}
              currentUserId={user?.uid}
              isMobile={true}
            />
          </Box>
        ) : (
          // Mobile thread view
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                px: 1
              }}
            >
              <IconButton 
                onClick={handleMobileBack}
                sx={{ mr: 1 }}
                aria-label="Back to conversations"
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  flex: 1,
                  truncate: true
                }}
              >
                {selectedConversation?.title || 'Conversation'}
              </Typography>
            </Box>
            
            {selectedConversation && (
              <MessageThread
                conversation={selectedConversation}
                currentUserId={user?.uid}
                onConversationUpdate={loadConversations}
                isMobile={true}
              />
            )}
          </Box>
        )}

        {/* New Conversation Modal */}
        <NewConversationModal
          open={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={handleNewConversation}
          currentUserId={user?.uid}
          selectedChildId={contextChildId}
          contextChild={contextChild}
          availableContacts={availableContacts}
          messagingMode={messagingMode}
        />
      </Container>
    );
  }

  // Desktop layout
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <ChildContextHeader
        contextChild={contextChild}
        messagingMode={messagingMode}
        onModeChange={handleModeChange}
        careTeamCount={messagingMode === 'child_specific' ? availableContacts.length : 0}
        allContactsCount={availableContacts.length}
        isMobile={false}
      />

      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          height: '75vh',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Left Panel: Conversations */}
        <Box
          sx={{
            width: 380,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            onNewConversation={() => setShowNewConversation(true)}
            currentUserId={user?.uid}
            isMobile={false}
          />
        </Box>

        {/* Right Panel: Message Thread */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              currentUserId={user?.uid}
              onConversationUpdate={loadConversations}
              isMobile={false}
            />
          ) : (
            // Empty state
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                gap: 2
              }}
            >
              <Box sx={{ fontSize: '4rem', opacity: 0.3 }}>💬</Box>
              <Typography variant="h6" sx={{ opacity: 0.7 }}>
                Select a conversation to start messaging
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', maxWidth: 300 }}>
                Choose from your existing conversations or create a new one to communicate with your care team.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* New Conversation Modal */}
      <NewConversationModal
        open={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onConversationCreated={handleNewConversation}
        currentUserId={user?.uid}
        selectedChildId={contextChildId}
        contextChild={contextChild}
        availableContacts={availableContacts}
        messagingMode={messagingMode}
      />
    </Container>
  );
};

export default MessagesPage;