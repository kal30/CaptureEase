import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Button,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Message as MessageIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import { app } from "../../services/firebase";
import { usePhoneStatus } from "../../hooks/usePhoneStatus";

const functions = getFunctions(app, "us-central1");
const updateChildSmsSettingsCallable = httpsCallable(
  functions,
  "updateChildSmsSettings"
);

/**
 * Child-specific SMS notification settings component
 * Shows different states based on user phone verification and child SMS settings
 */
const ChildSmsSettings = ({ childDoc, onSettingsUpdate = () => {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get phone status for this specific child
  const {
    verified: phoneVerified,
    childSmsEnabled,
    loading: phoneLoading,
  } = usePhoneStatus(null, childDoc);

  const handleSmsToggle = async (event) => {
    const newSmsEnabled = event.target.checked;

    if (!childDoc?.id) {
      showSnackbar("Child ID not available", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await updateChildSmsSettingsCallable({
        childId: childDoc.id,
        smsEnabled: newSmsEnabled,
      });

      console.log("SMS settings updated:", result.data);
      showSnackbar(result.data.message, "success");

      // Notify parent component of the change
      onSettingsUpdate({
        ...childDoc,
        settings: {
          ...(childDoc.settings || {}),
          notifications: {
            ...(childDoc.settings?.notifications || {}),
            smsEnabled: newSmsEnabled,
          },
        },
      });
    } catch (error) {
      console.error("Error updating SMS settings:", error);
      let message = "Failed to update SMS settings";

      if (error.code === "functions/permission-denied") {
        message = "You don't have permission to modify this child's settings";
      } else if (error.code === "functions/not-found") {
        message = "Child not found";
      } else if (error.message) {
        message = error.message;
      }

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Don't render anything while loading
  if (phoneLoading) {
    return null;
  }

  // If phone is not verified, show verification prompt
  if (!phoneVerified) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <MessageIcon />
            SMS Notifications for {childDoc?.name}
          </Typography>

          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button
                size="small"
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={() => navigate("/settings/messaging")}
              >
                Verify Phone
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Phone verification required:</strong> Verify your phone
              number first to enable SMS notifications for {childDoc?.name}.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Phone is verified, show SMS toggle
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <MessageIcon />
          SMS Notifications for {childDoc?.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          When enabled, SMS/WhatsApp messages will automatically be logged as
          care entries for this child.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={childSmsEnabled}
              onChange={handleSmsToggle}
              disabled={loading}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {childSmsEnabled
                  ? "SMS notifications enabled"
                  : "SMS notifications disabled"}
              </Typography>
              {loading && <CircularProgress size={16} />}
            </Box>
          }
        />

        {childSmsEnabled && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Active:</strong> Messages sent to your phone will be
              automatically logged for {childDoc?.name}. Use{" "}
              <strong>#{childDoc?.name?.toLowerCase()}</strong> in messages to
              route them to this child.
            </Typography>
          </Alert>
        )}
      </CardContent>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ChildSmsSettings;
