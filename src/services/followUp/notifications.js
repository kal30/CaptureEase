// Notification permission and display utilities

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

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

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
    if (serviceWorkerRegistration && actions.length > 0) {
      return showServiceWorkerNotification(title, body, icon, data, actions);
    } else {
      return showRegularNotification(title, body, icon, data);
    }
  }
  return null;
};

const showServiceWorkerNotification = async (title, body, icon, data, actions) => {
  try {
    await serviceWorkerRegistration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.incidentId || 'incident-followup',
      requireInteraction: true,
      data: data,
      actions: actions,
    });

    console.log(`📱 Service Worker notification sent: "${title}" with ${actions.length} actions`);
    return true;
  } catch (error) {
    console.error('Error showing service worker notification:', error);
    return showRegularNotification(title, body, icon, data);
  }
};

const showRegularNotification = (title, body, icon, data) => {
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.incidentId || 'incident-followup',
    requireInteraction: true,
    data: data,
  });

  notification.onclick = () => {
    window.focus();
    // Log notification click with available data
    console.log(`Follow-up notification clicked for incident ${data.incidentId || 'unknown'}, stage ${(data.followUpIndex || 0) + 1}`);
    notification.close();
  };

  setTimeout(() => {
    notification.close();
  }, 30000);

  return notification;
};

