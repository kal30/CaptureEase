import React from 'react';
import { useDashboardView } from './shared/DashboardViewContext';
import Switchboard from './mobile/Switchboard';
import MobileCaptureDashboard from './mobile/MobileCaptureDashboard';
import { trackRenderDebug, useMountDebug } from '../../utils/renderDebug';

const MobileDashboardFlow = ({
  children = [],
  allEntries,
  getUserRoleForChild,
  timelineSummary,
  onRefreshDashboard,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onMessages,
  onAddChildClick,
  onImportLogs,
  onRefreshRoles,
}) => {
  const { activeChildId, mobileView, enterChild } = useDashboardView();
  const activeChild = children.find((child) => child.id === activeChildId) || children[0] || null;
  useMountDebug('MobileDashboardFlow');
  trackRenderDebug('MobileDashboardFlow', {
    mobileView,
    activeChildId: activeChildId || 'none',
    childCount: children.length,
  });

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
      <MobileCaptureDashboard
      child={activeChild}
      children={children}
      allEntries={allEntries}
      timelineSummary={timelineSummary}
      getUserRoleForChild={getUserRoleForChild}
      onRefreshRoles={onRefreshRoles}
      onRefreshDashboard={onRefreshDashboard}
      onQuickEntry={onQuickEntry}
      onEditChild={onEditChild}
      onDeleteChild={onDeleteChild}
      onInviteTeamMember={onInviteTeamMember}
      onDailyReport={onDailyReport}
      onOpenSleepLog={onOpenSleepLog}
      onOpenFoodLog={onOpenFoodLog}
      onOpenBathroomLog={onOpenBathroomLog}
      onOpenMedicalLog={onOpenMedicalLog}
      onMessages={onMessages}
      onImportLogs={onImportLogs}
      onAddChildClick={onAddChildClick}
    />
  );
};

export default MobileDashboardFlow;
