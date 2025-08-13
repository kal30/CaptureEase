import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography, Chip } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firestore functions
import { db } from "../../services/firebase"; // Adjust the path based on your structure
import ChildPhotoUploader from "./ChildPhotoUploader"; // Import the ChildPhotoUploader component

const AddChildModal = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null); // State for photo file
  const [photoURL, setPhotoURL] = useState(null); // State for photo URL
  const [loading, setLoading] = useState(false); // State to manage loading
  const [selectedConditions, setSelectedConditions] = useState([]); // [{ code, label, custom? }]
  const storage = getStorage();

  const CONDITION_OPTIONS = [
    { code: "ASD", label: "Autism / ASD" },
    { code: "ADHD", label: "ADHD" },
    { code: "SPEECH", label: "Speech / Language" },
    { code: "LEARN", label: "Learning Differences" },
    { code: "MEDICAL", label: "Medical (e.g., epilepsy, diabetes)" },
    { code: "BEHAVIOR", label: "Behavioral / Emotional" },
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

    const primaryLabel = selectedConditions[0]?.label || ""; // backward-compatible single field
    const conditionCodes = selectedConditions.map((c) => c.code);

    // Create the new child object
    const newChild = {
      name,
      age,
      photoURL: photoDownloadURL,
      parentId: getAuth().currentUser.uid,
      // Backward compatibility (original single field)
      condition: primaryLabel,
      // New structured fields
      conditions: selectedConditions, // [{code,label,custom?}]
      conditionCodes, // ["ASD", "OTHER", ...]
    };

    try {
      // Save child to Firestore
      const docRef = await addDoc(collection(db, "children"), newChild);
      console.log("Child added to Firestore with ID:", docRef.id);

      // No need to update setChildren locally here, as the Firestore snapshot listener will handle this
      onClose(); // Close the modal after saving
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add New Child
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

        {/* ChildPhotoUploader component */}
        <ChildPhotoUploader
          setPhoto={setPhoto}
          photoURL={photoURL}
          setPhotoURL={setPhotoURL}
        />

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#a5d6a7",
            color: "#000",
            "&:hover": { backgroundColor: "#81c784" },
          }}
          onClick={handleSubmit}
          fullWidth
          disabled={loading} // Disable button during loading
        >
          {loading ? "Saving..." : "Add Child"} {/* Show loading text */}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddChildModal;
