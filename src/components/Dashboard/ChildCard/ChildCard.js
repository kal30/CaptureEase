import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRole } from '../../../contexts/RoleContext';
import { ThemeCard } from '../../UI';
import ChildCardHeader from './ChildCardHeader';
import ChildCardContent from './ChildCardContent';
import ChildCardActions from './ChildCardActions';

/**
 * ChildCard - Main child card component with clean, theme-driven styling
 * Refactored from 918 lines to focused sub-components with zero hardcoded colors
 * 
 * Role-based styling handled by ThemeCard component variants
 */
const ChildCard = ({
  child,
  groupType,
  status = {},
  recentEntries = [],
  isExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  getActionGroups,
  handleGroupActionClick,
  highlightedActions = {},
  expandedCategories = {},
  setExpandedCategories,
  getTypeConfig,
  formatTimeAgo,
}) => {
  const theme = useTheme();
  const {
    getUserRoleForChild,
    canAddDataForChild,
    USER_ROLES,
  } = useRole();

  // Derived state
  const completedToday = status.mood && status.sleep && status.energy;
  const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
  const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;
  const canEdit = userRole === 'primary_parent' || userRole === 'co_parent' || userRole === 'parent';

  // Determine card variant based on role for theme-driven styling
  const getCardVariant = () => {
    if (userRole === 'therapist') return 'therapist';
    if (userRole === 'caregiver') return 'caregiver';  
    if (userRole && userRole.includes('parent')) return 'parent';
    return 'basic';
  };

  return (
    <ThemeCard
      variant="role"
      role={getCardVariant()}
      elevated={false}
      onClick={(e) => {
        e.stopPropagation();
        onToggleExpanded();
      }}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        overflow: 'hidden',
      }}
    >
      {/* Header: Avatar, Name, Role, Edit */}
      <ChildCardHeader
        child={child}
        userRole={userRole}
        canEdit={canEdit}
        onEditChild={onEditChild}
        showMedicalInfo={true}
      />

      {/* Content: Status, Quick Actions, Medical Info */}
      <ChildCardContent
        child={child}
        status={status}
        completedToday={completedToday}
        canAddData={canAddData}
        onQuickEntry={onQuickEntry}
        onDailyReport={onDailyReport}
      />

      {/* Actions: Expandable Action Groups */}
      <ChildCardActions
        child={child}
        isExpanded={isExpanded}
        canAddData={canAddData}
        onInviteTeamMember={onInviteTeamMember}
        getActionGroups={getActionGroups}
        handleGroupActionClick={handleGroupActionClick}
        highlightedActions={highlightedActions}
        expandedCategories={expandedCategories}
        setExpandedCategories={setExpandedCategories}
        getTypeConfig={getTypeConfig}
        formatTimeAgo={formatTimeAgo}
      />
    </ThemeCard>
  );
};

export default ChildCard;