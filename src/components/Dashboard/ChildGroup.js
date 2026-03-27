import React from "react";
import { Box, Stack } from "@mui/material";
import ChildCard from "./ChildCard";

/**
 * Renders a titled group of ChildCard components.
 */
const ChildGroup = ({
  groupType,
  children: childItems,
  quickDataStatus,
  recentEntries,
  timelineSummary,
  incidents = {},
  isCardExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  onMessages,
  getActionGroups,
  handleGroupActionClick,
  highlightedActions,
  expandedCategories,
  setExpandedCategories,
  getTypeConfig,
  formatTimeAgo,
}) => {
  if (!childItems || childItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Stack spacing={3}>
        {childItems.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            groupType={groupType}
            status={quickDataStatus[child.id] || {}}
            recentEntries={(recentEntries && recentEntries[child.id]) || []}
            timelineSummary={(timelineSummary && timelineSummary[child.id]) || {}}
            incidents={(incidents && incidents[child.id]) || []}
            isExpanded={isCardExpanded(child.id)}
            onToggleExpanded={() => onToggleExpanded(child.id)}
            onQuickEntry={onQuickEntry}
            onEditChild={onEditChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
            onMessages={onMessages}
            getActionGroups={getActionGroups}
            handleGroupActionClick={handleGroupActionClick}
            highlightedActions={highlightedActions}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            getTypeConfig={getTypeConfig}
            formatTimeAgo={formatTimeAgo}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ChildGroup;
