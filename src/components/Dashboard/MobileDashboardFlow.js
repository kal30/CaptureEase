import React from 'react';
import { useDashboardView } from './shared/DashboardViewContext';
import Switchboard from './mobile/Switchboard';
import ChildDashboard from './mobile/ChildDashboard';
import { trackRenderDebug, useMountDebug } from '../../utils/renderDebug';

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
  useMountDebug('MobileDashboardFlow');
  trackRenderDebug('MobileDashboardFlow', {
    mobileView,
    activeChildId: activeChildId || 'none',
    childCount: children.length,
  });
  const activeRole = activeChild ? getUserRoleForChild?.(activeChild.id) : null;
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
