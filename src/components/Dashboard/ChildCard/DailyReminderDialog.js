import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import useIsMobile from '../../../hooks/useIsMobile';
import { usePhoneStatus } from '../../../hooks/usePhoneStatus';
import { updateChildSmsSettings } from '../../../services/messaging/updateChildSmsSettings';

const DailyReminderDialog = ({ open, onClose, child }) => {
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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      onClick={(event) => event.stopPropagation()}
    >
      <DialogTitle>Daily reminder</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          SMS + email if no log in 24 hours.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
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
          {dailyReminderEnabled && (
            <TextField
              type="time"
              size="small"
              value={dailyReminderTime}
              onChange={handleReminderTimeChange}
              disabled={reminderLoading || !childSmsEnabled}
              inputProps={{ step: 300, "aria-label": "Daily reminder time" }}
              sx={{ width: 130 }}
            />
          )}
        </Box>

        {!phoneVerified && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Verify your phone in Settings to enable reminders.
          </Alert>
        )}
        {phoneVerified && !childSmsEnabled && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              bgcolor: 'transparent',
              color: 'warning.main',
              '& .MuiAlert-icon': { color: 'warning.main' },
              '& .MuiAlert-message': { color: 'warning.main' }
            }}
          >
            Enable SMS logging for this child to turn on reminders.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DailyReminderDialog;
