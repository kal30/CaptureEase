import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import ChildPhotoUploader from "./ChildPhotoUploader";

const EditChildModal = ({ open, onClose, child }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const storage = getStorage();

  const CONDITION_OPTIONS = [
    { code: "ASD", label: "Autism / ASD" },
    { code: "ADHD", label: "ADHD" },
    { code: "SPEECH", label: "Speech / Language" },
    { code: "LEARN", label: "Learning Differences" },
    { code: "MEDICAL", label: "Medical (e.g., epilepsy, diabetes)" },
    { code: "BEHAVIOR", label: "Behavioral / Emotional" },
  ];

  useEffect(() => {
    if (child) {
      setName(child.name || "");
      setAge(child.age || "");
      setPhotoURL(child.photoURL || null);
      setSelectedConditions(child.concerns || []);
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

    try {
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, updatedChild);
      onClose();
    } catch (error) {
      console.error("Error updating child:", error);
    } finally {
      setLoading(false);
    }
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
          Edit Child
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

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#a5d6a7",
            color: "#000",
            "&:hover": { backgroundColor: "#81c784" },
          }}
          onClick={handleSubmit}
          fullWidth
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Modal>
  );
};

export default EditChildModal;