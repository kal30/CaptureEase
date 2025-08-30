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
 * @param {Array} props.incidents - Incident entries
 * @param {Object} props.status - Daily care status
 * @param {Object} props.sx - Additional styling
 */
const ChildCardContent = ({
  child,
  groupType,
  isExpanded,
  recentEntries = [],
  incidents = [],
  status = {},
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box sx={sx}>
      {/* Expandable Timeline Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          {/* Timeline Widget - Enhanced Recent Activity with Progress Visualization */}
          <TimelineWidget
            child={child}
            entries={recentEntries}
            incidents={incidents}
            dailyCareStatus={status}
            defaultExpanded={false}
            variant="full"
            showUnifiedLog={true}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default ChildCardContent;