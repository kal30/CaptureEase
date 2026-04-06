// Messages Page
// Main messaging interface for caregivers, therapists, and parents

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Fade,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Hooks and Services
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useChildContext } from '../contexts/ChildContext';
import { getConversations, getOrCreateChildCareTeamConversation } from '../services/messaging';
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user] = useAuthState(auth);
  const { selectedChild, childrenWithAccess } = useChildContext();
  const searchParams = new URLSearchParams(location.search);
  const searchChildId = searchParams.get('childId');
  const searchOpenChildChat = searchParams.get('openChildChat') === '1';
  const searchReturnToDashboard = searchParams.get('returnToDashboard') === '1';
  const openChildChat = Boolean(location.state?.openChildChat || searchOpenChildChat);
  const returnToDashboard = Boolean(location.state?.returnToDashboard || location.state?.selectedChildId || searchReturnToDashboard || searchChildId);

  // Get child context from navigation state or use selected child
  const contextChildId = location.state?.selectedChildId || searchChildId || selectedChild?.id;
  const contextChild = childrenWithAccess?.find(child => child.id === contextChildId);

  // State management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(location.state?.selectedConversationId || null);
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  // Mobile drawer state (for future mobile implementation)
  // const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState(openChildChat ? 'thread' : 'conversations'); // 'conversations' | 'thread'

  // Child-specific messaging state
  const [messagingMode, setMessagingMode] = useState(contextChildId ? 'child_specific' : 'all_contacts'); 
  // 'child_specific' = Show child's care team, 'all_contacts' = Show all approved team members
  const [availableContacts, setAvailableContacts] = useState([]);
  const [hasOpenedChildChat, setHasOpenedChildChat] = useState(false);
  const [openingChildChat, setOpeningChildChat] = useState(openChildChat && Boolean(contextChildId));

  const renderEmptyChildChatState = () => (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        gap: 2,
        px: 3,
        py: 8,
        textAlign: 'center',
      }}
    >
      <Box sx={{ fontSize: '4rem', opacity: 0.3 }}>💬</Box>
      <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 700 }}>
        No child chat yet
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 420 }}>
        This child chat opens when at least one other approved care team member is available.
        If no caregivers have been added yet, you’ll see an empty conversation area here.
      </Typography>
    </Box>
  );

  /**
   * Load conversations for current user
   */
  const loadConversations = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('📱 Loading conversations for user:', user.uid);

      const result = await getConversations(user.uid, {
        childId: contextChildId || selectedChild?.id || null,
        limit: 50
      });

      if (result.success) {
        const nextConversations = result.conversations || [];
        setConversations(nextConversations);

        if (selectedConversationId) {
          const match = nextConversations.find((conversation) => conversation.id === selectedConversationId);
          if (match) {
            setSelectedConversation(match);
            if (isMobile) {
              setMobileView('thread');
            }
          }
        }
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
  }, [user?.uid, contextChildId, selectedChild?.id, selectedConversationId, isMobile]);

  /**
   * Load available contacts based on messaging mode
   */
  const loadAvailableContacts = useCallback(async () => {
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
      
    } catch (error) {
      console.error('Error loading available contacts:', error);
      setAvailableContacts([]);
    }
  }, [user?.uid, childrenWithAccess, messagingMode, contextChildId]);

  useEffect(() => {
    if (contextChildId) {
      setMessagingMode('child_specific');
    }
  }, [contextChildId]);

  /**
   * Handle conversation selection
   */
  const handleConversationSelect = (conversation) => {
    console.log('💬 Selected conversation:', conversation.id);
    setSelectedConversation(conversation);
    
    // On mobile, switch to thread view
    if (isMobile) {
      setMobileView('thread');
      // setMobileDrawerOpen(false); // Commented out since mobile drawer is not implemented
    }
  };

  /**
   * Handle mobile back navigation
   */
  const handleMobileBack = () => {
    if (returnToDashboard && contextChildId) {
      navigate('/dashboard', { state: { selectedChildId: contextChildId } });
      return;
    }
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
  }, [loadConversations]);

  // Load available contacts when messaging mode or context changes
  useEffect(() => {
    loadAvailableContacts();
  }, [loadAvailableContacts]);

  useEffect(() => {
    if (!openChildChat || hasOpenedChildChat || !contextChildId || !user?.uid) {
      return;
    }

    const openChildConversation = async () => {
      try {
        setOpeningChildChat(true);
        const result = await getOrCreateChildCareTeamConversation({
          childId: contextChildId,
          childName: contextChild?.name,
          createdBy: user.uid,
        });

        if (result.success) {
          setSelectedConversationId(result.conversationId || null);
          const conversation = result.conversation || conversations.find((item) => item.id === result.conversationId) || null;
          if (conversation) {
            setSelectedConversation(conversation);
            if (isMobile) {
              setMobileView('thread');
            }
          }
        } else {
          console.error('Failed to open child conversation:', result.error);
        }
      } catch (error) {
        console.error('Failed to open child conversation:', error);
      } finally {
        setHasOpenedChildChat(true);
        setOpeningChildChat(false);
      }
    };

    openChildConversation();
  }, [
    openChildChat,
    hasOpenedChildChat,
    contextChildId,
    contextChild?.name,
    user?.uid,
    isMobile,
    conversations,
  ]);

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
        {openingChildChat && !selectedConversation ? (
          <Box
            sx={{
              minHeight: '55vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <CircularProgress size={36} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Opening child chat...
            </Typography>
          </Box>
        ) : mobileView === 'conversations' ? (
          // Mobile conversations view
          <Box>
            <ChildContextHeader
              contextChild={contextChild}
              messagingMode={messagingMode}
              onModeChange={handleModeChange}
              careTeamCount={messagingMode === 'child_specific' ? availableContacts.length : 0}
              allContactsCount={availableContacts.length}
              isMobile={true}
              onBack={handleMobileBack}
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
                  aria-label={returnToDashboard ? 'Back to child card' : 'Back to conversations'}
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
            
            {selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                currentUserId={user?.uid}
                onConversationUpdate={loadConversations}
                isMobile={true}
              />
            ) : (
              renderEmptyChildChatState()
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
          {openingChildChat && !selectedConversation ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                color: 'text.secondary',
              }}
            >
              <CircularProgress size={36} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Opening child chat...
              </Typography>
            </Box>
          ) : selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              currentUserId={user?.uid}
              onConversationUpdate={loadConversations}
              isMobile={false}
            />
          ) : openChildChat && hasOpenedChildChat ? (
            renderEmptyChildChatState()
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
