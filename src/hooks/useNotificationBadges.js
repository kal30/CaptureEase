import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getIncidentsPendingFollowUp } from '../services/incidentService';

export const useNotificationBadges = (childrenIds) => {
  const [pendingFollowUps, setPendingFollowUps] = useState({});
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastLoadedKeyRef = useRef('');

  // Create stable dependency for childrenIds
  const childrenIdsString = childrenIds ? childrenIds.join(',') : '';
  const stableChildrenIds = useMemo(
    () => (childrenIds ? [...childrenIds].sort() : []),
    [childrenIdsString]
  );

  // Load pending follow-ups for all children
  useEffect(() => {
    if (!childrenIdsString) {
      lastLoadedKeyRef.current = '';
      setPendingFollowUps((current) => (Object.keys(current).length ? {} : current));
      setTotalPendingCount((current) => (current !== 0 ? 0 : current));
      return;
    }

    if (lastLoadedKeyRef.current === childrenIdsString) {
      return;
    }

    const loadPendingFollowUps = async () => {
      setLoading(true);
      try {
        const pendingByChild = {};
        let totalCount = 0;

        // Get pending follow-ups for each child
        for (const childId of stableChildrenIds) {
          try {
            const incidents = await getIncidentsPendingFollowUp(childId);
            pendingByChild[childId] = incidents;
            totalCount += incidents.length;
          } catch (error) {
            console.error(`Error loading pending follow-ups for child ${childId}:`, error);
            pendingByChild[childId] = [];
          }
        }

        lastLoadedKeyRef.current = childrenIdsString;
        setPendingFollowUps((current) => {
          const currentSerialized = JSON.stringify(current);
          const nextSerialized = JSON.stringify(pendingByChild);
          return currentSerialized === nextSerialized ? current : pendingByChild;
        });
        setTotalPendingCount((current) => (current === totalCount ? current : totalCount));
      } catch (error) {
        console.error('Error loading pending follow-ups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingFollowUps();
  }, [childrenIdsString]);

  // Get pending count for specific child
  const getPendingCountForChild = useCallback((childId) => {
    return pendingFollowUps[childId]?.length || 0;
  }, [pendingFollowUps]);

  // Get overdue follow-ups (past due time)
  const getOverdueFollowUps = useCallback(() => {
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
  }, [pendingFollowUps]);

  // Get upcoming follow-ups (due within next hour)
  const getUpcomingFollowUps = useCallback(() => {
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
  }, [pendingFollowUps]);

  // Refresh pending follow-ups
  const refreshPendingFollowUps = async () => {
    if (stableChildrenIds && stableChildrenIds.length > 0) {
      lastLoadedKeyRef.current = '';
      const loadPendingFollowUps = async () => {
        setLoading(true);
        try {
          const pendingByChild = {};
          let totalCount = 0;

          for (const childId of stableChildrenIds) {
            try {
              const incidents = await getIncidentsPendingFollowUp(childId);
              pendingByChild[childId] = incidents;
              totalCount += incidents.length;
            } catch (error) {
              console.error(`Error refreshing pending follow-ups for child ${childId}:`, error);
              pendingByChild[childId] = [];
            }
          }

          setPendingFollowUps((current) => {
            const currentSerialized = JSON.stringify(current);
            const nextSerialized = JSON.stringify(pendingByChild);
            return currentSerialized === nextSerialized ? current : pendingByChild;
          });
          setTotalPendingCount((current) => (current === totalCount ? current : totalCount));
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
