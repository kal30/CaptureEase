import React from 'react';
import NotificationBadge from './NotificationBadge';
import { useNotificationBadges } from '../../hooks/useNotificationBadges';

/**
 * ChildNotificationBadge - Wrapper around NotificationBadge with child-specific logic
 * Automatically fetches and filters notification data for a specific child
 * Shows badge when there are any pending follow-ups (overdue, upcoming, or future)
 * 
 * @param {Object} props
 * @param {string} props.childId - Child ID to get notifications for
 * @param {function} props.onClick - Click handler for the badge
 * @param {string} props.size - Badge size: 'small', 'medium', 'large'
 * @param {string} props.color - Badge color theme
 * @param {boolean} props.showIcon - Whether to show notification icon
 * @param {Object} props.sx - Additional styling
 */
const ChildNotificationBadge = ({ 
  childId,
  onClick,
  size = 'small',
  color = 'error',
  showIcon = true,
  sx = {}
}) => {
  // Get notification data for this specific child
  const childrenIds = React.useMemo(() => [childId], [childId]);
  const {
    getPendingCountForChild,
    getOverdueFollowUps,
    getUpcomingFollowUps,
    loading
  } = useNotificationBadges(childrenIds);
  
  // Filter data for this specific child
  const pendingCount = getPendingCountForChild(childId);
  const overdueFollowUps = React.useMemo(() => 
    getOverdueFollowUps().filter(incident => incident.childId === childId),
    [getOverdueFollowUps, childId]
  );
  const upcomingFollowUps = React.useMemo(() => 
    getUpcomingFollowUps().filter(incident => incident.childId === childId),
    [getUpcomingFollowUps, childId]
  );

  // Show badge if there are any pending follow-ups (overdue, upcoming, or future)
  if (loading || pendingCount === 0) {
    return null;
  }

  return (
    <NotificationBadge
      count={pendingCount}
      overdueCount={overdueFollowUps.length}
      upcomingCount={upcomingFollowUps.length}
      onClick={onClick}
      size={size}
      color={color}
      showIcon={showIcon}
      sx={sx}
    />
  );
};

export default ChildNotificationBadge;