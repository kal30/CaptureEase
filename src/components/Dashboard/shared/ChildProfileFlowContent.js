import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CONDITION_OPTIONS,
  FOOD_ALLERGY_OPTIONS,
  DIETARY_OPTIONS,
  SENSORY_OPTIONS,
  TRIGGER_OPTIONS,
  COMMUNICATION_OPTIONS,
} from "../../../constants/childProfileOptions";
import colors from "../../../assets/theme/colors";
import AllergyChip from "../../UI/Allergies";
import ChildPhotoUploader from "../ChildPhotoUploader";
import { CustomizableAutocomplete } from "../../UI";

const ChildProfileFlowContent = ({
  mode = "create",
  stage,
  submitError,
  setSubmitError,
  documentError,
  setDocumentError,
  name,
  setName,
  age,
  setAge,
  setPhoto,
  photoURL,
  setPhotoURL,
  selectedConditions,
  setSelectedConditions,
  normalizeCondition,
  foodAllergies,
  setFoodAllergies,
  dietaryRestrictions,
  setDietaryRestrictions,
  sensoryIssues,
  setSensoryIssues,
  behavioralTriggers,
  setBehavioralTriggers,
  communicationNeeds,
  setCommunicationNeeds,
  renderDocumentDropZone,
  renderMedicationDetails,
  renderMedicationHeaderAction,
  medicationDetails = [],
  currentStep = 1,
  onStepChange,
  uploadedDocuments = { medical: [], medications: [], behavioral: [] },
  openSections = { medical: false, medications: false, behavioral: false },
  setOpenSections,
  createdChildName,
  profileProgress = 20,
  isSubmitting = false,
  onCreate,
  onFinish,
  onClose,
  t,
}) => {
  const isEditMode = mode === "edit";
  const safeUploadedDocuments = {
    medical: Array.isArray(uploadedDocuments?.medical) ? uploadedDocuments.medical : [],
    medications: Array.isArray(uploadedDocuments?.medications) ? uploadedDocuments.medications : [],
    behavioral: Array.isArray(uploadedDocuments?.behavioral) ? uploadedDocuments.behavioral : [],
  };
  const stepLabels = ["Basics", "Health", "Medication Management", "Behavioral", "Finish"];
  const activeStep = currentStep || 1;

  const canNavigate = () => true;

  const stepFrameSx = {
    px: 0,
    py: 0.25,
    border: "none",
    borderRadius: 0,
    bgcolor: "transparent",
    boxShadow: "none",
    outline: "none",
  };

  const renderStepTabs = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: { xs: 0.4, sm: 0.75 },
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        pb: 0.35,
        pr: { xs: 0.5, sm: 0 },
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        scrollSnapType: "x proximity",
        scrollbarWidth: "none",
        position: "sticky",
        top: 0,
        zIndex: 2,
        backgroundColor: "background.paper",
        pt: 0.5,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {stepLabels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isDone = stepNumber < activeStep;
        const navigable = canNavigate(stepNumber);

        return (
          <Chip
            key={label}
            label={`${stepNumber}. ${label}`}
            size="small"
            clickable={navigable}
            onClick={navigable ? () => onStepChange?.(stepNumber) : undefined}
            variant={isActive ? "filled" : "outlined"}
            sx={{
              borderRadius: 999,
              flex: "0 0 auto",
              minHeight: 30,
              px: { xs: 0.25, sm: 0.5 },
              fontSize: { xs: "0.72rem", sm: "0.78rem" },
              whiteSpace: "nowrap",
              scrollSnapAlign: "start",
              fontWeight: 800,
              cursor: navigable ? "pointer" : "default",
              bgcolor: isActive
                ? colors.landing.sageLight
                : isDone
                  ? colors.landing.borderLight
                  : "transparent",
              color: colors.brand.navy,
              borderColor: isActive ? colors.brand.ink : colors.landing.borderLight,
              opacity: navigable ? 1 : 0.6,
              "&:hover": {
                bgcolor: isActive
                  ? colors.landing.sageLight
                  : isDone
                    ? colors.landing.borderLight
                    : "rgba(244, 241, 248, 0.84)",
                borderColor: colors.brand.ink,
              },
            }}
          />
        );
      })}
    </Box>
  );

  const renderShell = (title, subtitle, content, options = {}) => {
    const { flat = false, headerAction = null } = options;

    return (
      <Stack
        spacing={flat ? 1.1 : 1.25}
        sx={
          flat
            ? {
                px: 0,
                py: { xs: 0, sm: 0.15 },
              }
            : stepFrameSx
        }
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: colors.brand.navy, lineHeight: 1.08 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.3 }}>
              {subtitle}
            </Typography>
          ) : null}
          {headerAction ? (
            <Box sx={{ mt: 0.35 }}>
              {headerAction}
            </Box>
          ) : null}
        </Box>

        {content}
      </Stack>
    );
  };

  const renderStepAlerts = () => (
    <Stack spacing={1.25}>
      {submitError ? (
        <Alert severity="error" onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      ) : null}
      {documentError ? (
        <Alert severity="warning" onClose={() => setDocumentError("")}>
          {documentError}
        </Alert>
      ) : null}
    </Stack>
  );

  const renderBasicsStep = () =>
    renderShell(
      "Basics",
      isEditMode
        ? "Update the basics first, then continue into medical and behavioral details."
        : "Start with the basics. You can add the rest later if you want.",
      <Stack spacing={1.6}>
        {renderStepAlerts()}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 0.9fr) minmax(0, 1.1fr)" },
            gap: { xs: 2, md: 2.5 },
            alignItems: "start",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, color: colors.brand.navy, mb: 1 }}>
              Photo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optional, but helpful for fast recognition.
            </Typography>
            <Box sx={{ mt: 1.75 }}>
              <ChildPhotoUploader
                setPhoto={setPhoto}
                photoURL={photoURL}
                setPhotoURL={setPhotoURL}
                label=""
              />
            </Box>
          </Box>

          <Stack spacing={2}>
            <TextField
              label={t("terms:profile_name")}
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <TextField
              label={`${t("terms:profile_age")} / DOB`}
              variant="outlined"
              fullWidth
              value={age}
              onChange={(e) => setAge(e.target.value)}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              helperText="Use age now. You can refine the profile later."
            />

            <CustomizableAutocomplete
              options={CONDITION_OPTIONS}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
              value={selectedConditions}
              onChange={(event, newValue) => {
                const normalized = newValue.map(normalizeCondition);
                setSelectedConditions(normalized);
              }}
              label="Primary concerns (optional)"
              addText="Add concern"
              helperText="Optional. Add the main things you want to remember."
              renderTags={(value, getTagProps) =>
                value.map((option, index) =>
                  option.custom ? (
                    <Chip
                      {...getTagProps({ index })}
                      label={option.label}
                      color="default"
                      variant="outlined"
                      sx={{ mr: 0.5 }}
                    />
                  ) : (
                    <Chip
                      {...getTagProps({ index })}
                      label={option.label}
                      variant="filled"
                      sx={{
                        mr: 0.5,
                        backgroundColor: colors.landing.sageLight,
                        color: colors.brand.navy,
                        "& .MuiChip-deleteIcon": { color: colors.brand.ink },
                      }}
                    />
                  )
                )
              }
            />
          </Stack>
        </Box>
      </Stack>
    );

  const renderHealthStep = () =>
    renderShell(
      "Health",
      "Food allergies and dietary restrictions live here.",
      <Stack spacing={1.6}>
        {renderStepAlerts()}

        <CustomizableAutocomplete
          options={FOOD_ALLERGY_OPTIONS}
          value={foodAllergies}
          onChange={(event, newValue) => setFoodAllergies(newValue)}
          label="Food allergies / intolerances"
          addText="Add allergy"
          helperText="Add anything they should avoid."
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <AllergyChip
                key={index}
                allergy={option}
                variant="compact"
                inForm={true}
                {...getTagProps({ index })}
              />
            ))
          }
        />

        <CustomizableAutocomplete
          options={DIETARY_OPTIONS}
          value={dietaryRestrictions}
          onChange={(event, newValue) => setDietaryRestrictions(newValue)}
          label="Dietary restrictions"
          addText="Add diet"
          helperText="Any routine diet rules or restrictions."
        />
      </Stack>
    );

  const renderMedicationStep = () =>
    renderShell(
      "Medication Management",
      "Add or edit medications here. Daily logging lives in the log screen.",
      <Stack spacing={1.2}>
        {renderStepAlerts()}
        {renderMedicationDetails?.()}
      </Stack>
    , {
      flat: true,
      headerAction: renderMedicationHeaderAction?.(),
    });

  const renderBehavioralStep = () =>
    renderShell(
      "Behavioral",
      "Sensory needs, triggers, and communication live together.",
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.2fr) minmax(240px, 0.8fr)" }, gap: 1.5, alignItems: "start" }}>
        <Stack spacing={1.6}>
          {renderStepAlerts()}

          <CustomizableAutocomplete
            options={SENSORY_OPTIONS}
            value={sensoryIssues}
            onChange={(event, newValue) => setSensoryIssues(newValue)}
            label="Sensory needs"
            addText="Add sensitivity"
            helperText="Things that can be hard or uncomfortable."
          />

          <CustomizableAutocomplete
            options={TRIGGER_OPTIONS}
            value={behavioralTriggers}
            onChange={(event, newValue) => setBehavioralTriggers(newValue)}
            label="Known triggers"
            addText="Add trigger"
            helperText="Things that often lead to stress or a big reaction."
          />

          <CustomizableAutocomplete
            options={COMMUNICATION_OPTIONS}
            value={communicationNeeds}
            onChange={(event, newValue) => setCommunicationNeeds(newValue)}
            label="Communication needs"
            addText="Add communication need"
            helperText="How they communicate best."
          />
        </Stack>

        <Box
          sx={{
            p: 1.75,
            borderRadius: 3,
            bgcolor: "rgba(243, 232, 255, 0.34)",
            border: "1px solid rgba(217, 209, 238, 0.66)",
            color: colors.brand.navy,
            minHeight: 164,
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 0.75 }}>Documents</Typography>
          {safeUploadedDocuments.behavioral.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Optional behavioral documents can stay attached here.
              </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.25 }}>
              {safeUploadedDocuments.behavioral.map((docItem) => (
                <Chip key={`${docItem.name}-${docItem.uploadedAt}`} label={docItem.name} />
              ))}
            </Stack>
            </>
          ) : (
            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.72)",
                border: "1px dashed rgba(217, 209, 238, 0.9)",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: colors.brand.navy, lineHeight: 1.15 }}>
                No behavioral docs yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.3 }}>
                Add an evaluation, plan, or note when you need it.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );

  const renderReviewCard = (title, summary, stepNumber) => (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 3,
        border: "1px solid rgba(217, 209, 238, 0.82)",
        bgcolor: "rgba(255,255,255,0.92)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.35 }}>
          {summary}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="text"
        onClick={() => onStepChange?.(stepNumber)}
        sx={{ textTransform: "none", fontWeight: 700, flexShrink: 0, minHeight: 32, px: 0.75 }}
      >
        Edit
      </Button>
    </Box>
  );

  const renderFinishStep = () => {
    const activeMedicationCount = Array.isArray(medicationDetails)
      ? medicationDetails.filter((entry) => entry?.name && !entry.isArchived).length
      : 0;
    const healthSummary = [
      foodAllergies.length ? `${foodAllergies.length} allergy${foodAllergies.length === 1 ? "" : "ies"}` : "No allergies",
      dietaryRestrictions.length ? `${dietaryRestrictions.length} diet restriction${dietaryRestrictions.length === 1 ? "" : "s"}` : "No diet restrictions",
    ].join(" • ");
    const behavioralSummary = [
      sensoryIssues.length ? `${sensoryIssues.length} sensory need${sensoryIssues.length === 1 ? "" : "s"}` : "No sensory notes",
      behavioralTriggers.length ? `${behavioralTriggers.length} trigger${behavioralTriggers.length === 1 ? "" : "s"}` : "No triggers",
      communicationNeeds.length ? `${communicationNeeds.length} communication note${communicationNeeds.length === 1 ? "" : "s"}` : "No communication notes",
    ].join(" • ");

    return renderShell(
      "Finish",
      "Review the sections below before you continue.",
      <Stack spacing={1}>
        {renderStepAlerts()}
        {renderReviewCard(
          "Basics",
          [name || "No name yet", age || "No age yet", selectedConditions.length ? `${selectedConditions.length} concern${selectedConditions.length === 1 ? "" : "s"}` : "No concerns"].join(" • "),
          1
        )}
        {renderReviewCard("Health", healthSummary, 2)}
        {renderReviewCard(
          "Medication Management",
          `${activeMedicationCount} active medication${activeMedicationCount === 1 ? "" : "s"}`,
          3
        )}
        {renderReviewCard("Behavioral", behavioralSummary, 4)}
      </Stack>
    );
  };

  const renderActiveStep = () => {
    switch (activeStep) {
      case 2:
        return renderHealthStep();
      case 3:
        return renderMedicationStep();
      case 4:
        return renderBehavioralStep();
      case 5:
        return renderFinishStep();
      default:
        return renderBasicsStep();
    }
  };

  return (
    <Stack spacing={1.5}>
      {renderStepTabs()}
      {renderActiveStep()}
    </Stack>
  );
};

export default ChildProfileFlowContent;
