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
  allEntries,
  recentEntries,
  timelineSummary,
  incidents,
  showSleepLogSheet = false,
  showFoodLogSheet = false,
  showBathroomLogSheet = false,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  onTrack,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onMessages,
  onAddChildClick,
  onImportLogs,
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
      allEntries={allEntries}
      recentEntries={recentEntries}
      timelineSummary={timelineSummary}
      incidents={incidents}
      onQuickEntry={onQuickEntry}
      onEditChild={onEditChild}
      onInviteTeamMember={onInviteTeamMember}
      onDailyReport={onDailyReport}
      onTrack={onTrack}
      onOpenSleepLog={onOpenSleepLog}
      onOpenFoodLog={onOpenFoodLog}
      onOpenBathroomLog={onOpenBathroomLog}
      onOpenMedicalLog={onOpenMedicalLog}
      onMessages={onMessages}
      onImportLogs={onImportLogs}
      pauseScrollCollapse={showSleepLogSheet || showFoodLogSheet || showBathroomLogSheet}
      onBack={children.length > 1 ? goToSwitchboard : undefined}
      onSwitchChild={enterChild}
      onAddChildClick={onAddChildClick}
    />
  );
};

export default MobileDashboardFlow;
