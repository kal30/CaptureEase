import React, { useEffect, useState } from 'react';
import { Box, Collapse, Typography, FormControlLabel, Switch, TextField, Alert, CircularProgress, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, useTheme } from '@mui/material/styles';
import { TimelineWidget } from '../../UI';
import useIsMobile from '../../../hooks/useIsMobile';
import { usePhoneStatus } from '../../../hooks/usePhoneStatus';
import { updateChildSmsSettings } from '../../../services/messaging/updateChildSmsSettings';
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
  const { verified: phoneVerified, childSmsEnabled, loading: phoneLoading } = usePhoneStatus(null, child);
  const reminderSettings = child?.settings?.notifications || {};
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
    reminderSettings.dailyLogReminderEnabled === true
  );
  const [dailyReminderTime, setDailyReminderTime] = useState(
    reminderSettings.dailyLogReminderTime || "19:00"
  );
  const [reminderLoading, setReminderLoading] = useState(false);
  const [showReminderDetails, setShowReminderDetails] = useState(false);

  useEffect(() => {
    setDailyReminderEnabled(reminderSettings.dailyLogReminderEnabled === true);
    setDailyReminderTime(reminderSettings.dailyLogReminderTime || "19:00");
  }, [child?.id, reminderSettings.dailyLogReminderEnabled, reminderSettings.dailyLogReminderTime]);

  const handleReminderToggle = async (event) => {
    const enabled = event.target.checked;
    setDailyReminderEnabled(enabled);
    if (!child?.id) return;
    setReminderLoading(true);
    try {
      await updateChildSmsSettings(child.id, !!childSmsEnabled, {
        dailyLogReminderEnabled: enabled,
        dailyLogReminderTime: dailyReminderTime,
        dailyLogReminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dailyLogReminderChannel: "sms_email",
      });
    } finally {
      setReminderLoading(false);
    }
  };

  const handleReminderTimeChange = async (event) => {
    const value = event.target.value;
    setDailyReminderTime(value);
    if (!dailyReminderEnabled || !child?.id) return;
    setReminderLoading(true);
    try {
      await updateChildSmsSettings(child.id, !!childSmsEnabled, {
        dailyLogReminderEnabled: true,
        dailyLogReminderTime: value,
        dailyLogReminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dailyLogReminderChannel: "sms_email",
      });
    } finally {
      setReminderLoading(false);
    }
  };

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

          <Box
            sx={{
              mt: isMobile ? 2 : 2.5,
              p: isMobile ? 1 : 1.25,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover'
            }}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ minWidth: 180, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  size="small"
                  onClick={() => setShowReminderDetails((prev) => !prev)}
                  sx={{
                    transform: showReminderDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Daily reminder
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    SMS + email if no log in 24 hours.
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={dailyReminderEnabled}
                    onChange={handleReminderToggle}
                    disabled={reminderLoading || phoneLoading || !phoneVerified || !childSmsEnabled}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">
                      {dailyReminderEnabled ? "On" : "Off"}
                    </Typography>
                    {(reminderLoading || phoneLoading) && <CircularProgress size={16} />}
                  </Box>
                }
                sx={{ m: 0 }}
              />
              <TextField
                label="Time"
                type="time"
                size="small"
                value={dailyReminderTime}
                onChange={handleReminderTimeChange}
                disabled={reminderLoading || !dailyReminderEnabled || !childSmsEnabled}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ width: 150 }}
              />
            </Box>

            <Collapse in={showReminderDetails}>
              {!phoneVerified && (
                <Alert severity="info" sx={{ mt: 1.25 }}>
                  Verify your phone in Settings to enable reminders.
                </Alert>
              )}
              {phoneVerified && !childSmsEnabled && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1.25,
                    bgcolor: 'transparent',
                    color: 'warning.main',
                    '& .MuiAlert-icon': { color: 'warning.main' },
                    '& .MuiAlert-message': { color: 'warning.main' }
                  }}
                >
                  Enable SMS logging for this child to turn on reminders.
                </Alert>
              )}
            </Collapse>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ChildCardContent;
