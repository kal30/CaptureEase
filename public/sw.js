// Service Worker for CaptureEase Follow-up Notifications
const CACHE_NAME = 'captureease-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    clients.claim()
  );
});

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();

  if (action === 'effective' || action === 'somewhat' || action === 'not-effective') {
    // Handle quick response actions
    console.log(`Quick response: ${action} for incident ${data.incidentId}`);
    
    // Store the response to be handled when app opens
    storeQuickResponse(data.incidentId, action, data.followUpIndex || 0);
    
    // Show confirmation notification
    self.registration.showNotification('Response Recorded! 🎉', {
      body: `Your feedback has been saved. Open CaptureEase to see details.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `response-${data.incidentId}`,
      requireInteraction: false,
      actions: [] // No actions on confirmation
    });
    
    // Auto-close confirmation after 3 seconds
    setTimeout(() => {
      self.registration.getNotifications({ tag: `response-${data.incidentId}` })
        .then(notifications => {
          notifications.forEach(notif => notif.close());
        });
    }, 3000);
    
  } else {
    // Default click behavior - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          const url = data.incidentId 
            ? `${self.location.origin}/?followup=${data.incidentId}&index=${data.followUpIndex || 0}`
            : self.location.origin;
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Store quick response for when app opens
function storeQuickResponse(incidentId, effectiveness, followUpIndex) {
  const responses = getStoredResponses();
  const responseId = `${incidentId}-${followUpIndex}-${Date.now()}`;
  
  responses[responseId] = {
    incidentId,
    effectiveness,
    followUpIndex,
    timestamp: new Date().toISOString(),
    processed: false
  };
  
  localStorage.setItem('captureease-quick-responses', JSON.stringify(responses));
  console.log('Stored quick response:', responseId, responses[responseId]);
}

// Get stored responses
function getStoredResponses() {
  try {
    const stored = localStorage.getItem('captureease-quick-responses');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting stored responses:', error);
    return {};
  }
}

// Handle push events (for future FCM integration)
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data || {},
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || true,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});