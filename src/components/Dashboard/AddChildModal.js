import React, { useState } from "react";
import { Box, Modal, TextField, Chip, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import AllergyChip from "../UI/Allergies";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firestore functions
import { db } from "../../services/firebase"; // Adjust the path based on your structure
import ChildPhotoUploader from "./ChildPhotoUploader"; // Import the ChildPhotoUploader component
import { ThemeCard, GradientButton, ThemeSpacing, ThemeText, CustomizableAutocomplete } from "../UI";

const AddChildModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null); // State for photo file
  const [photoURL, setPhotoURL] = useState(null); // State for photo URL
  const [loading, setLoading] = useState(false); // State to manage loading
  const [selectedConditions, setSelectedConditions] = useState([]); // [{ code, label, custom? }]
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [sensoryIssues, setSensoryIssues] = useState([]);
  const [behavioralTriggers, setBehavioralTriggers] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [sleepIssues, setSleepIssues] = useState([]);
  const [communicationNeeds, setCommunicationNeeds] = useState([]);
  const storage = getStorage();

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
  const handleSubmit = async () => {
    if (!name || !age) return; // Ensure both name and age are provided

    setLoading(true); // Start loading state
    let photoDownloadURL = "";

    // Upload photo if it exists
    if (photo) {
      try {
        const photoRef = ref(storage, `children/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoDownloadURL = await getDownloadURL(photoRef); // Get the download URL of the photo
      } catch (error) {
        console.error("Error uploading photo:", error);
        setLoading(false);
        return;
      }
    }

    const conditionCodes = selectedConditions.map((c) => c.code);

    // Create the new child object
    const currentUserId = getAuth().currentUser.uid;
    
    const newChild = {
      name,
      age,
      photoURL: photoDownloadURL,
      // Role-based user structure
      users: {
        parent: currentUserId,
        co_parents: [],
        family_members: [],
        caregivers: [],
        therapists: []
      },
      // Structured condition fields
      conditions: selectedConditions, // [{code,label,custom?}]
      conditionCodes, // ["ASD", "OTHER", ...]
      // Medical/Behavioral baseline for correlation analysis
      medicalProfile: {
        foodAllergies,
        dietaryRestrictions,
        sensoryIssues,
        behavioralTriggers,
        currentMedications,
        sleepIssues,
        communicationNeeds
      }
    };

    try {
      // Save child to Firestore
      const docRef = await addDoc(collection(db, "children"), newChild);
      console.log("Child added to Firestore with ID:", docRef.id);

      // Call success callback to refresh the children list
      if (onSuccess) {
        onSuccess();
      } else {
        onClose(); // Close the modal if no success callback
      }
      resetForm(); // Reset form fields after submission
    } catch (error) {
      console.error("Error saving child:", error);
    } finally {
      setLoading(false); // Stop loading state
    }
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <ThemeCard variant="modal" elevated sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Add New Child
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Create a profile for your child with care information
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <ThemeSpacing variant="modal-content">

            <ThemeSpacing variant="field">
              <TextField
                label="Child's Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ThemeSpacing>

            <ThemeSpacing variant="field">
              <TextField
                label="Child's Age"
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
          📋 Medical & Behavioral Profile
        </ThemeText>
        <ThemeText variant="form-helper">
          This information helps us identify patterns and correlations in daily tracking
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
              {loading ? "Saving..." : "Add Child"}
            </GradientButton>
          </Box>
        </ThemeCard>
      </Box>
    </Modal>
  );
};

export default AddChildModal;
