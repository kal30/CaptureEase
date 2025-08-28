import React from 'react';
import { Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const NotificationBadge = ({ 
  count = 0, 
  showIcon = true, 
  color = 'error',
  size = 'medium',
  overdueCount = 0,
  upcomingCount = 0,
  onClick,
  children
}) => {
  // Determine which icon to show
  const getIcon = () => {
    if (!showIcon) return null;
    
    if (overdueCount > 0) {
      return <NotificationsActiveIcon color="error" fontSize={size} />;
    } else if (count > 0) {
      return <NotificationsIcon color="primary" fontSize={size} />;
    } else {
      return <NotificationsIcon color="disabled" fontSize={size} />;
    }
  };

  // Generate tooltip text
  const getTooltipText = () => {
    if (count === 0) {
      return "No pending follow-ups";
    }
    
    const parts = [];
    if (overdueCount > 0) {
      parts.push(`${overdueCount} overdue`);
    }
    if (upcomingCount > 0) {
      parts.push(`${upcomingCount} coming up`);
    }
    
    const remaining = count - overdueCount - upcomingCount;
    if (remaining > 0) {
      parts.push(`${remaining} pending`);
    }
    
    return parts.join(', ');
  };

  const badge = (
    <Badge 
      badgeContent={count} 
      color={overdueCount > 0 ? 'error' : color}
      invisible={count === 0}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '& .MuiBadge-badge': {
          fontSize: '0.75rem',
          height: '20px',
          minWidth: '20px'
        }
      }}
      onClick={onClick}
    >
      {children || getIcon()}
    </Badge>
  );

  if (count > 0 || overdueCount > 0 || upcomingCount > 0) {
    return (
      <Tooltip title={getTooltipText()} placement="bottom">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default NotificationBadge;