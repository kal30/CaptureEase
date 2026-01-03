import React, { useState, useEffect } from "react";
import {
  Box,
  Switch,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Typography,
} from "@mui/material";
import {
  Sms as SmsIcon,
  SmsOutlined as SmsOutlinedIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { usePhoneStatus } from "../../../hooks/usePhoneStatus";
import { updateChildSmsSettings } from "../../../services/messaging/updateChildSmsSettings";

/**
 * SMS Toggle Component for ChildCard
 * Shows SMS logging status with clear visual indicator and easy toggle
 */
const SmsToggle = ({ child, onSettingsUpdate }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get phone status for the user and this specific child
  const { verified: phoneVerified, loading: phoneLoading } = usePhoneStatus(
    null,
    child
  );

  // Get current SMS enabled status
  const smsEnabled = child?.settings?.notifications?.smsEnabled || false;

  const [localSmsEnabled, setLocalSmsEnabled] = useState(smsEnabled);

  useEffect(() => {
    setLocalSmsEnabled(smsEnabled);
  }, [smsEnabled]);

  const handleToggle = async (event) => {
    event.stopPropagation(); // Prevent card expansion

    // Check if user is authenticated
    if (!auth.currentUser) {
      showSnackbar("Please log in to manage SMS settings", "error");
      return;
    }

    // Check if phone is verified first
    if (!phoneVerified) {
      showSnackbar("Please verify your phone number first", "warning");
      navigate("/settings/messaging");
      return;
    }

    const newSmsEnabled = event.target.checked;
    setLocalSmsEnabled(newSmsEnabled);

    if (!child?.id) {
      showSnackbar("Child ID not available", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("Updating SMS settings:", {
        childId: child.id,
        smsEnabled: newSmsEnabled,
      });

      const result = await updateChildSmsSettings(child.id, newSmsEnabled);

      console.log("SMS settings updated:", result);
      showSnackbar(
        `SMS logging ${newSmsEnabled ? "enabled" : "disabled"} for ${child.name}`,
        "success"
      );

      // Update parent component if callback provided
      if (onSettingsUpdate) {
        onSettingsUpdate({
          ...child,
          settings: {
            ...child.settings,
            notifications: {
              ...child.settings?.notifications,
              smsEnabled: newSmsEnabled,
            },
          },
        });
      }
    } catch (error) {
      console.error("❌ ERROR updating SMS settings:", {
        errorCode: error.code,
        errorMessage: error.message,
        fullError: error,
        childId: child.id,
        childName: child.name,
        smsEnabled: newSmsEnabled,
      });

      let message = "Failed to update SMS settings";

      if (
        error.code === "permission-denied" ||
        error.code === "functions/permission-denied"
      ) {
        message = "You don't have permission to modify this child's settings";
      } else if (
        error.code === "unauthenticated" ||
        error.code === "functions/unauthenticated"
      ) {
        message = "Please log in again";
      } else if (
        error.code === "not-found" ||
        error.code === "functions/not-found"
      ) {
        message = "Child not found";
      } else if (
        error.code === "internal" ||
        error.code === "functions/internal"
      ) {
        message = error.message || "Internal error. Please try again.";
      } else if (error.message) {
        message = error.message;
      }

      console.error("📢 Showing error to user:", message);
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (event) => {
    event.stopPropagation(); // Prevent card expansion
    if (!phoneVerified) {
      navigate("/settings/messaging");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Don't render while loading
  if (phoneLoading) {
    return null;
  }

  // Phone not verified - show setup chip
  if (!phoneVerified) {
    return (
      <>
        <Tooltip
          title="Click to verify your phone number and enable SMS logging"
          arrow
        >
          <Chip
            icon={<SmsOutlinedIcon />}
            label="Setup SMS"
            size="small"
            onClick={handleChipClick}
            sx={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FDE68A",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#FDE68A",
              },
            }}
          />
        </Tooltip>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Phone verified - show status chip with toggle
  return (
    <>
      <Tooltip
        title={
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              SMS Logging for {child.name}
            </Typography>
            <Typography variant="caption">
              {localSmsEnabled
                ? `Text messages will be logged automatically. Use #${child.name?.toLowerCase()} to route messages.`
                : "Click to enable SMS logging for this child"}
            </Typography>
          </Box>
        }
        arrow
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Chip
            icon={localSmsEnabled ? <SmsIcon /> : <SmsOutlinedIcon />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  SMS
                </Typography>
                {localSmsEnabled && <VerifiedIcon sx={{ fontSize: 14 }} />}
              </Box>
            }
            size="small"
            sx={{
              backgroundColor: localSmsEnabled ? "#D1FAE5" : "#F3F4F6",
              color: localSmsEnabled ? "#065F46" : "#6B7280",
              border: localSmsEnabled
                ? "1px solid #A7F3D0"
                : "1px solid #E5E7EB",
              fontWeight: 600,
              "& .MuiChip-icon": {
                color: localSmsEnabled ? "#065F46" : "#6B7280",
              },
            }}
          />

          <Switch
            checked={localSmsEnabled}
            onChange={handleToggle}
            disabled={loading}
            size="small"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            inputProps={{
              "aria-label": `${localSmsEnabled ? "Disable" : "Enable"} SMS logging for ${child.name}`,
            }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#10B981",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#10B981",
              },
            }}
          />
        </Box>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SmsToggle;
