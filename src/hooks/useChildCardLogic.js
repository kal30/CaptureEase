import { useState } from 'react';
import { useRole } from '../contexts/RoleContext';

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

  // Role and permission data
  const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
  const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;
  const pendingCount = 0;
  const overdueFollowUps = [];
  const upcomingFollowUps = [];

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
