import { useState, useMemo, useEffect } from 'react';
import { useRole } from '../contexts/RoleContext';
import { useNotificationBadges } from './useNotificationBadges';

/**
 * useChildCardLogic - Business logic hook for ChildCard component
 * Manages state, role permissions, and notification data for a child card
 * 
 * @param {Object} child - Child object with id, name, etc.
 * @param {Array} recentEntries - Recent activity entries
 * @param {Array} incidents - Incident entries
 * @returns {Object} Child card logic and state
 */
export const useChildCardLogic = (child, recentEntries = [], incidents = []) => {
  // Role context
  const {
    getUserRoleForChild,
    canAddDataForChild,
    USER_ROLES,
  } = useRole();

  // Local state
  const [hoveredQuickAction, setHoveredQuickAction] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Memoized child IDs array to prevent infinite renders
  const childrenIds = useMemo(() => [child.id], [child.id]);

  // Notification badges data
  const {
    getPendingCountForChild,
    getOverdueFollowUps,
    getUpcomingFollowUps
  } = useNotificationBadges(childrenIds);

  // Role and permission data
  const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
  const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;

  // Notification data
  const pendingCount = getPendingCountForChild(child.id);
  const overdueFollowUps = useMemo(() => 
    getOverdueFollowUps().filter(incident => incident.childId === child.id),
    [getOverdueFollowUps, child.id]
  );
  const upcomingFollowUps = useMemo(() => 
    getUpcomingFollowUps().filter(incident => incident.childId === child.id),
    [getUpcomingFollowUps, child.id]
  );

  // Computed state
  const completedToday = false; // Removed mood/sleep completion tracking
  const hasOverdueNotifications = overdueFollowUps.length > 0;

  // Event handlers
  const handleQuickActionHover = (actionType) => {
    setHoveredQuickAction(actionType);
  };

  const handleQuickActionLeave = () => {
    setHoveredQuickAction(null);
  };

  const handleNotificationClick = () => {
    setShowFollowUpModal(true);
  };

  const handleFollowUpModalClose = () => {
    setShowFollowUpModal(false);
  };

  // Debug logging for notification badges
  useEffect(() => {
    if (pendingCount > 0) {
      console.log(`🔔 Badge for ${child.name} shows ${pendingCount} pending follow-ups`);
      console.log('📊 Badge data:', { 
        pendingCount, 
        overdueCount: overdueFollowUps.length, 
        upcomingCount: upcomingFollowUps.length 
      });
    }
  }, [pendingCount, overdueFollowUps.length, upcomingFollowUps.length, child.name]);

  return {
    // State
    hoveredQuickAction,
    showFollowUpModal,
    
    // Role & Permissions
    userRole,
    canAddData,
    USER_ROLES,
    
    // Notifications
    pendingCount,
    overdueFollowUps,
    upcomingFollowUps,
    hasOverdueNotifications,
    
    // Computed
    completedToday,
    
    // Event Handlers
    handleQuickActionHover,
    handleQuickActionLeave,
    handleNotificationClick,
    handleFollowUpModalClose,
    
    // Setters (for external control if needed)
    setHoveredQuickAction,
    setShowFollowUpModal
  };
};