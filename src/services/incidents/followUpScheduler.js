import { FOLLOW_UP_SCHEDULES } from '../../constants/incidents/followUpSchedules';

export const calculateFollowUpTimes = (incidentType, severity, remedy, customIncidentName = '') => {
  const schedule = FOLLOW_UP_SCHEDULES[incidentType] || FOLLOW_UP_SCHEDULES.other;
  const intervalMinutes = schedule.getSchedule(severity, remedy);
  const description = schedule.getDescription(severity);

  const now = new Date();
  const followUpTimes = intervalMinutes.map((minutes) => {
    const followUpTime = new Date(now.getTime() + minutes * 60000);
    return {
      timestamp: followUpTime,
      intervalMinutes: minutes,
      description: `Check on ${customIncidentName || description}`,
    };
  });

  return {
    times: followUpTimes,
    nextFollowUp: followUpTimes[0],
    totalFollowUps: followUpTimes.length,
  };
};

export const formatFollowUpSchedule = (incidentType, severity, remedy, customIncidentName = '') => {
  const { times } = calculateFollowUpTimes(incidentType, severity, remedy, customIncidentName);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}hr`;
    return `${Math.round(minutes / 1440)}day`;
  };

  return times.map((t) => formatTime(t.intervalMinutes)).join(', ');
};

