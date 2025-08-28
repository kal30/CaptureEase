import { useState, useEffect } from 'react';
import { getIncidentsPendingFollowUp } from '../services/incidentService';

export const useNotificationBadges = (childrenIds) => {
  const [pendingFollowUps, setPendingFollowUps] = useState({});
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load pending follow-ups for all children
  useEffect(() => {
    if (!childrenIds || childrenIds.length === 0) {
      setPendingFollowUps({});
      setTotalPendingCount(0);
      return;
    }

    const loadPendingFollowUps = async () => {
      setLoading(true);
      try {
        const pendingByChild = {};
        let totalCount = 0;

        // Get pending follow-ups for each child
        for (const childId of childrenIds) {
          try {
            const incidents = await getIncidentsPendingFollowUp(childId);
            pendingByChild[childId] = incidents;
            totalCount += incidents.length;
          } catch (error) {
            console.error(`Error loading pending follow-ups for child ${childId}:`, error);
            pendingByChild[childId] = [];
          }
        }

        setPendingFollowUps(pendingByChild);
        setTotalPendingCount(totalCount);
      } catch (error) {
        console.error('Error loading pending follow-ups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingFollowUps();
  }, [childrenIds]);

  // Get pending count for specific child
  const getPendingCountForChild = (childId) => {
    return pendingFollowUps[childId]?.length || 0;
  };

  // Get overdue follow-ups (past due time)
  const getOverdueFollowUps = () => {
    const now = new Date();
    const overdue = [];
    
    Object.values(pendingFollowUps).forEach(incidents => {
      incidents.forEach(incident => {
        const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
        if (followUpTime <= now) {
          overdue.push(incident);
        }
      });
    });
    
    return overdue;
  };

  // Get upcoming follow-ups (due within next hour)
  const getUpcomingFollowUps = () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const upcoming = [];
    
    Object.values(pendingFollowUps).forEach(incidents => {
      incidents.forEach(incident => {
        const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
        if (followUpTime > now && followUpTime <= oneHourFromNow) {
          upcoming.push(incident);
        }
      });
    });
    
    return upcoming;
  };

  // Refresh pending follow-ups
  const refreshPendingFollowUps = async () => {
    if (childrenIds && childrenIds.length > 0) {
      const loadPendingFollowUps = async () => {
        setLoading(true);
        try {
          const pendingByChild = {};
          let totalCount = 0;

          for (const childId of childrenIds) {
            try {
              const incidents = await getIncidentsPendingFollowUp(childId);
              pendingByChild[childId] = incidents;
              totalCount += incidents.length;
            } catch (error) {
              console.error(`Error refreshing pending follow-ups for child ${childId}:`, error);
              pendingByChild[childId] = [];
            }
          }

          setPendingFollowUps(pendingByChild);
          setTotalPendingCount(totalCount);
        } catch (error) {
          console.error('Error refreshing pending follow-ups:', error);
        } finally {
          setLoading(false);
        }
      };

      await loadPendingFollowUps();
    }
  };

  return {
    pendingFollowUps,
    totalPendingCount,
    loading,
    getPendingCountForChild,
    getOverdueFollowUps,
    getUpcomingFollowUps,
    refreshPendingFollowUps,
    
    // Derived states
    hasOverdueFollowUps: getOverdueFollowUps().length > 0,
    overdueCount: getOverdueFollowUps().length,
    upcomingCount: getUpcomingFollowUps().length
  };
};