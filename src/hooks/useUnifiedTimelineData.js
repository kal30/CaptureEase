import { useState, useEffect, useMemo } from 'react';
import { getTimelineData } from '../services/timeline';

/**
 * useUnifiedTimelineData - Hook to fetch and combine all timeline data for a specific day
 * Combines incidents, journal entries, daily logs, and follow-ups
 * 
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @param {Object} filters - Active filters (entryTypes, userRoles, etc.)
 * @returns {Object} - { entries, loading, error, summary }
 */
export const useUnifiedTimelineData = (childId, selectedDate, filters = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawEntries, setRawEntries] = useState({
    incidents: [],
    journals: [],
    dailyLogs: [],
    dailyHabits: []
  });

  // Fetch all data when childId or selectedDate changes
  useEffect(() => {
    console.log('useUnifiedTimelineData called with:', { childId, selectedDate: selectedDate?.toDateString(), filters });
    
    if (!childId || !selectedDate) {
      console.log('Missing childId or selectedDate, stopping fetch');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the new refactored timeline service
        const timelineData = await getTimelineData(childId, selectedDate);

        setRawEntries({
          incidents: timelineData.incidents || [],
          journals: timelineData.journalEntries || [],
          dailyLogs: timelineData.dailyLogEntries || [],
          dailyHabits: timelineData.dailyHabits || []
        });
        
      } catch (err) {
        console.error('Error fetching unified timeline data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [childId, selectedDate, filters]);

  // Process and filter entries
  const processedData = useMemo(() => {
    // Filter raw entries to ensure they belong to the current child
    const childFilteredEntries = {
      incidents: rawEntries.incidents.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      journals: rawEntries.journals.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      dailyLogs: rawEntries.dailyLogs.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      dailyHabits: rawEntries.dailyHabits.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      )
    };

    console.log('Child-filtered entries:', {
      incidents: childFilteredEntries.incidents.length,
      journals: childFilteredEntries.journals.length,
      dailyLogs: childFilteredEntries.dailyLogs.length,
      dailyHabits: childFilteredEntries.dailyHabits.length
    });
    

    // Transform raw data into unified entry format
    const transformedEntries = [
      // Transform incidents
      ...childFilteredEntries.incidents.map(incident => ({
        id: incident.id,
        type: 'incident',
        timestamp: incident.timestamp,
        incidentType: incident.type,
        severity: incident.severity,
        description: incident.description,
        summary: incident.summary,
        triggers: incident.triggers,
        duration: incident.duration,
        interventions: incident.interventions,
        mediaAttachments: incident.mediaAttachments,
        loggedByUser: incident.loggedBy?.name,
        userRole: incident.loggedBy?.role,
        userId: incident.loggedBy?.id
      })),
      
      // Transform journal entries
      ...childFilteredEntries.journals.map(journal => ({
        id: journal.id,
        type: 'journal',
        timestamp: journal.timestamp,
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
        tags: journal.tags,
        loggedByUser: journal.loggedBy?.name,
        userRole: journal.loggedBy?.role,
        userId: journal.loggedBy?.id
      })),
      
      // Transform daily logs
      ...childFilteredEntries.dailyLogs.map(log => ({
        id: log.id,
        type: 'dailyLog',
        timestamp: log.timestamp,
        activityType: log.activityType,
        mood: log.mood,
        notes: log.notes,
        description: log.description,
        duration: log.duration,
        quantity: log.quantity,
        loggedByUser: log.loggedBy?.name,
        userRole: log.loggedBy?.role,
        userId: log.loggedBy?.id
      })),
      
      // Transform daily habits
      ...childFilteredEntries.dailyHabits.map(habit => ({
        id: habit.id,
        type: habit.collection?.replace('Logs', '') || 'dailyHabit', // moodLogs -> mood, etc.
        timestamp: habit.timestamp?.toDate ? habit.timestamp.toDate() : new Date(habit.timestamp),
        categoryId: habit.categoryId,
        categoryLabel: habit.categoryLabel,
        level: habit.level,
        notes: habit.notes,
        mediaUrls: habit.mediaUrls,
        loggedByUser: habit.loggedBy?.name,
        userRole: habit.loggedBy?.role,
        userId: habit.loggedBy?.id
      })),
      
      // Transform daily logs with text (Journal entries from DailyLogFeed)
      ...childFilteredEntries.dailyLogs
        .filter(log => log.text && log.text.trim().length > 0) // Only entries with meaningful text content
        .map(log => ({
          id: log.id,
          type: 'dailyLog',
          timestamp: log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp),
          text: log.text,
          tags: log.tags,
          loggedByUser: log.loggedBy?.name,
          userRole: log.loggedBy?.role,
          userId: log.loggedBy?.id
        })),
      
    ];

    // Sort all entries by timestamp (most recent first)
    const sortedEntries = transformedEntries.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Apply filters
    let filteredEntries = sortedEntries;

    // Filter by entry types
    if (filters.entryTypes?.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        filters.entryTypes.includes(entry.type)
      );
    }

    // Filter by user roles
    if (filters.userRoles?.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        filters.userRoles.includes(entry.userRole)
      );
    }

    // Filter by search text (case-insensitive search across relevant fields)
    if (filters.searchText?.trim()) {
      const searchTerm = filters.searchText.toLowerCase().trim();
      filteredEntries = filteredEntries.filter(entry => {
        const searchableText = [
          entry.description,
          entry.summary,
          entry.content,
          entry.notes,
          entry.title,
          entry.resolution,
          ...(entry.triggers || []),
          ...(entry.interventions || []),
          ...(entry.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    // Generate summary statistics
    const summary = {
      totalEntries: filteredEntries.length,
      incidentCount: filteredEntries.filter(e => e.type === 'incident').length,
      journalCount: filteredEntries.filter(e => e.type === 'journal').length,
      dailyLogCount: filteredEntries.filter(e => e.type === 'dailyLog').length,
      lastActivityTime: filteredEntries.length > 0 
        ? new Date(filteredEntries[0].timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : null,
      byTimePeriod: {
        morning: {
          hasIncidents: filteredEntries.some(e => e.type === 'incident' && getTimePeriod(e.timestamp) === 'morning'),
          hasJournalEntries: filteredEntries.some(e => e.type === 'journal' && getTimePeriod(e.timestamp) === 'morning')
        },
        afternoon: {
          hasIncidents: filteredEntries.some(e => e.type === 'incident' && getTimePeriod(e.timestamp) === 'afternoon'),
          hasJournalEntries: filteredEntries.some(e => e.type === 'journal' && getTimePeriod(e.timestamp) === 'afternoon')
        },
        evening: {
          hasIncidents: filteredEntries.some(e => e.type === 'incident' && getTimePeriod(e.timestamp) === 'evening'),
          hasJournalEntries: filteredEntries.some(e => e.type === 'journal' && getTimePeriod(e.timestamp) === 'evening')
        }
      }
    };

    return {
      entries: filteredEntries,
      summary
    };
  }, [rawEntries, filters, childId]);

  return {
    entries: processedData.entries,
    summary: processedData.summary,
    loading,
    error
  };
};

// Helper function to determine time period
const getTimePeriod = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

export default useUnifiedTimelineData;