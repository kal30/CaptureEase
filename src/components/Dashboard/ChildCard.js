import React from 'react';
import { Box } from '@mui/material';
import { childCardHeaderStyles } from '../../assets/theme/childCardTheme';
import GroupStyledCard from '../UI/GroupStyledCard';
import ChildCardHeader from './ChildCard/ChildCardHeader';
import ChildCardContent from './ChildCard/ChildCardContent';
import ChildCardActions from './ChildCard/ChildCardActions';
import PendingFollowUpModal from './PendingFollowUpModal';
import { useChildCardLogic } from '../../hooks/useChildCardLogic';
import { trackRenderDebug, useMountDebug } from '../../utils/renderDebug';

const ChildCard = ({
  child,
  groupType,
  status = {},
  recentEntries = [],
  timelineSummary = {},
  incidents = [],
  isExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  onMessages,
  compactIdentityOnMobile = false,
  disableCollapse = false,
  hidePrimaryAction = false,
  collapseSummaryOnMobile = false,
}) => {
  useMountDebug('ChildCard');
  trackRenderDebug('ChildCard', {
    childId: child?.id || 'none',
    isExpanded,
    recentEntries: recentEntries.length,
    incidents: incidents.length,
    todayCount: timelineSummary.todayCount || 0,
  });
  // Business logic hook
  const {
    userRole,
    canAddData,
    completedToday,
    hoveredQuickAction,
    showFollowUpModal,
    handleQuickActionHover,
    handleQuickActionLeave,
    handleNotificationClick,
    handleFollowUpModalClose
  } = useChildCardLogic(child, recentEntries, incidents);

  return (
    <>
      <GroupStyledCard
        groupType={groupType}
        isExpanded={isExpanded}
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpanded();
        }}
        sx={{ cursor: 'pointer' }}
      >

        {/* Header Section with Role-Based Background */}
        <Box sx={(theme) => childCardHeaderStyles(theme, userRole)}>
          {/* Header with Avatar and Basic Info */}
          <ChildCardHeader
            child={child}
            userRole={userRole}
            canAddData={canAddData}
            completedToday={completedToday}
            timelineSummary={timelineSummary}
            onEditChild={onEditChild}
            onDeleteChild={onDeleteChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
            onNotificationClick={handleNotificationClick}
            compactIdentityOnMobile={compactIdentityOnMobile}
            collapseSummaryOnMobile={collapseSummaryOnMobile}
            sx={{ flex: 1, minWidth: 0 }}
          />


          {/* Actions Section */}
          <ChildCardActions
            child={child}
            status={status}
            userRole={userRole}
            completedToday={completedToday}
            helperText={hidePrimaryAction ? '' : (!(timelineSummary.todayCount > 0) ? 'No entries yet today — tap to log' : '')}
            hidePrimaryAction={hidePrimaryAction}
            onQuickEntry={onQuickEntry}
            onDailyReport={onDailyReport}
            onMessages={onMessages}
            hoveredQuickAction={hoveredQuickAction}
            onHoverAction={handleQuickActionHover}
            onLeaveAction={handleQuickActionLeave}
            sx={{
              alignSelf: 'stretch',
              justifyContent: { xs: 'center', md: 'flex-end' },
              width: { xs: '100%', md: 'auto' }
            }}
          />
        </Box>

        {/* Content Section (Medical Info + Timeline) */}
        <ChildCardContent
          child={child}
          groupType={groupType}
          isExpanded={isExpanded}
          disableCollapse={disableCollapse}
          recentEntries={recentEntries}
          incidents={incidents}
          status={status}
          onQuickEntry={onQuickEntry}
        />
      </GroupStyledCard>

      {/* Follow-up Modal */}
      {showFollowUpModal ? (
        <PendingFollowUpModal
          open={showFollowUpModal}
          onClose={handleFollowUpModalClose}
          childId={child.id}
          childName={child.name}
        />
      ) : null}
    </>
  );
};

export default ChildCard;
