import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTheme } from "@mui/material/styles"; // Import useTheme
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import ChildPhotoUploader from "./ChildPhotoUploader";
import { ThemeCard, GradientButton } from "../UI";

const EditChildModal = ({ open, onClose, child, onSuccess, userRole }) => {
  const theme = useTheme(); // Get the theme object
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [sensoryIssues, setSensoryIssues] = useState([]);
  const [behavioralTriggers, setBehavioralTriggers] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [sleepIssues, setSleepIssues] = useState([]);
  const [communicationNeeds, setCommunicationNeeds] = useState([]);
  const storage = getStorage();

  // Permission checks
  const canEdit = userRole === 'primary_parent' || userRole === 'co_parent' || userRole === 'parent';
  const canEditMedicalInfo = userRole === 'primary_parent' || userRole === 'co_parent'; // More restrictive for medical data

  const CONDITION_OPTIONS = [
    { code: "ASD", label: "Autism / ASD" },
    { code: "ADHD", label: "ADHD" },
    { code: "SPEECH", label: "Speech / Language" },
    { code: "LEARN", label: "Learning Differences" },
    { code: "MEDICAL", label: "Medical (e.g., epilepsy, diabetes)" },
    { code: "BEHAVIOR", label: "Behavioral / Emotional" },
  ];

  const FOOD_ALLERGY_OPTIONS = [
    "Dairy/Milk", "Gluten/Wheat", "Nuts", "Eggs", "Soy", "Shellfish", 
    "Fish", "Sesame", "Food dyes", "Artificial sweeteners", "Citrus", "Chocolate"
  ];

  const DIETARY_OPTIONS = [
    "Gluten-free", "Dairy-free", "Sugar-limited", "Low-FODMAP", 
    "Casein-free", "Dye-free", "Organic only", "Limited processed foods"
  ];

  const SENSORY_OPTIONS = [
    "Sound sensitivity", "Light sensitivity", "Touch/texture issues", 
    "Smell sensitivity", "Taste sensitivity", "Movement sensitivity", 
    "Clothing/fabric issues", "Temperature sensitivity"
  ];

  const TRIGGER_OPTIONS = [
    "Loud noises", "Crowds", "Bright lights", "Transitions/changes", 
    "Hunger", "Fatigue", "Overstimulation", "Certain foods", 
    "Screen time limits", "Social situations", "New environments"
  ];

  const SLEEP_OPTIONS = [
    "Difficulty falling asleep", "Frequent night waking", "Early morning waking", 
    "Restless sleep", "Needs specific routine", "Sensory needs for sleep", 
    "Nightmares/night terrors", "Sleep walking"
  ];

  const COMMUNICATION_OPTIONS = [
    "Nonverbal", "Limited verbal", "Uses AAC device", "Sign language", 
    "Picture cards", "Needs extra processing time", "Echolalia", 
    "Difficulty with social communication"
  ];

  useEffect(() => {
    if (child) {
      setName(child.name || "");
      setAge(child.age || "");
      setPhotoURL(child.photoURL || null);
      setSelectedConditions(child.concerns || child.conditions || []);
      
      // Load medical profile if it exists
      const medicalProfile = child.medicalProfile || {};
      setFoodAllergies(medicalProfile.foodAllergies || []);
      setDietaryRestrictions(medicalProfile.dietaryRestrictions || []);
      setSensoryIssues(medicalProfile.sensoryIssues || []);
      setBehavioralTriggers(medicalProfile.behavioralTriggers || []);
      setCurrentMedications(medicalProfile.currentMedications || []);
      setSleepIssues(medicalProfile.sleepIssues || []);
      setCommunicationNeeds(medicalProfile.communicationNeeds || []);
    }
  }, [child]);

  const normalizeCondition = (item) => {
    if (typeof item === "string") {
      return { code: "OTHER", label: item, custom: true };
    }
    return item && item.label
      ? item
      : { code: "OTHER", label: String(item), custom: true };
  };

  const filter = createFilterOptions({
    stringify: (option) => (typeof option === "string" ? option : option.label),
  });

  const handleSubmit = async () => {
    if (!name || !age || !child) return;
    
    // Security check - ensure user has permission to edit
    if (!canEdit) {
      console.error('Unauthorized edit attempt');
      return;
    }

    setLoading(true);
    let photoDownloadURL = child.photoURL;

    if (photo) {
      try {
        const photoRef = ref(storage, `children/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoDownloadURL = await getDownloadURL(photoRef);
      } catch (error) {
        console.error("Error uploading photo:", error);
        setLoading(false);
        return;
      }
    }

    const primaryLabel = selectedConditions[0]?.label || "";
    const conditionCodes = selectedConditions.map((c) => c.code);

    const updatedChild = {
      name,
      age,
      photoURL: photoDownloadURL,
      diagnosis: primaryLabel,
      concerns: selectedConditions,
      conditionCodes,
    };

    // Only include medical profile if user has permission to edit it
    if (canEditMedicalInfo) {
      updatedChild.medicalProfile = {
        foodAllergies,
        dietaryRestrictions,
        sensoryIssues,
        behavioralTriggers,
        currentMedications,
        sleepIssues,
        communicationNeeds,
      };
    }

    try {
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, updatedChild);
      onSuccess?.(); // Call success callback to refresh data
      onClose();
    } catch (error) {
      console.error("Error updating child:", error);
    } finally {
      setLoading(false);
    }
  };

  // Security check - only parents can edit
  if (!canEdit) {
    console.warn('EditChildModal: User does not have permission to edit child details');
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: '90vw', sm: 500, md: 600 },
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ThemeCard variant="modal" elevated sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Edit {child?.name || 'Child'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update your child's information and care profile
          </Typography>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* Basic Information Section */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
            Basic Information
          </Typography>

          <TextField
          label="Child's Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Child's Age"
          variant="outlined"
          fullWidth
          value={age}
          onChange={(e) => setAge(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Autocomplete
          multiple
          freeSolo
          options={CONDITION_OPTIONS}
          filterOptions={(opts, params) => filter(opts, params)}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          value={selectedConditions}
          onChange={(event, newValue) => {
            const normalized = newValue.map(normalizeCondition);
            setSelectedConditions(normalized);
          }}
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
          renderInput={(params) => (
            <TextField
              {...params}
              label="Primary Concerns / Diagnoses"
              variant="outlined"
              helperText="Optional — pick from list or type your own, then press Enter"
              sx={{ mb: 3 }}
            />
          )}
        />

        <ChildPhotoUploader
          setPhoto={setPhoto}
          photoURL={photoURL}
          setPhotoURL={setPhotoURL}
        />

          {/* Medical & Behavioral Profile Section - Only for Primary/Co-Parents */}
          {canEditMedicalInfo && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Medical & Behavioral Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This information helps us understand your child's specific needs and identify patterns in their behavior and wellbeing.
              </Typography>
            </Box>
          )}

          {canEditMedicalInfo && (
            <Autocomplete
              multiple
              freeSolo
              options={FOOD_ALLERGY_OPTIONS}
              value={foodAllergies}
              onChange={(event, newValue) => setFoodAllergies(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Food Allergies & Sensitivities"
                  variant="outlined"
                  helperText="Select from list or add your own"
                  sx={{ mb: 3 }}
                />
              )}
            />
          )}

          {canEditMedicalInfo && (
            <>
              <Autocomplete
                multiple
                freeSolo
                options={DIETARY_OPTIONS}
                value={dietaryRestrictions}
                onChange={(event, newValue) => setDietaryRestrictions(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Dietary Restrictions"
                    variant="outlined"
                    helperText="Special diets or food preferences"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={SENSORY_OPTIONS}
                value={sensoryIssues}
                onChange={(event, newValue) => setSensoryIssues(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sensory Issues"
                    variant="outlined"
                    helperText="Light, sound, touch, or other sensitivities"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={TRIGGER_OPTIONS}
                value={behavioralTriggers}
                onChange={(event, newValue) => setBehavioralTriggers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Behavioral Triggers"
                    variant="outlined"
                    helperText="Situations that may cause stress or behavioral changes"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={currentMedications}
                onChange={(event, newValue) => setCurrentMedications(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Current Medications"
                    variant="outlined"
                    helperText="List any current medications and dosages"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={SLEEP_OPTIONS}
                value={sleepIssues}
                onChange={(event, newValue) => setSleepIssues(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sleep Issues"
                    variant="outlined"
                    helperText="Any sleep challenges or patterns"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={COMMUNICATION_OPTIONS}
                value={communicationNeeds}
                onChange={(event, newValue) => setCommunicationNeeds(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Communication Needs"
                    variant="outlined"
                    helperText="How your child communicates and any support they need"
                    sx={{ mb: 3 }}
                  />
                )}
              />
            </>
          )}

        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <GradientButton
            variant="gradient"
            color="success"
            onClick={handleSubmit}
            fullWidth
            disabled={loading}
            elevated
            size="large"
          >
            {loading ? "Saving..." : "Save Changes"}
          </GradientButton>
        </Box>
        </ThemeCard>
      </Box>
    </Modal>
  );
};

export default EditChildModal;