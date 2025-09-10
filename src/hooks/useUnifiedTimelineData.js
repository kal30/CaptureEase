import { useState, useEffect, useMemo } from 'react';
import { getTimelineData } from '../services/timeline';
import { 
  withTimelinePermissions,
  getCareOwnerTimelineView 
} from '../services/timeline/timelinePermissionService';
import { useRole } from '../contexts/RoleContext';
import { USER_ROLES } from '../constants/roles';

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
  const { getUserRoleForChild } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawEntries, setRawEntries] = useState({
    incidents: [],
    journals: [],
    dailyHabits: [],
    therapyNotes: [] // NEW: 4th timeline entry type
  });

  // Get current user's role for this child
  const userRole = getUserRoleForChild(childId);

  // Fetch all data when childId or selectedDate changes
  useEffect(() => {
    if (!childId || !selectedDate) {
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
          dailyHabits: timelineData.dailyHabits || [],
          therapyNotes: timelineData.therapyNotes || [] // NEW: Include therapy notes
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
    // Don't process if we don't have a user role yet
    if (!userRole) {
      return { entries: [], summary: {} };
    }

    // Filter raw entries to ensure they belong to the current child
    const childFilteredEntries = {
      incidents: rawEntries.incidents.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      journals: rawEntries.journals.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      dailyHabits: rawEntries.dailyHabits.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ),
      therapyNotes: rawEntries.therapyNotes.filter(entry => 
        entry.childId === childId || entry.child?.id === childId
      ) // NEW: Filter therapy notes
    };

    

    // Transform raw data into unified entry format
    const transformedEntries = [
      // Transform incidents (from incidents collection) - includes grouped incidents with follow-ups
      ...childFilteredEntries.incidents.map(incident => ({
        id: incident.id,
        type: 'incident',
        collection: 'incidents',
        timestamp: incident.timestamp,
        // Follow-up related fields (for grouped incidents)
        isGroupedIncident: incident.isGroupedIncident,
        followUps: incident.followUps,
        totalFollowUps: incident.totalFollowUps,
        // Include legacy follow-up fields
        effectiveness: incident.effectiveness,
        followUpNotes: incident.followUpNotes,
        followUpCompleted: incident.followUpCompleted,
        // Include follow-up response arrays from new system
        followUpResponses: incident.followUpResponses,
        lastFollowUpResponse: incident.lastFollowUpResponse,
        // Include all incident fields
        incidentType: incident.type,
        severity: incident.severity,
        remedy: incident.remedy,
        notes: incident.notes,
        description: incident.description,
        summary: incident.summary,
        triggers: incident.triggers,
        duration: incident.duration,
        interventions: incident.interventions,
        mediaAttachments: incident.mediaAttachments,
        mediaURL: incident.mediaURL,
        loggedByUser: incident.loggedBy?.name,
        userRole: incident.loggedBy?.role,
        userId: incident.loggedBy?.id
      })),
      
      // Transform journal entries (from dailyLogs - avoid duplicates by using journals data only)
      ...childFilteredEntries.journals.map(journal => ({
        id: journal.id,
        type: 'journal',
        timelineType: 'journal',
        collection: 'dailyLogs',
        timestamp: journal.timestamp?.toDate ? journal.timestamp.toDate() : new Date(journal.timestamp),
        text: journal.text,
        tags: journal.tags,
        mediaURL: journal.mediaURL,
        mediaType: journal.mediaType,
        voiceMemoURL: journal.voiceMemoURL,
        loggedByUser: journal.loggedBy?.name,
        userRole: journal.loggedBy?.role,
        userId: journal.loggedBy?.id
      })),
      
      // Transform daily habits (from dailyCare collection)
      ...childFilteredEntries.dailyHabits.map(habit => ({
        id: habit.id,
        type: 'dailyHabit',
        collection: 'dailyCare',
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

      // Transform therapy notes (Professional entries from therapyNotes collection)
      ...childFilteredEntries.therapyNotes.map(note => ({
        id: note.id,
        type: 'therapyNote',
        collection: 'therapyNotes',
        timestamp: note.timestamp?.toDate ? note.timestamp.toDate() : new Date(note.timestamp),
        title: note.title || 'Therapy Note',
        content: note.content,
        noteType: note.noteType,
        sessionType: note.sessionType,
        clinicalArea: note.clinicalArea,
        tags: note.tags || [],
        category: note.category,
        replies: note.replies || [],
        professionalNote: true,
        userRole: note.userRole || 'therapist',
        userId: note.createdBy,
        loggedByUser: 'Therapist' // TODO: Get actual therapist name
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
      dailyHabitCount: filteredEntries.filter(e => e.type === 'dailyHabit').length,
      therapyNoteCount: filteredEntries.filter(e => e.type === 'therapyNote').length,
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

    // Apply role-based permissions and filtering
    if (userRole === USER_ROLES.CARE_OWNER) {
      // Care Owner gets the full timeline view with enhanced insights
      return getCareOwnerTimelineView(filteredEntries, summary, filters);
    } else {
      // For other roles, apply permission-based filtering
      const permissionManager = withTimelinePermissions(userRole, null, childId);
      const roleFilteredEntries = permissionManager.filterEntries(filteredEntries, filters);
      const enhancedSummary = permissionManager.enhanceSummary(roleFilteredEntries, summary);

      return {
        entries: roleFilteredEntries,
        summary: enhancedSummary
      };
    }
  }, [rawEntries, filters, childId, userRole]);

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