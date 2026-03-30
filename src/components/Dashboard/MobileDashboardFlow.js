import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { useDashboardView } from './shared/DashboardViewContext';
import Switchboard from './mobile/Switchboard';
import ChildDashboard from './mobile/ChildDashboard';

const MobileDashboardFlow = ({
  children = [],
  getUserRoleForChild,
  USER_ROLES,
  quickDataStatus,
  recentEntries,
  timelineSummary,
  incidents,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  onMessages,
  onAddChildClick,
}) => {
  const { activeChildId, mobileView, enterChild, goToSwitchboard } = useDashboardView();
  const activeChild = children.find((child) => child.id === activeChildId) || children[0] || null;
  const activeRole = activeChild ? getUserRoleForChild?.(activeChild.id) : null;
  const hasActiveTimelineSummary = activeChild ? Object.prototype.hasOwnProperty.call(timelineSummary, activeChild.id) : false;
  const hasActiveEntries = activeChild ? Object.prototype.hasOwnProperty.call(recentEntries, activeChild.id) : false;
  const hasActiveIncidents = activeChild ? Object.prototype.hasOwnProperty.call(incidents, activeChild.id) : false;
  const hasActiveQuickStatus = activeChild ? Object.prototype.hasOwnProperty.call(quickDataStatus, activeChild.id) : false;
  const groupType = activeRole === USER_ROLES.CARE_OWNER
    ? 'own'
    : activeRole === USER_ROLES.CARE_PARTNER
      ? 'family'
      : 'professional';

  if (!activeChild) {
    return null;
  }

  if (children.length > 1 && mobileView === 'switchboard') {
    return (
      <Switchboard
        children={children}
        onSelectChild={enterChild}
        onAddChild={onAddChildClick}
      />
    );
  }

  if (!hasActiveTimelineSummary || !hasActiveEntries || !hasActiveIncidents || !hasActiveQuickStatus) {
    return (
      <Box sx={{ px: 1.5, pb: 3 }}>
        <Skeleton variant="rounded" height={44} sx={{ borderRadius: 999, mb: 1.25 }} />
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <ChildDashboard
      child={activeChild}
      children={children}
      groupType={groupType}
      quickDataStatus={quickDataStatus}
      recentEntries={recentEntries}
      timelineSummary={timelineSummary}
      incidents={incidents}
      onQuickEntry={onQuickEntry}
      onEditChild={onEditChild}
      onInviteTeamMember={onInviteTeamMember}
      onDailyReport={onDailyReport}
      onMessages={onMessages}
      onBack={children.length > 1 ? goToSwitchboard : undefined}
      onSwitchChild={enterChild}
      onAddChildClick={onAddChildClick}
    />
  );
};

export default MobileDashboardFlow;
