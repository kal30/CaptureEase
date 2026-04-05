import React from 'react';
import { Box } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import ChildGroup from './ChildGroup';

const DesktopDashboardOverview = ({
  hook,
  actionGroups,
  onAddChildClick,
  onImportLogs,
  onTrack,
  onOpenFoodLog,
  onOpenMedicalLog,
}) => {
  const commonChildGroupProps = {
    quickDataStatus: hook.quickDataStatus,
    recentEntries: hook.recentEntries,
    timelineSummary: hook.timelineSummary,
    incidents: hook.incidents,
    isCardExpanded: hook.isCardExpanded,
    onToggleExpanded: hook.toggleCard,
    onQuickEntry: hook.handleQuickDataEntry,
    onEditChild: hook.handleEditChild,
    onInviteTeamMember: hook.handleInviteTeamMember,
    onDailyReport: hook.handleShowCareReport,
    onTrack,
    onOpenFoodLog,
    onOpenMedicalLog,
    onMessages: hook.handleMessages,
    onImportLogs,
    getActionGroups: actionGroups,
    handleGroupActionClick: hook.handleGroupActionClick,
    highlightedActions: hook.highlightedActions,
    expandedCategories: hook.expandedCategories,
    setExpandedCategories: hook.setExpandedCategories,
    getTypeConfig: hook.getTypeConfig,
    formatTimeAgo: hook.formatTimeAgo,
  };

  return (
    <>
      <DashboardHeader
        user={hook.user}
        children={hook.children}
        isReadOnlyForChild={hook.isReadOnlyForChild}
        getUserRoleForChild={hook.getUserRoleForChild}
        USER_ROLES={hook.USER_ROLES}
        onInviteClick={hook.handleInviteTeamMember}
        onAddChildClick={onAddChildClick}
      />

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <ChildGroup
          title="In Your Full Care"
          groupType="own"
          children={hook.ownChildren}
          {...commonChildGroupProps}
        />
        <ChildGroup
          title="Family Children"
          groupType="family"
          children={hook.familyChildren}
          {...commonChildGroupProps}
        />
        <ChildGroup
          title="Professional Assignments"
          groupType="professional"
          children={hook.professionalChildren}
          {...commonChildGroupProps}
        />
      </Box>
    </>
  );
};

export default DesktopDashboardOverview;
