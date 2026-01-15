import React from 'react';
import { Box, Collapse } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { TimelineWidget } from '../../UI';
import useIsMobile from '../../../hooks/useIsMobile';
import TodaysMedications from '../Medication/TodaysMedications';

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
  onLogCreated,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  return (
    <Box sx={sx}>
      {/* Expandable Timeline Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: isMobile ? 1.25 : 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          {/* Today's Medications - Quick action to mark medications as taken */}
          <TodaysMedications child={child} onLogCreated={onLogCreated} />

          {/* Timeline Widget - Enhanced Recent Activity with Progress Visualization */}
          <TimelineWidget
            child={child}
            entries={recentEntries}
            incidents={incidents}
            dailyCareStatus={status}
            defaultExpanded={false}
            variant="full"
            showUnifiedLog={true}
            onLogCreated={onLogCreated}
          />

        </Box>
      </Collapse>
    </Box>
  );
};

export default ChildCardContent;
