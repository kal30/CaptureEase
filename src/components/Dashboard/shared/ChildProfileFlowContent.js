import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { EnhancedLoadingButton, CustomizableAutocomplete } from "../../UI";
import AllergyChip from "../../UI/Allergies";
import ChildPhotoUploader from "../ChildPhotoUploader";
import {
  CONDITION_OPTIONS,
  FOOD_ALLERGY_OPTIONS,
  DIETARY_OPTIONS,
  SENSORY_OPTIONS,
  TRIGGER_OPTIONS,
  COMMUNICATION_OPTIONS,
} from "../../../constants/childProfileOptions";
import colors from "../../../assets/theme/colors";

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
  const stepLabels = [
    "Basics",
    "Health",
    "Medication",
    "Behavioral",
    "Finish",
  ];
  const activeStep = stage === "intake"
    ? 1
    : openSections?.medical
      ? 2
      : openSections?.medications
        ? 3
        : openSections?.behavioral
          ? 4
          : 5;

  const renderStepIndicator = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        p: 1,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: colors.landing.surface,
      }}
    >
      {stepLabels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isDone = stepNumber < activeStep;

        return (
          <Chip
            key={label}
            label={`${stepNumber}. ${label}`}
            size="small"
            variant={isActive ? "filled" : "outlined"}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              bgcolor: isActive
                ? colors.landing.sageLight
                : isDone
                  ? colors.landing.borderLight
                  : "transparent",
              color: colors.brand.navy,
              borderColor: isActive ? colors.brand.ink : colors.landing.borderLight,
            }}
          />
        );
      })}
    </Box>
  );

  const intakeContent = (
    <Stack spacing={3}>
      {submitError ? (
        <Alert severity="error" onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      ) : null}
      <Alert severity="info">
        {isEditMode
          ? "Update the basics first, then continue into medical and behavioral details."
          : "Start with the basics. You can add allergies, meds, triggers, and documents right after creation."}
      </Alert>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 0.9fr) minmax(0, 1.1fr)" },
          gap: { xs: 2.5, md: 3 },
          alignItems: "start",
        }}
      >
        <Box>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 14px 32px rgba(60, 72, 88, 0.05)",
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 800 }}>Photo</Typography>
              <Typography variant="body2" color="text.secondary">
                Optional, but helpful for fast recognition.
              </Typography>
            </Stack>
            <Box sx={{ mt: 2 }}>
              <ChildPhotoUploader
                setPhoto={setPhoto}
                photoURL={photoURL}
                setPhotoURL={setPhotoURL}
                label=""
              />
            </Box>
          </Box>
        </Box>

        <Stack spacing={2.2}>
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
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.label
            }
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

  const setupContent = (
    <Stack spacing={3}>
      {submitError ? (
        <Alert severity="error" onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      ) : null}

      <Alert severity="success">
        {isEditMode
          ? "Profile basics saved. Continue into medical and behavioral details."
          : "Profile Created! Add more details at your leisure."}
      </Alert>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography sx={{ fontWeight: 800 }}>
          {createdChildName || name}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <LinearProgress variant="determinate" value={profileProgress} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? "editing" : `${profileProgress}% complete`}
        </Typography>
      </Box>

      {documentError ? (
        <Alert severity="warning" onClose={() => setDocumentError("")}>
          {documentError}
        </Alert>
      ) : null}

      <Stack spacing={2.5}>
        <Accordion
          expanded={openSections.medical}
          onChange={() =>
            setOpenSections((current) => ({
              ...current,
              medical: !current.medical,
            }))
          }
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", width: "100%" }}>
              <Typography sx={{ fontWeight: 800 }}>Health Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Food allergies, dietary restrictions, and related notes.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
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

            {safeUploadedDocuments.medical.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                  Uploaded medical documents
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {safeUploadedDocuments.medical.map((docItem) => (
                    <Chip key={`${docItem.name}-${docItem.uploadedAt}`} label={docItem.name} />
                  ))}
                </Stack>
              </Box>
            ) : null}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={openSections.medications}
          onChange={() =>
            setOpenSections((current) => ({
              ...current,
              medications: !current.medications,
            }))
          }
          >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", width: "100%" }}>
              <Typography sx={{ fontWeight: 800 }}>Medication List</Typography>
              <Typography variant="body2" color="text.secondary">
                Prescription meds, supplements, and dosage.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {renderMedicationDetails()}

              {safeUploadedDocuments.medications.length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                    Uploaded medication documents
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {safeUploadedDocuments.medications.map((docItem) => (
                      <Chip key={`${docItem.name}-${docItem.uploadedAt}`} label={docItem.name} />
                    ))}
                  </Stack>
                </Box>
              ) : null}

              <Box sx={{ pt: 1 }}>
                {renderDocumentDropZone(
                  "medications",
                  "Attach a document",
                  "Drop a prescription, dosage sheet, or doctor's note here."
                )}
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={openSections.behavioral}
          onChange={() =>
            setOpenSections((current) => ({
              ...current,
              behavioral: !current.behavioral,
            }))
          }
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", width: "100%" }}>
              <Typography sx={{ fontWeight: 800 }}>Behavioral Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Sensory needs, triggers, and related docs.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.2fr) minmax(240px, 0.8fr)" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Stack spacing={2}>
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

              {renderDocumentDropZone(
                "behavioral",
                "Document drop",
                "Drag and drop an IEP or evaluation here."
              )}
            </Box>

            {safeUploadedDocuments.behavioral.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                  Uploaded behavioral documents
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {safeUploadedDocuments.behavioral.map((docItem) => (
                    <Chip key={`${docItem.name}-${docItem.uploadedAt}`} label={docItem.name} />
                  ))}
                </Stack>
              </Box>
            ) : null}
          </AccordionDetails>
        </Accordion>
      </Stack>

      <Box sx={{ pt: 1 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? "Review and save the updates when you are ready."
            : "You can keep adding details now or move straight to the dashboard."}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <>
      {renderStepIndicator()}
      {stage === "intake" ? intakeContent : setupContent}

      <Stack spacing={1.25}>
        {stage === "intake" ? (
        <EnhancedLoadingButton
          variant="success-gradient"
          loading={isSubmitting}
          loadingStyle="pulse"
          loadingText={isEditMode ? "Saving profile..." : "Creating profile..."}
          onClick={onCreate}
          fullWidth
          elevated
          size="large"
        >
          {isEditMode ? "Save & Continue" : "Create & Start Logging"}
        </EnhancedLoadingButton>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={onFinish}
            fullWidth
            sx={{ py: 1.35, textTransform: "none", borderRadius: 2 }}
          >
            {isEditMode ? "Save Changes" : "Skip to Dashboard"}
          </Button>
          <Button
            variant="text"
            onClick={onClose}
            fullWidth
            sx={{ textTransform: "none" }}
          >
            {isEditMode ? "Close without saving" : "Close and keep editing later"}
          </Button>
        </>
      )}
      </Stack>
    </>
  );
};

export default ChildProfileFlowContent;
