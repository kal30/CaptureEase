import React, { useState } from "react";
import { Box, Modal, TextField, Chip } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firestore functions
import { db } from "../../services/firebase"; // Adjust the path based on your structure
import ChildPhotoUploader from "./ChildPhotoUploader"; // Import the ChildPhotoUploader component
import { ThemeCard, GradientButton, ThemeSpacing, ThemeText } from "../UI";

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

  const filter = createFilterOptions({
    stringify: (option) => (typeof option === "string" ? option : option.label),
  });

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
        <ThemeCard variant="modal" elevated>
          <ThemeSpacing variant="modal-content">
            <ThemeText variant="modal-title" gutterBottom>
              Add New Child
            </ThemeText>

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
            />
          )}
        />

        {/* Medical & Behavioral Profile */}
        <ThemeText variant="section-header">
          📋 Medical & Behavioral Profile
        </ThemeText>
        <ThemeText variant="form-helper">
          This information helps us identify patterns and correlations in daily tracking
        </ThemeText>

        <Autocomplete
          multiple
          freeSolo
          options={FOOD_ALLERGY_OPTIONS}
          value={foodAllergies}
          onChange={(event, newValue) => setFoodAllergies(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="warning"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Food Allergies & Intolerances"
              variant="outlined"
              helperText="Add known food allergies or intolerances"
              sx={{ mb: 3 }}
            />
          )}
        />

        <Autocomplete
          multiple
          freeSolo
          options={DIETARY_OPTIONS}
          value={dietaryRestrictions}
          onChange={(event, newValue) => setDietaryRestrictions(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="info"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Dietary Restrictions"
              variant="outlined"
              helperText="Special diets or restrictions they follow"
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
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="secondary"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sensory Sensitivities"
              variant="outlined"
              helperText="Things they are sensitive to"
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
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="error"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Known Behavioral Triggers"
              variant="outlined"
              helperText="Situations or things that tend to cause challenges"
              sx={{ mb: 3 }}
            />
          )}
        />

        <TextField
          label="Current Medications"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          value={currentMedications.join(', ')}
          onChange={(e) => setCurrentMedications(e.target.value.split(',').map(med => med.trim()).filter(Boolean))}
          helperText="List current medications (separate with commas)"
          sx={{ mb: 3 }}
        />

        <Autocomplete
          multiple
          freeSolo
          options={SLEEP_OPTIONS}
          value={sleepIssues}
          onChange={(event, newValue) => setSleepIssues(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="primary"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sleep Issues"
              variant="outlined"
              helperText="Any sleep-related challenges"
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
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                color="success"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Communication Needs"
              variant="outlined"
              helperText="How they communicate best"
              sx={{ mb: 3 }}
            />
          )}
        />

        {/* ChildPhotoUploader component */}
        <ChildPhotoUploader
          setPhoto={setPhoto}
          photoURL={photoURL}
          setPhotoURL={setPhotoURL}
        />

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
          </ThemeSpacing>
        </ThemeCard>
      </Box>
    </Modal>
  );
};

export default AddChildModal;
