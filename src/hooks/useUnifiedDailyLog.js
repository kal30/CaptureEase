import { useMemo } from 'react';
import { getIncidentTypeConfig, getSeverityScale } from '../services/incidentService';

/**
 * Enhanced hook for creating a unified daily log view
 * Combines timeline entries with incident data for comprehensive daily overview
 * 
 * @param {Array} timelineEntries - Entries from timelineService
 * @param {Array} incidents - Incidents from incidentService  
 * @param {Date} selectedDate - Date to filter entries for
 * @returns {Object} Unified daily log data with chronological entries
 */
export const useUnifiedDailyLog = (timelineEntries = [], incidents = [], selectedDate = new Date()) => {
  
  const dailyLogData = useMemo(() => {
    // Get start and end of selected date
    const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Filter timeline entries for selected date
    const dayTimelineEntries = timelineEntries.filter(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return entryDate >= dayStart && entryDate < dayEnd;
    });
    
    // Filter incidents for selected date
    const dayIncidents = incidents.filter(incident => {
      const incidentDate = incident.timestamp?.toDate?.() || new Date(incident.timestamp);
      return incidentDate >= dayStart && incidentDate < dayEnd;
    });
    
    // Convert incidents to unified format
    const normalizedIncidents = dayIncidents.map(incident => {
      const incidentType = getIncidentTypeConfig(incident.type);
      const severityScale = getSeverityScale(incident.type);
      const severityInfo = severityScale[incident.severity] || { label: 'Unknown', color: '#666' };
      
      // Create detailed summary for incident
      const summary = createIncidentSummary(incident, incidentType, severityInfo);
      
      return {
        id: `incident-${incident.id}`,
        type: 'incident',
        title: incident.customIncidentName || incidentType.label,
        content: summary.shortDescription,
        timestamp: incident.timestamp,
        icon: incidentType.emoji,
        color: incidentType.color,
        // Enhanced incident-specific data
        entryType: 'incident',
        incidentData: {
          severity: incident.severity,
          severityInfo,
          remedy: incident.remedy,
          customRemedy: incident.customRemedy,
          notes: incident.notes,
          effectiveness: incident.effectiveness,
          followUpScheduled: incident.followUpScheduled,
          followUpCompleted: incident.followUpCompleted,
          followUpResponses: incident.followUpResponses || [],
          hasMedia: false, // TODO: Add media support to incidents
          fullDescription: summary.fullDescription
        },
        originalData: incident
      };
    });
    
    // Combine all entries
    const allEntries = [
      ...dayTimelineEntries.map(entry => ({
        ...entry,
        entryType: entry.type, // Keep original type (daily_note, mood_log, etc.)
        isTimelineEntry: true
      })),
      ...normalizedIncidents
    ];
    
    // Sort chronologically (most recent first for daily view)
    const sortedEntries = allEntries.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return bTime - aTime;
    });
    
    // Group entries by hour for better organization
    const groupedByHour = groupEntriesByTimeOfDay(sortedEntries);
    
    // Calculate summary stats
    const stats = calculateDayStats(sortedEntries, dayIncidents, dayTimelineEntries);
    
    return {
      selectedDate,
      entries: sortedEntries,
      groupedByHour,
      stats,
      hasEntries: sortedEntries.length > 0,
      incidentCount: dayIncidents.length,
      entryCount: dayTimelineEntries.length,
      totalCount: sortedEntries.length
    };
  }, [timelineEntries, incidents, selectedDate]);
  
  /**
   * Get entries for a specific time period
   */
  const getEntriesForPeriod = (startHour, endHour) => {
    return dailyLogData.entries.filter(entry => {
      const entryTime = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      const hour = entryTime.getHours();
      return hour >= startHour && hour < endHour;
    });
  };
  
  /**
   * Format time in 12-hour format
   */
  const formatTime = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const entryTime = timestamp?.toDate?.() || new Date(timestamp);
    const diffMs = now - entryTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };
  
  /**
   * Get icon and color for entry type
   */
  const getEntryTypeInfo = (entry) => {
    if (entry.entryType === 'incident') {
      return {
        icon: entry.icon,
        color: entry.color,
        label: 'Incident'
      };
    }
    
    // For timeline entries, use existing type config
    return {
      icon: entry.icon,
      color: entry.color,
      label: entry.label || entry.type
    };
  };
  
  return {
    ...dailyLogData,
    getEntriesForPeriod,
    formatTime,
    formatRelativeTime,
    getEntryTypeInfo
  };
};

/**
 * Create comprehensive incident summary
 */
