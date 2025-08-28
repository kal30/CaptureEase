import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IncidentTypeSelector from "./IncidentTypeSelector";
import IncidentQuickCapture from "./IncidentQuickCapture";
import OtherIncidentCapture from "./OtherIncidentCapture";
import { INCIDENT_TYPES } from "../../services/incidentService";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IncidentLoggingModal = ({ open, onClose, childId, childName }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = type selection, 2 = quick capture
  const [selectedIncidentType, setSelectedIncidentType] = useState(null);

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep(1);
    setSelectedIncidentType(null);
    onClose();
  };

  const handleTypeSelect = (incidentType) => {
    setSelectedIncidentType(incidentType);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setSelectedIncidentType(null);
  };

  const handleIncidentSaved = () => {
    // Reset and close after successful save
    setCurrentStep(1);
    setSelectedIncidentType(null);
    onClose();
  };

  const handleCategoryCreated = () => {
    // When a category is created, we need to refresh the incident type selector
    // by resetting to step 1 and clearing selection
    setCurrentStep(1);
    setSelectedIncidentType(null);
    // The modal stays open so user can see the new category
  };

  const getStepTitle = () => {
    if (currentStep === 1) {
      return `What is happening ${childName}`;
    }
    const typeConfig = INCIDENT_TYPES[selectedIncidentType];
    if (!typeConfig) {
      console.warn('No incident type config found for:', selectedIncidentType);
      return `Incident - ${childName}`;
    }
    return `${typeConfig.emoji || '📝'} ${typeConfig.label} - ${childName}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: window.innerWidth < 600 ? 0 : 2,
          minHeight: window.innerWidth < 600 ? "100vh" : "60vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fafbfc",
          color: "#1f2937",
          py: 3,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {currentStep === 2 && (
            <IconButton
              aria-label="back"
              onClick={handleBack}
              sx={{
                color: "#6b7280",
                "&:hover": {
                  bgcolor: "#f3f4f6",
                  color: "#374151",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            {getStepTitle()}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "#6b7280",
            "&:hover": {
              bgcolor: "#f3f4f6",
              color: "#374151",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: "#fafbfc" }}>
        {currentStep === 1 && (
          <IncidentTypeSelector
            key={`incident-selector-${Date.now()}`} // Force remount to reload categories
            onTypeSelect={handleTypeSelect}
            onClose={handleClose}
            childId={childId}
          />
        )}

        {currentStep === 2 && selectedIncidentType && (
          <>
            {(selectedIncidentType === "OTHER" || selectedIncidentType.startsWith("CUSTOM_")) ? (
              <OtherIncidentCapture
                childId={childId}
                childName={childName}
                onBack={handleBack}
                onSaved={handleIncidentSaved}
                onClose={handleClose}
                onCategoryCreated={handleCategoryCreated}
                isCustomCategory={selectedIncidentType.startsWith("CUSTOM_")}
                customCategoryType={selectedIncidentType}
              />
            ) : (
              <IncidentQuickCapture
                incidentType={selectedIncidentType}
                childId={childId}
                childName={childName}
                onBack={handleBack}
                onSaved={handleIncidentSaved}
                onClose={handleClose}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncidentLoggingModal;
