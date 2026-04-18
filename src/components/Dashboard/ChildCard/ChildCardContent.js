import React from 'react';
import { Box, Collapse } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { TimelineWidget } from '../../UI';

/**
 * ChildCardContent - Expandable content section of child card
 * Contains timeline widget with recent activity
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object with medical profile, etc.
 * @param {string} props.groupType - Group type for styling
 * @param {boolean} props.isExpanded - Whether content is expanded
 * @param {Array} props.recentEntries - Recent activity entries
 * @param {Array} props.calendarEntries - Full child history entries used for calendar markers
 * @param {Array} props.incidents - Incident entries
 * @param {Object} props.status - Daily care status
 * @param {function} props.onQuickEntry - Handler for quick entry actions
 * @param {Object} props.sx - Additional styling
 */
const ChildCardContent = ({
  child,
  isExpanded,
  disableCollapse = false,
  recentEntries = [],
  calendarEntries = [],
  incidents = [],
  status = {},
  onQuickEntry,
  sx = {}
}) => {
  const theme = useTheme();
  const content = (
    <Box
      sx={{
        p: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <TimelineWidget
        child={child}
        entries={recentEntries}
        calendarEntries={calendarEntries}
        incidents={incidents}
        dailyCareStatus={status}
        onQuickEntry={onQuickEntry}
        defaultExpanded={false}
        expanded={isExpanded}
        variant="full"
        showUnifiedLog={true}
      />
    </Box>
  );

  return (
    <Box sx={sx}>
      {disableCollapse ? content : <Collapse in={isExpanded}>{content}</Collapse>}
    </Box>
  );
};

export default ChildCardContent;
