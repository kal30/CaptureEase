// Real Data Helpers for Messaging Service
// Functions to initialize real messaging with actual users and children

import { createConversation, getConversations, getConversationById, updateConversation } from './conversationService.js';
import { sendMessage, getMessages, markMessageAsRead, getUnreadMessages } from './messageService.js';
import { getAuth } from 'firebase/auth';

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

/**
 * Create a conversation with real care team members
 */
export const createCareTeamConversation = async (child, teamMemberEmails = []) => {
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('❌ No authenticated user found');
    return { success: false, error: 'User not authenticated' };
  }

  const participants = [currentUser.uid];
  
  // In a real app, you'd look up users by email and get their UIDs
  // For now, we'll use placeholder logic
  console.log('👥 Team member emails provided:', teamMemberEmails);
  
  const conversationData = {
    participants: participants,
    childId: child.id,
    type: participants.length > 2 ? 'group' : 'direct',
    title: `Care Team for ${child.name}`,
    createdBy: currentUser.uid
  };
  
  try {
    const result = await createConversation(conversationData);
    return result;
  } catch (error) {
    console.error('❌ Failed to create care team conversation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get conversations for current user
 */
export const getUserConversations = async (limit = 10) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('❌ No authenticated user found');
    return { success: false, error: 'User not authenticated' };
  }

  
  try {
    const result = await getConversations(currentUser.uid, { limit });
    return result;
  } catch (error) {
    console.error('❌ Get conversations failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a specific conversation by ID
 */
export const getConversationDetails = async (conversationId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  
  try {
    const result = await getConversationById(conversationId, currentUser.uid);
    return result;
  } catch (error) {
    console.error('❌ Get conversation by ID failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a real message to a conversation
 */
export const sendRealMessage = async (conversationId, messageText) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  console.log('📤 Sending message to:', conversationId);
  
  const messageData = {
    conversationId,
    senderId: currentUser.uid,
    senderName: currentUser.displayName || currentUser.email,
    text: messageText,
    type: 'text'
  };
  
  try {
    const result = await sendMessage(messageData);
    return result;
  } catch (error) {
    console.error('❌ Send message failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId, limit = 20) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  
  try {
    const result = await getMessages(conversationId, currentUser.uid, { limit });
    return result;
  } catch (error) {
    console.error('❌ Get messages failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark a message as read
 */
export const markMessageRead = async (messageId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  
  try {
    const result = await markMessageAsRead(messageId, currentUser.uid);
    return result;
  } catch (error) {
    console.error('❌ Mark message as read failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get unread messages for current user
 */
export const getUserUnreadMessages = async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  
  try {
    const result = await getUnreadMessages(currentUser.uid);
    return result;
  } catch (error) {
    console.error('❌ Get unread messages failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize messaging for a child with their care team
 */
export const initializeMessagingForChild = async (child) => {
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('❌ No authenticated user found');
    return { success: false, error: 'User not authenticated' };
  }

  try {
    
    // List all care team members
    const careTeam = [];
    if (child.users?.care_partners) {
      child.users.care_partners.forEach(partner => {
        careTeam.push({ ...partner, role: 'Care Partner' });
      });
    }
    if (child.users?.caregivers) {
      child.users.caregivers.forEach(caregiver => {
        careTeam.push({ ...caregiver, role: 'Caregiver' });
        console.log(`  - ${caregiver.name || caregiver.email} (Caregiver)`);
      });
    }
    if (child.users?.therapists) {
      child.users.therapists.forEach(therapist => {
        careTeam.push({ ...therapist, role: 'Therapist' });
        console.log(`  - ${therapist.name || therapist.email} (Therapist)`);
      });
    }

    if (careTeam.length === 0) {
      return {
        success: true,
        message: 'No care team members to create conversations with yet',
        conversations: []
      };
    }

    // Create a group conversation with all team members
    const participants = [currentUser.uid, ...careTeam.map(member => member.uid || member.id).filter(Boolean)];
    
    const conversationResult = await createCareTeamConversation(child, careTeam.map(m => m.email).filter(Boolean));
    
    if (conversationResult.success) {
      // Send welcome message
      const welcomeResult = await sendRealMessage(
        conversationResult.conversationId,
        `Welcome to the care team discussion for ${child.name}! 👋 Let's work together to support ${child.name}'s care and development.`
      );

      
      return {
        success: true,
        conversationId: conversationResult.conversationId,
        teamMembers: careTeam,
        welcomeMessageSent: welcomeResult.success
      };
    }

    return conversationResult;
  } catch (error) {
    console.error('💥 Initialize messaging failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Expose real messaging functions to global scope for browser console testing
 */
export const attachMessagingFunctionsToWindow = () => {
  if (typeof window !== 'undefined') {
    window.messaging = {
      // Core functions
      getCurrentUser,
      createCareTeamConversation,
      getUserConversations,
      getConversationDetails,
      sendRealMessage,
      getConversationMessages,
      markMessageRead,
      getUserUnreadMessages,
      
      // Main initialization
      initializeMessagingForChild,
      
      // Utility
      initializeMessagingWithCareTeam: initializeMessagingForChild // Alias for backward compatibility
    };
    
    console.log('Available functions:', Object.keys(window.messaging));
    console.log('');
    console.log('1. Get your children: const children = await getChildren()');  
    console.log('2. Initialize messaging: await window.messaging.initializeMessagingForChild(children[0])');
    console.log('3. Get conversations: await window.messaging.getUserConversations()');
    console.log('4. Send a message: await window.messaging.sendRealMessage(conversationId, "Hello!")');
  }
};

/**
 * Quick start helper - automatically initialize messaging for first child
 */
export const quickStartMessaging = async () => {
  console.log('⚡ Quick Start: Setting up messaging...');
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('❌ Please log in first');
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // Import child service to get children
    const { getChildren } = await import('../childService.js');
    const children = await getChildren();
    
    if (!children || children.length === 0) {
      return { success: false, error: 'No profiles found' };
    }

    
    // Initialize messaging for first child
    const result = await initializeMessagingForChild(children[0]);
    
    if (result.success) {
    }
    
    return result;
  } catch (error) {
    console.error('💥 Quick start failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-attach functions when file is loaded
if (typeof window !== 'undefined') {
  attachMessagingFunctionsToWindow();
  
  // Also attach quick start
  window.messaging.quickStart = quickStartMessaging;
  
  console.log('');
  console.log('💡 TIP: Run window.messaging.quickStart() to automatically set up messaging!');
}