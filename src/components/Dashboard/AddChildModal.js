import React, { useState } from "react";
import {
  Box,
  Modal,
  TextField,
  Chip,
  IconButton,
  Typography,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AllergyChip from "../UI/Allergies";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../services/firebase";
import ChildPhotoUploader from "./ChildPhotoUploader";
import {
  ThemeCard,
  EnhancedLoadingButton,
  ThemeSpacing,
  ThemeText,
  CustomizableAutocomplete,
} from "../UI";
import { useAsyncForm } from "../../hooks/useAsyncForm";
import {
  CONDITION_OPTIONS,
  FOOD_ALLERGY_OPTIONS,
  DIETARY_OPTIONS,
  SENSORY_OPTIONS,
  TRIGGER_OPTIONS,
  SLEEP_OPTIONS,
  COMMUNICATION_OPTIONS,
} from "../../constants/childProfileOptions";

const AddChildModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation(["terms", "common"]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [sensoryIssues, setSensoryIssues] = useState([]);
  const [behavioralTriggers, setBehavioralTriggers] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [sleepIssues, setSleepIssues] = useState([]);
  const [communicationNeeds, setCommunicationNeeds] = useState([]);
  const storage = getStorage();

  // Use async form hook for child creation
  const childForm = useAsyncForm({
    onSuccess: () => {
      resetForm();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    },
    validate: ({ name, age }) => {
      if (!name?.trim()) {
        throw new Error(
          `Please enter the ${t("terms:profile_name").toLowerCase()}`
        );
      }
      if (!age?.trim()) {
        throw new Error(
          `Please enter the ${t("terms:profile_age").toLowerCase()}`
        );
      }
    },
  });


  const normalizeCondition = (item) => {
    if (typeof item === "string") {
      return { code: "OTHER", label: item, custom: true };
    }
    // If item is already an option object
    return item && item.label
      ? item
      : { code: "OTHER", label: String(item), custom: true };
  };

  // Handle the form submission
  const handleSubmit = () => {
    childForm.submitForm(
      async () => {
        let photoDownloadURL = "";

        // Upload photo if it exists
        if (photo) {
          const photoRef = ref(storage, `children/${photo.name}`);
          await uploadBytes(photoRef, photo);
          photoDownloadURL = await getDownloadURL(photoRef);
        }

        const conditionCodes = selectedConditions.map((c) => c.code);
        const currentUserId = getAuth().currentUser.uid;

        const newChild = {
          name,
          age,
          photoURL: photoDownloadURL,
          // REQUIRED by rules: members + active
          users: {
            care_owner: currentUserId, // User becomes Care Owner
            care_partners: [], // Empty array for Care Partners
            caregivers: [], // Empty array for Caregivers
            therapists: [], // Empty array for Therapists
            members: [currentUserId],
          },
          status: "active",
          settings: {
            allow_therapist_family_logs: false, // Default privacy setting
          },
          // Structured condition fields
          conditions: selectedConditions,
          conditionCodes,
          // Medical/Behavioral baseline for correlation analysis
          medicalProfile: {
            foodAllergies,
            dietaryRestrictions,
            sensoryIssues,
            behavioralTriggers,
            currentMedications,
            sleepIssues,
            communicationNeeds,
          },
        };

        // Save child to Firestore
        const docRef = await addDoc(collection(db, "children"), newChild);
        console.log("Child added to Firestore with ID:", docRef.id);

        return docRef;
      },
      { name, age }
    );
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setAge("");
    setPhoto(null);
    setPhotoURL(null);
    setSelectedConditions([]);
    setFoodAllergies([]);
    setDietaryRestrictions([]);
    setSensoryIssues([]);
    setBehavioralTriggers([]);
    setCurrentMedications([]);
    setSleepIssues([]);
    setCommunicationNeeds([]);
    childForm.reset();
  };

  // Handle modal close with form reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ThemeCard
          variant="modal"
          elevated
          sx={{ display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              pb: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {t("common:modal.add_new", { item: t("terms:profile_one") })}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {t("terms:create_profile_description")}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            {childForm.error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => childForm.clearError()}
              >
                {childForm.error}
              </Alert>
            )}
            <ThemeSpacing variant="modal-content">
              <ThemeSpacing variant="field">
                <TextField
                  label={t("terms:profile_name")}
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </ThemeSpacing>

              <ThemeSpacing variant="field">
                <TextField
                  label={t("terms:profile_age")}
                  variant="outlined"
                  fullWidth
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </ThemeSpacing>

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
                label="Primary Concerns / Diagnoses"
                addText="Add concern"
                helperText="Optional — select from list or add custom concerns"
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
                        color={undefined}
                        variant="filled"
                        sx={{
                          mr: 0.5,
                          backgroundColor: "#c8e6c9",
                          color: "#000",
                          "& .MuiChip-deleteIcon": { color: "#2e7d32" },
                        }}
                      />
                    )
                  )
                }
                sx={{ mb: 3 }}
              />

              {/* Medical & Behavioral Profile */}
              <ThemeText variant="section-header">
                📋 {t("terms:medical_behavioral_profile")}
              </ThemeText>
              <ThemeText variant="form-helper">
                This information helps us identify patterns and correlations in
                daily tracking
              </ThemeText>

              <CustomizableAutocomplete
                options={FOOD_ALLERGY_OPTIONS}
                value={foodAllergies}
                onChange={(event, newValue) => setFoodAllergies(newValue)}
                label="Food Allergies & Intolerances"
                addText="Add allergy"
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
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={DIETARY_OPTIONS}
                value={dietaryRestrictions}
                onChange={(event, newValue) => setDietaryRestrictions(newValue)}
                label="Dietary Restrictions"
                addText="Add diet"
                helperText="Special diets or restrictions they follow"
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={SENSORY_OPTIONS}
                value={sensoryIssues}
                onChange={(event, newValue) => setSensoryIssues(newValue)}
                label="Sensory Sensitivities"
                addText="Add sensitivity"
                helperText="Things they are sensitive to"
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={TRIGGER_OPTIONS}
                value={behavioralTriggers}
                onChange={(event, newValue) => setBehavioralTriggers(newValue)}
                label="Known Behavioral Triggers"
                addText="Add trigger"
                helperText="Situations or things that tend to cause challenges"
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={[]}
                value={currentMedications}
                onChange={(event, newValue) => setCurrentMedications(newValue)}
                label="Current Medications"
                addText="Add medication"
                helperText="List current medications and dosages"
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={SLEEP_OPTIONS}
                value={sleepIssues}
                onChange={(event, newValue) => setSleepIssues(newValue)}
                label="Sleep Issues"
                addText="Add sleep issue"
                helperText="Any sleep-related challenges"
                sx={{ mb: 3 }}
              />

              <CustomizableAutocomplete
                options={COMMUNICATION_OPTIONS}
                value={communicationNeeds}
                onChange={(event, newValue) => setCommunicationNeeds(newValue)}
                label="Communication Needs"
                addText="Add communication need"
                helperText="How they communicate best"
                sx={{ mb: 3 }}
              />

              {/* ChildPhotoUploader component */}
              <ChildPhotoUploader
                setPhoto={setPhoto}
                photoURL={photoURL}
                setPhotoURL={setPhotoURL}
              />
            </ThemeSpacing>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <EnhancedLoadingButton
              variant="success-gradient"
              loading={childForm.loading}
              loadingStyle="pulse"
              loadingText={`${t("common:actions.add")}ing ${t("terms:profile_one").toLowerCase()}...`}
              onClick={handleSubmit}
              fullWidth
              elevated
              size="large"
            >
              {t("common:actions.add")} {t("terms:profile_one")}
            </EnhancedLoadingButton>
          </Box>
        </ThemeCard>
      </Box>
    </Modal>
  );
};

export default AddChildModal;
