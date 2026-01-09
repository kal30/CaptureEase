import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { childCardHeaderStyles } from '../../assets/theme/childCardTheme';
import GroupStyledCard from '../UI/GroupStyledCard';
import ChildCardHeader from './ChildCard/ChildCardHeader';
import ChildCardContent from './ChildCard/ChildCardContent';
import ChildCardActions from './ChildCard/ChildCardActions';
import PendingFollowUpModal from './PendingFollowUpModal';
import { useChildCardLogic } from '../../hooks/useChildCardLogic';

const ChildCard = ({
  child,
  groupType,
  status = {},
  recentEntries = [],
  incidents = [],
  isExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  onMessages,
  onAskQuestion,
}) => {
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

  const [optimisticEntries, setOptimisticEntries] = useState([]);

  useEffect(() => {
    if (!optimisticEntries.length) return;
    const existingIds = new Set((recentEntries || []).map((entry) => entry.id));
    setOptimisticEntries((prev) => prev.filter((entry) => !existingIds.has(entry.id)));
  }, [recentEntries]);

  const mergedEntries = useMemo(() => {
    const combined = [...optimisticEntries, ...(recentEntries || [])];
    return combined.sort((a, b) => {
      const bDate = b.timestamp?.toDate?.() || new Date(b.timestamp);
      const aDate = a.timestamp?.toDate?.() || new Date(a.timestamp);
      return bDate - aDate;
    });
  }, [optimisticEntries, recentEntries]);

  const handleLogCreated = (entry) => {
    if (!entry?.id) return;
    setOptimisticEntries((prev) => [entry, ...prev.filter((item) => item.id !== entry.id)]);
  };

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
            isExpanded={isExpanded}
            onEditChild={onEditChild}
            onDeleteChild={onDeleteChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
            onNotificationClick={handleNotificationClick}
            sx={{ flex: 1, minWidth: 0 }}
          />


          {/* Actions Section */}
          <ChildCardActions
            child={child}
            userRole={userRole}
            onMessages={onMessages}
            onAskQuestion={onAskQuestion}
            onLogCreated={handleLogCreated}
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
          recentEntries={mergedEntries}
          incidents={incidents}
          status={status}
          onLogCreated={handleLogCreated}
        />
      </GroupStyledCard>

      {/* Follow-up Modal */}
      <PendingFollowUpModal
        open={showFollowUpModal}
        onClose={handleFollowUpModalClose}
        childId={child.id}
        childName={child.name}
      />
    </>
  );
};

export default ChildCard;
