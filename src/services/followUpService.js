import { onSnapshot, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Store for active follow-up listeners
const activeListeners = new Map();

// Check for incidents that need follow-up
export const listenForFollowUps = (childrenIds, onFollowUpNeeded) => {
  // Clean up any existing listeners
  cleanupAllListeners();

  childrenIds.forEach(childId => {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('followUpScheduled', '==', true),
      where('followUpCompleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const incident = { id: doc.id, ...doc.data() };
        
        // Check if follow-up time has passed
        const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
        const now = new Date();
        
        if (now >= followUpTime) {
          // Enhanced incident object with follow-up context
          const enhancedIncident = {
            ...incident,
            currentFollowUpIndex: incident.nextFollowUpIndex || 0,
            totalFollowUps: incident.followUpTimes?.length || 1,
            isMultiStage: (incident.followUpTimes?.length || 0) > 1,
            followUpDescription: incident.followUpDescription || `Check on ${incident.customIncidentName || 'incident'}`
          };
          onFollowUpNeeded(enhancedIncident);
        }
      });
    }, (error) => {
      console.error('Error listening for follow-ups:', error);
    });

    activeListeners.set(childId, unsubscribe);
  });

  // Return cleanup function
  return () => cleanupAllListeners();
};

// Manual check for overdue follow-ups
export const checkOverdueFollowUps = async (childrenIds) => {
  const overdueIncidents = [];
  
  for (const childId of childrenIds) {
    try {
      const q = query(
        collection(db, 'incidents'),
        where('childId', '==', childId),
        where('followUpScheduled', '==', true),
        where('followUpCompleted', '==', false)
      );

      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const incident = { id: doc.id, ...doc.data() };
        const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
        const now = new Date();
        
        if (now >= followUpTime) {
          // Enhanced incident object with follow-up context
          const enhancedIncident = {
            ...incident,
            currentFollowUpIndex: incident.nextFollowUpIndex || 0,
            totalFollowUps: incident.followUpTimes?.length || 1,
            isMultiStage: (incident.followUpTimes?.length || 0) > 1,
            followUpDescription: incident.followUpDescription || `Check on ${incident.customIncidentName || 'incident'}`
          };
          overdueIncidents.push(enhancedIncident);
        }
      });
    } catch (error) {
      console.error(`Error checking follow-ups for child ${childId}:`, error);
    }
  }
  
  return overdueIncidents;
};

// Clean up all listeners
const cleanupAllListeners = () => {
  activeListeners.forEach((unsubscribe, childId) => {
    try {
      unsubscribe();
    } catch (error) {
      console.error(`Error cleaning up listener for child ${childId}:`, error);
    }
  });
  activeListeners.clear();
};

// Service Worker registration for notification actions
let serviceWorkerRegistration = null;

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      serviceWorkerRegistration = registration;
      console.log('Service Worker registered successfully:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Browser notification support with service worker
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  // Register service worker first
  if (!serviceWorkerRegistration) {
    await registerServiceWorker();
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, body, icon = '🚨', data = {}, actions = []) => {
  if (Notification.permission === 'granted') {
    // Use Service Worker for notifications with actions, fallback to regular notifications
    if (serviceWorkerRegistration && actions.length > 0) {
      return showServiceWorkerNotification(title, body, icon, data, actions);
    } else {
      return showRegularNotification(title, body, icon, data);
    }
  }
  return null;
};

// Service Worker notification with action buttons
const showServiceWorkerNotification = async (title, body, icon, data, actions) => {
  try {
    await serviceWorkerRegistration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.incidentId || 'incident-followup',
      requireInteraction: true,
      data: data,
      actions: actions
    });
    
    console.log(`📱 Service Worker notification sent: "${title}" with ${actions.length} actions`);
    return true;
  } catch (error) {
    console.error('Error showing service worker notification:', error);
    // Fallback to regular notification
    return showRegularNotification(title, body, icon, data);
  }
};

// Regular notification (fallback)
const showRegularNotification = (title, body, icon, data) => {
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.incidentId || 'incident-followup',
    requireInteraction: true,
    data: data,
  });

  // Handle notification click
  notification.onclick = () => {
    window.focus();
    if (data.onClick) {
      data.onClick();
    }
    notification.close();
  };

  // Auto close after 30 seconds
  setTimeout(() => {
    notification.close();
  }, 30000);

  return notification;
};

// Store for active notification timers
const activeNotificationTimers = new Map();

