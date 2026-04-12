import { showNotification } from './notifications';

// Store for active notification timers
const activeNotificationTimers = new Map();

// Helper to get incident type label
const getIncidentTypeLabel = (incidentType) => {
  const typeMap = {
    pain_medical: 'pain',
    eating_nutrition: 'eating issue',
    mood: 'mood episode',
    behavioral: 'behavior',
    sensory: 'sensory issue',
    sleep: 'sleep difficulty',
    other: 'incident',
  };
  return typeMap[incidentType] || 'incident';
};

export const scheduleFollowUpNotification = (incident, childName, followUpIndex = 0) => {
  if (!incident.followUpTimes || followUpIndex >= incident.followUpTimes.length) {
    return null;
  }

  const followUpTime = incident.followUpTimes[followUpIndex].timestamp;
  const now = new Date();
  const delay = followUpTime - now;

  if (delay <= 0) {
    console.log('Follow-up time has already passed, skipping notification');
    return null;
  }

  const timerKey = `${incident.id}-${followUpIndex}`;
  if (activeNotificationTimers.has(timerKey)) {
    clearTimeout(activeNotificationTimers.get(timerKey));
  }

  const timerId = setTimeout(() => {
    const title = `Follow-up for ${childName}`;
    const body = `How effective was the ${incident.remedy} for ${
      incident.customIncidentName || getIncidentTypeLabel(incident.type)
    }?`;

    const actions = [
      { action: 'resolved', title: '😊 Resolved', icon: '/lifelog-icon-192.png' },
      { action: 'improved', title: '😐 Improved', icon: '/lifelog-icon-192.png' },
      { action: 'no_change', title: '😞 No Change', icon: '/lifelog-icon-192.png' },
    ];

    showNotification(
      title,
      body,
      '⏰',
      {
        incidentId: incident.id,
        childName,
        followUpIndex,
      },
      actions
    );

    activeNotificationTimers.delete(timerKey);
  }, delay);

  activeNotificationTimers.set(timerKey, timerId);

  console.log(
    `📅 Follow-up notification scheduled for ${childName} in ${Math.round(delay / 60000)} minutes`
  );
  return timerId;
};

export const scheduleAllFollowUpNotifications = (incident, childName) => {
  if (!incident.followUpTimes || !incident.followUpScheduled) {
    return [];
  }

  const timerIds = [];
  incident.followUpTimes.forEach((_, index) => {
    const timerId = scheduleFollowUpNotification(incident, childName, index);
    if (timerId) timerIds.push(timerId);
  });
  return timerIds;
};

export const cancelFollowUpNotifications = (incidentId) => {
  const timersToCancel = [];
  for (const [timerKey, timerId] of activeNotificationTimers.entries()) {
    if (timerKey.startsWith(incidentId + '-')) {
      clearTimeout(timerId);
      timersToCancel.push(timerKey);
    }
  }
  timersToCancel.forEach((timerKey) => activeNotificationTimers.delete(timerKey));
  console.log(
    `🚫 Cancelled ${timersToCancel.length} follow-up notifications for incident ${incidentId}`
  );
};