const createIncidentSummary = (incident, incidentType, severityInfo) => {
  const customName = incident.customIncidentName;
  const typeName = customName || incidentType.label;
  
  // Short description for list view
  const shortDescription = `${typeName} - ${severityInfo.label}${incident.remedy ? ' (remedy applied)' : ''}`;
  
  // Full description for expanded view
  let fullDescription = `**${typeName}** incident with severity level ${incident.severity}/10 (${severityInfo.label})`;
  
  if (incident.remedy) {
    fullDescription += `\n\n**Remedy Applied:** ${incident.remedy}`;
    if (incident.customRemedy) {
      fullDescription += ` - ${incident.customRemedy}`;
    }
  }
  
  if (incident.notes) {
    fullDescription += `\n\n**Notes:** ${incident.notes}`;
  }
  
  // Add follow-up information
  if (incident.followUpScheduled) {
    if (incident.followUpCompleted) {
      const responses = incident.followUpResponses || [];
      if (responses.length > 0) {
        fullDescription += `\n\n**Follow-up Completed:** ${responses.length} response(s)`;
        const latestResponse = responses[responses.length - 1];
        if (latestResponse?.effectiveness) {
          fullDescription += ` - Final effectiveness: ${latestResponse.effectiveness}`;
        }
      }
    } else {
      fullDescription += `\n\n**Follow-up Scheduled:** Pending response`;
    }
  }
  
  return {
    shortDescription,
    fullDescription
  };
};

/**
 * Group entries by time of day periods
 */
const groupEntriesByTimeOfDay = (entries) => {
  const periods = {
    morning: { label: 'Morning (6 AM - 12 PM)', entries: [] },
    afternoon: { label: 'Afternoon (12 PM - 6 PM)', entries: [] },
    evening: { label: 'Evening (6 PM - 10 PM)', entries: [] },
    night: { label: 'Night (10 PM - 6 AM)', entries: [] }
  };
  
  entries.forEach(entry => {
    const entryTime = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
    const hour = entryTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      periods.morning.entries.push(entry);
    } else if (hour >= 12 && hour < 18) {
      periods.afternoon.entries.push(entry);
    } else if (hour >= 18 && hour < 22) {
      periods.evening.entries.push(entry);
    } else {
      periods.night.entries.push(entry);
    }
  });
  
  // Only return periods that have entries
  return Object.fromEntries(
    Object.entries(periods).filter(([key, period]) => period.entries.length > 0)
  );
};

/**
 * Calculate summary statistics for the day
 */
const calculateDayStats = (allEntries, incidents, timelineEntries) => {
  const stats = {
    totalEntries: allEntries.length,
    incidentCount: incidents.length,
    journalEntries: timelineEntries.filter(entry => entry.type === 'daily_note').length,
    medicalEntries: timelineEntries.filter(entry => ['medical_event', 'medication_log'].includes(entry.type)).length,
    behaviorEntries: allEntries.filter(entry => 
      entry.type === 'behavior' || 
      (entry.entryType === 'incident' && ['behavioral', 'sensory', 'mood'].includes(entry.originalData?.type))
    ).length,
    
    // Incident severity breakdown
    severityBreakdown: {},
    highSeverityCount: 0,
    
    // Follow-up status
    pendingFollowUps: 0,
    completedFollowUps: 0,
    
    // Most active time period
    busiestPeriod: null
  };
  
  // Calculate incident statistics
  incidents.forEach(incident => {
    const severity = incident.severity;
    stats.severityBreakdown[severity] = (stats.severityBreakdown[severity] || 0) + 1;
    
    if (severity >= 7) {
      stats.highSeverityCount++;
    }
    
    if (incident.followUpScheduled) {
      if (incident.followUpCompleted) {
        stats.completedFollowUps++;
      } else {
        stats.pendingFollowUps++;
      }
    }
  });
  
  // Find busiest time period
  const periodCounts = {
    morning: allEntries.filter(entry => {
      const hour = (entry.timestamp?.toDate?.() || new Date(entry.timestamp)).getHours();
      return hour >= 6 && hour < 12;
    }).length,
    afternoon: allEntries.filter(entry => {
      const hour = (entry.timestamp?.toDate?.() || new Date(entry.timestamp)).getHours();
      return hour >= 12 && hour < 18;
    }).length,
    evening: allEntries.filter(entry => {
      const hour = (entry.timestamp?.toDate?.() || new Date(entry.timestamp)).getHours();
      return hour >= 18 && hour < 22;
    }).length,
    night: allEntries.filter(entry => {
      const hour = (entry.timestamp?.toDate?.() || new Date(entry.timestamp)).getHours();
      return hour >= 22 || hour < 6;
    }).length
  };
  
  stats.busiestPeriod = Object.entries(periodCounts).reduce((max, [period, count]) => 
    count > max.count ? { period, count } : max, 
    { period: null, count: 0 }
  );
  
  return stats;
};

export default useUnifiedDailyLog;