// Schedule a single follow-up notification
export const scheduleFollowUpNotification = (incident, childName, followUpIndex = 0) => {
  if (!incident.followUpTimes || followUpIndex >= incident.followUpTimes.length) {
    return null;
  }

  const followUpTime = incident.followUpTimes[followUpIndex].timestamp;
  const now = new Date();
  const delay = followUpTime - now;

  // Don't schedule if time has already passed
  if (delay <= 0) {
    console.log('Follow-up time has already passed, skipping notification');
    return null;
  }

  // Clear any existing timer for this incident/index
  const timerKey = `${incident.id}-${followUpIndex}`;
  if (activeNotificationTimers.has(timerKey)) {
    clearTimeout(activeNotificationTimers.get(timerKey));
  }

  // Schedule the notification
  const timerId = setTimeout(() => {
    const title = `Follow-up for ${childName}`;
    const body = `How effective was the ${incident.remedy} for ${incident.customIncidentName || getIncidentTypeLabel(incident.type)}?`;
    
    // Define quick response actions
    const actions = [
      {
        action: 'effective',
        title: '😊 Worked Great',
        icon: '/favicon.ico'
      },
      {
        action: 'somewhat', 
        title: '😐 Somewhat',
        icon: '/favicon.ico'
      },
      {
        action: 'not-effective',
        title: '😞 Didn\'t Help',
        icon: '/favicon.ico'
      }
    ];
    
    showNotification(title, body, '⏰', {
      incidentId: incident.id,
      childName,
      followUpIndex,
      onClick: () => {
        console.log(`Opening follow-up for incident ${incident.id}, stage ${followUpIndex + 1}`);
      }
    }, actions);

    // Remove timer from active list
    activeNotificationTimers.delete(timerKey);
  }, delay);

  // Store timer reference
  activeNotificationTimers.set(timerKey, timerId);

  console.log(`📅 Follow-up notification scheduled for ${childName} in ${Math.round(delay / 60000)} minutes`);
  return timerId;
};

// Schedule all follow-up notifications for an incident
export const scheduleAllFollowUpNotifications = (incident, childName) => {
  if (!incident.followUpTimes || !incident.followUpScheduled) {
    return [];
  }

  const timerIds = [];
  incident.followUpTimes.forEach((_, index) => {
    const timerId = scheduleFollowUpNotification(incident, childName, index);
    if (timerId) {
      timerIds.push(timerId);
    }
  });

  return timerIds;
};

// Cancel all scheduled notifications for an incident
export const cancelFollowUpNotifications = (incidentId) => {
  const timersToCancel = [];
  
  // Find all timers for this incident
  for (const [timerKey, timerId] of activeNotificationTimers.entries()) {
    if (timerKey.startsWith(incidentId + '-')) {
      clearTimeout(timerId);
      timersToCancel.push(timerKey);
    }
  }
  
  // Remove from active timers
  timersToCancel.forEach(timerKey => {
    activeNotificationTimers.delete(timerKey);
  });
  
  console.log(`🚫 Cancelled ${timersToCancel.length} follow-up notifications for incident ${incidentId}`);
};

// Helper to get incident type label
const getIncidentTypeLabel = (incidentType) => {
  const typeMap = {
    'pain_medical': 'pain',
    'eating_nutrition': 'eating issue',
    'mood': 'mood episode',
    'behavioral': 'behavior',
    'sensory': 'sensory issue',
    'sleep': 'sleep difficulty',
    'other': 'incident'
  };
  return typeMap[incidentType] || 'incident';
};

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
        const effectivenessMap = {
          'effective': 'completely',
          'somewhat': 'somewhat', 
          'not-effective': 'not_effective'
        };
        
        const effectiveness = effectivenessMap[response.effectiveness] || response.effectiveness;
        
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
        
        console.log(`✅ Processed quick response: ${response.effectiveness} for incident ${response.incidentId}`);
        
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
    console.log('🧹 Cleared processed quick responses');
  } catch (error) {
    console.error('Error clearing processed quick responses:', error);
  }
};

// Test notification system with action buttons
export const testNotification = async () => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    const actions = [
      { action: 'effective', title: '😊 Great!', icon: '/favicon.ico' },
      { action: 'somewhat', title: '😐 OK', icon: '/favicon.ico' },
      { action: 'not-effective', title: '😞 No', icon: '/favicon.ico' }
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
    
    console.log(`✅ Notification initialization complete. Found ${pendingFollowUps.length} overdue follow-ups.`);
  } catch (error) {
    console.error('Error initializing follow-up notifications:', error);
  }
};