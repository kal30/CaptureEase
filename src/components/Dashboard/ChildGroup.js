import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ChildCard from "./ChildCard";

const groupConfig = {
    own: {
        icon: '🏠',
        color: 'primary.main',
    },
    family: {
        icon: '👨‍👩‍👧‍👦',
        color: 'calendar.accent',
    },
    professional: {
        icon: '💼',
        color: 'tertiary.dark',
    }
}

/**
 * Renders a titled group of ChildCard components.
 */
const ChildGroup = ({
  title,
  groupType,
  children: childItems,
  quickDataStatus,
  recentEntries,
  isCardExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  getActionGroups,
  handleGroupActionClick,
  highlightedActions,
  expandedCategories,
  setExpandedCategories,
  getTypeConfig,
  formatTimeAgo,
}) => {
  const theme = useTheme();
  const config = groupConfig[groupType] || { icon: '', color: 'text.primary' };

  if (!childItems || childItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          px: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: config.color,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {config.icon} {title}
        </Typography>
        <Chip
          label={childItems.length}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            color: config.color,
            fontWeight: 600,
          }}
        />
      </Box>
      <Stack spacing={3}>
        {childItems.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            groupType={groupType}
            status={quickDataStatus[child.id] || {}}
            recentEntries={(recentEntries && recentEntries[child.id]) || []}
            isExpanded={isCardExpanded(child.id)}
            onToggleExpanded={() => onToggleExpanded(child.id)}
            onQuickEntry={onQuickEntry}
            onEditChild={onEditChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
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
