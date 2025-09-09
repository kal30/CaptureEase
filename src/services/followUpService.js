// Firestore imports no longer needed here after extraction
// Extracted modules (behavior preserved)
import {
  registerServiceWorker,
  requestNotificationPermission,
  showNotification,
} from './followUp/notifications';
import {
  scheduleFollowUpNotification,
  scheduleAllFollowUpNotifications,
  cancelFollowUpNotifications,
} from './followUp/scheduler';
import { listenForFollowUps, checkOverdueFollowUps } from './followUp/listeners';

// listenForFollowUps and checkOverdueFollowUps are now imported

// Notifications and scheduler are now imported from dedicated modules above

// Process quick responses from Service Worker
export const processQuickResponses = async () => {
  try {
    const responses = getStoredQuickResponses();
    const unprocessedResponses = Object.entries(responses).filter(([_, response]) => !response.processed);
    
    if (unprocessedResponses.length === 0) {
      return [];
    }
    
    console.log(`🔄 Processing ${unprocessedResponses.length} quick responses...`);
    
    const processedResponses = [];
    
    for (const [responseId, response] of unprocessedResponses) {
      try {
        // Import here to avoid circular dependency
        const { recordFollowUpResponse } = await import('./incidentService');
        
        // Map quick response values to effectiveness values
        // Use the response effectiveness value directly (already in correct format)
        const effectiveness = response.effectiveness;
        
        // Record the follow-up response
        const result = await recordFollowUpResponse(
          response.incidentId,
          effectiveness,
          'Quick response from notification',
          response.followUpIndex
        );
        
        // Mark as processed
        responses[responseId].processed = true;
        processedResponses.push({
          responseId,
          incidentId: response.incidentId,
          effectiveness: response.effectiveness,
          result
        });
        
        
      } catch (error) {
        console.error(`❌ Error processing quick response ${responseId}:`, error);
        // Mark as processed even if failed to avoid retry loops
        responses[responseId].processed = true;
      }
    }
    
    // Save updated responses
    localStorage.setItem('captureease-quick-responses', JSON.stringify(responses));
    
    return processedResponses;
  } catch (error) {
    console.error('Error processing quick responses:', error);
    return [];
  }
};

// Get stored quick responses
const getStoredQuickResponses = () => {
  try {
    const stored = localStorage.getItem('captureease-quick-responses');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting stored quick responses:', error);
    return {};
  }
};

// Clear processed quick responses (cleanup)
export const clearProcessedQuickResponses = () => {
  try {
    const responses = getStoredQuickResponses();
    const unprocessed = {};
    
    Object.entries(responses).forEach(([responseId, response]) => {
      if (!response.processed) {
        unprocessed[responseId] = response;
      }
    });
    
    localStorage.setItem('captureease-quick-responses', JSON.stringify(unprocessed));
  } catch (error) {
    console.error('Error clearing processed quick responses:', error);
  }
};

// Start listening for quick responses from the Service Worker and record them immediately
export const startQuickResponseListener = () => {
  if (!('serviceWorker' in navigator)) return;
  // Avoid registering multiple times
  if (window.__captureeaseQuickResponseListenerRegistered) return;
  window.__captureeaseQuickResponseListenerRegistered = true;

  navigator.serviceWorker.addEventListener('message', async (event) => {
    try {
      const { data } = event;
      if (!data || data.type !== 'FOLLOWUP_QUICK_RESPONSE') return;
      const { incidentId, effectiveness, followUpIndex } = data.payload || {};
      if (!incidentId || !effectiveness) return;

      // Lazy import to avoid circular deps at module load
      const { recordFollowUpResponse } = await import('./incidentService');
      await recordFollowUpResponse(
        incidentId,
        effectiveness,
        'Quick response from notification',
        followUpIndex || 0
      );
    } catch (err) {
      console.error('Error handling SW quick response message:', err);
    }
  });
};

// Test notification system with action buttons
export const testNotification = async () => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    const actions = [
      { action: 'resolved', title: '😊 Resolved', icon: '/favicon.ico' },
      { action: 'improved', title: '😐 Improved', icon: '/favicon.ico' },
      { action: 'no_change', title: '😞 No Change', icon: '/favicon.ico' }
    ];
    
    showNotification(
      'Test Follow-up', 
      'This is a test with quick response buttons!', 
      '🧪',
      { incidentId: 'test-123', followUpIndex: 0 },
      actions
    );
    return true;
  } else {
    console.log('❌ Cannot test notification - permission not granted');
    console.log('Current permission status:', Notification.permission);
    return false;
  }
};

// Manual permission request function (for testing/debugging)
export const requestPermissionManually = async () => {
  console.log('🔔 Manually requesting notification permission...');
  console.log('Current permission status:', Notification.permission);
  
  const hasPermission = await requestNotificationPermission();
  
  console.log('New permission status:', Notification.permission);
  console.log('Permission granted:', hasPermission);
  
  return hasPermission;
};

// Initialize notifications for existing pending follow-ups
export const initializeNotificationsForPendingFollowUps = async (childrenData) => {
  try {
    // Check current permission status
    console.log('🔔 Current notification permission:', Notification.permission);
    
    // Request permission first - but only if not already denied
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Notification permission not granted. Current status:', Notification.permission);
      console.log('💡 To enable notifications: Click the notification icon in your browser address bar');
      return;
    }

    console.log('🔔 Initializing notifications for pending follow-ups...');
    
    // Get all children IDs
    const childrenIds = childrenData.map(child => child.id);
    
    // Check for pending follow-ups
    const pendingFollowUps = await checkOverdueFollowUps(childrenIds);
    
    // Also check for future follow-ups that need scheduling
    for (const child of childrenData) {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        
        // Get incidents with scheduled follow-ups that aren't completed
        const q = query(
          collection(db, 'incidents'),
          where('childId', '==', child.id),
          where('followUpScheduled', '==', true),
          where('followUpCompleted', '==', false)
        );

        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const incident = { id: doc.id, ...doc.data() };
          
          // Schedule notifications for future follow-ups
          if (incident.followUpTimes && incident.followUpTimes.length > 0) {
            const currentIndex = incident.nextFollowUpIndex || 0;
            
            // Schedule remaining follow-ups
            for (let i = currentIndex; i < incident.followUpTimes.length; i++) {
              const followUpTime = incident.followUpTimes[i].timestamp?.toDate?.() || 
                                 new Date(incident.followUpTimes[i].timestamp);
              const now = new Date();
              
              // Only schedule future notifications
              if (followUpTime > now) {
                scheduleFollowUpNotification(incident, child.name, i);
              }
            }
          }
        });
      } catch (error) {
        console.error(`Error initializing notifications for child ${child.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error initializing follow-up notifications:', error);
  }
};

// Re-export extracted APIs to preserve public surface
export {
  registerServiceWorker,
  requestNotificationPermission,
  showNotification,
  scheduleFollowUpNotification,
  scheduleAllFollowUpNotifications,
  cancelFollowUpNotifications,
  listenForFollowUps,
  checkOverdueFollowUps,
};
