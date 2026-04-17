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
  const activeStep = currentStep || 1;
  const getLabel = (item) => {
    if (typeof item === "string") {
      return item;
    }

    return item?.label || item?.name || item?.title || String(item || "");
  };

  const listSummary = (items, emptyLabel = "None") => {
    const values = Array.isArray(items) ? items.map(getLabel).filter(Boolean) : [];
    return values.length ? values.join(" • ") : emptyLabel;
  };

  const stepFrameSx = {
    px: 0,
    py: 0.25,
    border: "none",
    borderRadius: 0,
    bgcolor: "transparent",
    boxShadow: "none",
    outline: "none",
  };

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

  const renderReviewRow = (label, value) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 160px) minmax(0, 1fr)" },
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontSize: "0.83rem", fontWeight: 800, color: colors.brand.navy }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.35, wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Box>
  );

  const renderReviewCard = (title, stepNumber, content) => (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 3,
        border: "1px solid rgba(217, 209, 238, 0.82)",
        bgcolor: "rgba(255,255,255,0.92)",
      }}
    >
      <Stack spacing={1.15}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }}>{title}</Typography>
          <Button
            size="small"
            variant="text"
            onClick={() => onStepChange?.(stepNumber)}
            sx={{ textTransform: "none", fontWeight: 700, flexShrink: 0, minHeight: 32, px: 0.75 }}
          >
            Edit
          </Button>
        </Stack>
        <Stack spacing={0.9}>
          {content}
        </Stack>
      </Stack>
    </Box>
  );

  const renderReviewStep = () => {
    const activeMedicationDetails = Array.isArray(medicationDetails)
      ? medicationDetails.filter((entry) => entry?.name && !entry.isArchived)
      : [];
    const activeMedicationNames = activeMedicationDetails.map((entry) => entry.name).filter(Boolean);
    const medicalDocuments = safeUploadedDocuments.medical.map((docItem) => docItem.name).filter(Boolean);
    const medicationDocuments = safeUploadedDocuments.medications.map((docItem) => docItem.name).filter(Boolean);
    const behavioralDocuments = safeUploadedDocuments.behavioral.map((docItem) => docItem.name).filter(Boolean);

    return renderShell(
      "Review Profile",
      "Review everything below before completing.",
      <Stack spacing={1}>
        {renderStepAlerts()}

        {renderReviewCard(
          "Basics",
          1,
          <>
            {renderReviewRow("Name", name || "Not set")}
            {renderReviewRow("Age / DOB", age || "Not set")}
            {renderReviewRow("Concerns", listSummary(selectedConditions, "None"))}
            {renderReviewRow("Photo", photoURL ? "Added" : "Not added")}
          </>
        )}

        {renderReviewCard(
          "Health",
          2,
          <>
            {renderReviewRow("Food allergies", listSummary(foodAllergies, "None"))}
            {renderReviewRow("Dietary restrictions", listSummary(dietaryRestrictions, "None"))}
            {renderReviewRow("Health documents", listSummary(medicalDocuments, "None"))}
          </>
        )}

        {renderReviewCard(
          "Medication Management",
          3,
          <>
            {renderReviewRow("Active medications", activeMedicationNames.length ? listSummary(activeMedicationNames) : "None")}
            {renderReviewRow("Medication documents", listSummary(medicationDocuments, "None"))}
          </>
        )}

        {renderReviewCard(
          "Behavior",
          4,
          <>
            {renderReviewRow("Sensory needs", listSummary(sensoryIssues, "None"))}
            {renderReviewRow("Known triggers", listSummary(behavioralTriggers, "None"))}
            {renderReviewRow("Communication needs", listSummary(communicationNeeds, "None"))}
            {renderReviewRow("Behavior documents", listSummary(behavioralDocuments, "None"))}
          </>
        )}
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
        return renderReviewStep();
      default:
        return renderBasicsStep();
    }
  };

  return (
    <Stack spacing={1.5}>
      {renderActiveStep()}
    </Stack>
  );
};

export default ChildProfileFlowContent;
