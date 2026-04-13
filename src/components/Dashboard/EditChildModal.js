import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import colors from "../../assets/theme/colors";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { USER_ROLES } from "../../constants/roles";
import ChildProfileFlowContent from "./shared/ChildProfileFlowContent";
import MedicationDetailCard from "./shared/MedicationDetailCard";
import {
  LogFormShell,
  ThemeSpacing,
} from "../UI";
import { useAsyncForm } from "../../hooks/useAsyncForm";
import { getChildProfileCompletion } from "../../utils/profileCompletion";
import {
  createMedicationDetail,
  getMedicationDefaultRoute,
  normalizeMedicationDetail,
  summarizeMedicationDetail,
} from "./shared/childMedicationHelpers";
import { saveMedicationRecord } from "./shared/medicationPersistence";

const EditChildModal = ({ open, onClose, child, onSuccess, userRole }) => {
  const { t } = useTranslation(['terms', 'common']);
  const storage = getStorage();
  const documentInputRefs = useRef({});
  const documentSectionsRef = useRef({
    medical: [],
    medications: [],
    behavioral: [],
  });
  const [stage, setStage] = useState("intake");
  const [submitError, setSubmitError] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [sensoryIssues, setSensoryIssues] = useState([]);
  const [behavioralTriggers, setBehavioralTriggers] = useState([]);
  const [communicationNeeds, setCommunicationNeeds] = useState([]);
  const [medicationDetails, setMedicationDetails] = useState([createMedicationDetail()]);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    medical: [],
    medications: [],
    behavioral: [],
  });
  const [openSections, setOpenSections] = useState({
    medical: true,
    medications: false,
    behavioral: false,
  });

  // Permission checks - updated for new role system
  const canEdit = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER || userRole === 'parent'; // Legacy support
  // Use async form hook for child editing
  const childForm = useAsyncForm({
    onSuccess: () => {},
    validate: ({ name, age }) => {
      if (!name?.trim()) {
        throw new Error(`Please enter the ${t('terms:profile_name').toLowerCase()}`);
      }
      if (!age?.trim()) {
        throw new Error(`Please enter the ${t('terms:profile_age').toLowerCase()}`);
      }
    }
  });

  useEffect(() => {
    if (open && child) {
      setName(child.name || "");
      setAge(child.age || "");
      setPhotoURL(child.photoURL || null);
      setSelectedConditions(child.concerns || child.conditions || []);
      setStage("intake");
      
      // Load medical profile if it exists
      const medicalProfile = child.medicalProfile || {};
      setFoodAllergies(medicalProfile.foodAllergies || []);
      setDietaryRestrictions(medicalProfile.dietaryRestrictions || []);
      setSensoryIssues(medicalProfile.sensoryIssues || []);
      setBehavioralTriggers(medicalProfile.behavioralTriggers || []);
      setCommunicationNeeds(medicalProfile.communicationNeeds || []);
      const existingMedicationDetails = Array.isArray(medicalProfile.medicationDetails) && medicalProfile.medicationDetails.length
        ? medicalProfile.medicationDetails
        : (Array.isArray(medicalProfile.currentMedications)
          ? medicalProfile.currentMedications.map((item) => (
            typeof item === "string"
              ? createMedicationDetail({ name: item })
              : createMedicationDetail(normalizeMedicationDetail(item))
          ))
          : []);
      setMedicationDetails(existingMedicationDetails.length ? existingMedicationDetails.map(normalizeMedicationDetail) : [createMedicationDetail()]);
      setUploadedDocuments(child.profileDocuments || { medical: [], medications: [], behavioral: [] });
      documentSectionsRef.current = child.profileDocuments || { medical: [], medications: [], behavioral: [] };
      setOpenSections({
        medical: true,
        medications: false,
        behavioral: false,
      });
      
      // Reset form hook state when child data loads
      childForm.reset();
    }
  }, [open, child?.id, childForm.reset]);

  const resetForm = () => {
    setStage("intake");
    setSubmitError("");
    setDocumentError("");
    setName("");
    setAge("");
    setPhoto(null);
    setPhotoURL(null);
    setSelectedConditions([]);
    setFoodAllergies([]);
    setDietaryRestrictions([]);
    setSensoryIssues([]);
    setBehavioralTriggers([]);
    setCommunicationNeeds([]);
    setMedicationDetails([createMedicationDetail()]);
    setUploadedDocuments({ medical: [], medications: [], behavioral: [] });
    setOpenSections({ medical: true, medications: false, behavioral: false });
    documentSectionsRef.current = { medical: [], medications: [], behavioral: [] };
    childForm.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const normalizeCondition = (item) => {
    if (typeof item === "string") {
      return { code: "OTHER", label: item, custom: true };
    }
    return item && item.label
      ? item
      : { code: "OTHER", label: String(item), custom: true };
  };

  const handleDocumentUpload = async (category, event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length || !child?.id) {
      return;
    }

    setDocumentError("");

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `children/${child.id}/documents/${category}/${Date.now()}-${file.name}`
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);

          return {
            name: file.name,
            url,
            type: file.type || "application/octet-stream",
            category,
            uploadedAt: new Date().toISOString(),
          };
        })
      );

      const nextDocuments = {
        ...documentSectionsRef.current,
        [category]: [...documentSectionsRef.current[category], ...uploaded],
      };

      documentSectionsRef.current = nextDocuments;
      setUploadedDocuments(nextDocuments);
    } catch (error) {
      console.error("Document upload failed:", error);
      setDocumentError("Document upload failed. Please try again.");
    }
  };

  const renderDocumentDropZone = (category, title, helperText) => {
    const label = category === "behavioral"
      ? "Upload IEP or evaluation"
      : "Upload prescription or doctor note";

    return (
      <Box
        component="label"
        sx={{
          display: "block",
          p: 2.2,
          borderRadius: 3,
          border: "1.5px dashed",
          borderColor: colors.landing.borderLight,
          bgcolor: colors.landing.surface,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: colors.brand.ink,
            bgcolor: colors.landing.sageLight,
          },
        }}
      >
        <input
          ref={(node) => {
            documentInputRefs.current[category] = node;
          }}
          type="file"
          hidden
          accept="image/*,application/pdf"
          multiple
          onChange={(event) => handleDocumentUpload(category, event)}
        />
        <Stack spacing={1.2} alignItems="flex-start">
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {helperText}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brand.deep }}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drop files here, or tap to browse.
          </Typography>
        </Stack>
      </Box>
    );
  };

  const updateMedicationDetail = (id, field, value) => {
    setMedicationDetails((current) => current.map((entry) => (
      entry.id === id
        ? {
            ...entry,
            [field]: value,
            syncStatus: "draft",
            ...(field === "form" ? { route: getMedicationDefaultRoute(value) } : {}),
            ...(field === "category" && value === "prn" ? { timing: [], frequency: "as_needed" } : {}),
            ...(field === "timing"
              ? { timing: Array.isArray(value) ? value : entry.timing }
              : {}),
          }
        : entry
    )));
  };

  const addMedicationDetail = (preset = {}) => {
    setMedicationDetails((current) => [...current, createMedicationDetail(preset)]);
  };

  const removeMedicationDetail = (id) => {
    setMedicationDetails((current) => {
      const next = current.filter((entry) => entry.id !== id);
      return next.length > 0 ? next : [createMedicationDetail()];
    });
  };

  const renderMedicationDetails = () => (
    <Stack spacing={1.25} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "nowrap",
          width: "100%",
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>Medication list</Typography>
        </Box>

        <Button
          onClick={() => addMedicationDetail()}
          sx={{
            minWidth: 0,
            width: 42,
            height: 42,
            borderRadius: "50%",
            px: 0,
            py: 0,
            bgcolor: colors.app.dailyCare.primary,
            color: "#ffffff",
            fontSize: "1.15rem",
            lineHeight: 1,
            textTransform: "none",
            flexShrink: 0,
            ml: 0.5,
            boxShadow: "0 8px 18px rgba(45, 113, 171, 0.18)",
            "&:hover": {
              bgcolor: colors.app.dailyCare.dark,
              boxShadow: "0 10px 20px rgba(45, 113, 171, 0.24)",
            },
          }}
          aria-label="Add medication"
        >
          +
        </Button>
      </Box>

      <Stack spacing={1.25}>
        {medicationDetails.map((entry, index) => (
          <MedicationDetailCard
            key={entry.id}
            entry={entry}
            index={index}
            onChange={(field, value) => updateMedicationDetail(entry.id, field, value)}
            onRemove={() => removeMedicationDetail(entry.id)}
            onSave={() => handleSaveMedicationDetail(entry.id)}
          />
        ))}
      </Stack>
    </Stack>
  );

  const buildMedicalProfileUpdate = (detailList = medicationDetails) => {
    const normalizedMedicationDetails = detailList
      .map(normalizeMedicationDetail)
      .filter((entry) => entry.name);

    const currentMedicationSummaries = normalizedMedicationDetails.map((entry) => summarizeMedicationDetail(entry));
    const supplementEntries = normalizedMedicationDetails.filter((entry) => ["supplement", "vitamin"].includes(entry.category));
    const completionScore = getChildProfileCompletion({
      name,
      age,
      photoURL,
      concerns: selectedConditions,
      medicalProfile: {
        foodAllergies,
        dietaryRestrictions,
        sensoryIssues,
        behavioralTriggers,
        currentMedications: currentMedicationSummaries,
        medicationDetails: normalizedMedicationDetails,
        supplements: supplementEntries,
        communicationNeeds,
      },
    });

    return {
      medicalProfile: {
        foodAllergies,
        dietaryRestrictions,
        sensoryIssues,
        behavioralTriggers,
        currentMedications: currentMedicationSummaries,
        medicationDetails: normalizedMedicationDetails,
        supplements: supplementEntries,
        communicationNeeds,
        sleepIssues: child?.medicalProfile?.sleepIssues || [],
      },
      profileDocuments: documentSectionsRef.current,
      profileSetup: {
        stage: completionScore >= 100 ? "complete" : "in_progress",
        completed: completionScore >= 100,
        progress: completionScore,
        completedAt: completionScore >= 100 ? new Date().toISOString() : null,
      },
      };
  };

  const handleSaveMedicationDetail = async (entryId) => {
    if (!child?.id) {
      setSubmitError("Child profile is not ready yet.");
      return;
    }

    const targetEntry = medicationDetails.find((entry) => entry.id === entryId);
    if (!targetEntry) {
      return;
    }

    const savedAt = new Date().toISOString();
    const nextMedicationDetails = medicationDetails.map((entry) => (
      entry.id === entryId
        ? {
            ...normalizeMedicationDetail(entry),
            syncStatus: "saved",
            savedAt,
          }
        : entry
    ));

    setMedicationDetails(nextMedicationDetails);

    try {
      await saveMedicationRecord({
        childId: child.id,
        medication: {
          ...targetEntry,
          syncStatus: "saved",
          savedAt,
        },
        status: "saved",
      });

      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, {
        medicalProfile: {
          ...buildMedicalProfileUpdate(nextMedicationDetails).medicalProfile,
          sleepIssues: child?.medicalProfile?.sleepIssues || [],
        },
      });
    } catch (error) {
      console.error("Failed to save medication detail:", error);
      setSubmitError(error?.message || "Could not save this medication row right now.");
    }
  };

  const handleAdvanceBasicInfo = () => {
    if (!canEdit) {
      throw new Error('You do not have permission to edit this child\'s information');
    }

    if (!child) {
      throw new Error('Child data is not available');
    }

    setSubmitError("");
    childForm.submitForm(
      async () => {
        let photoDownloadURL = child.photoURL;

        if (photo) {
          const photoRef = ref(storage, `children/${photo.name}`);
          await uploadBytes(photoRef, photo);
          photoDownloadURL = await getDownloadURL(photoRef);
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

        const childRef = doc(db, "children", child.id);
        await updateDoc(childRef, updatedChild);

        setStage("setup");
        return updatedChild;
      },
      { name, age }
    ).catch((error) => {
      setSubmitError(error?.message || "Could not save this profile right now.");
    });
  };

  const handleSubmit = () => {
    // Security check - ensure user has permission to edit
    if (!canEdit) {
      throw new Error('You do not have permission to edit this child\'s information');
    }

    if (!child) {
      throw new Error('Child data is not available');
    }

    childForm.submitForm(
      async () => {
        let photoDownloadURL = child.photoURL;

        // Upload photo if changed
        if (photo) {
          const photoRef = ref(storage, `children/${photo.name}`);
          await uploadBytes(photoRef, photo);
          photoDownloadURL = await getDownloadURL(photoRef);
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
          ...buildMedicalProfileUpdate(),
        };

        // Update child in Firestore
        const childRef = doc(db, "children", child.id);
        await updateDoc(childRef, updatedChild);

        if (onSuccess) {
          onSuccess(updatedChild);
        }
        onClose();

        return updatedChild;
      },
      { name, age }
    );
  };

  // Security check - only parents can edit
  if (!canEdit) {
    if (open) {
      console.warn('EditChildModal: User does not have permission to edit child details');
    }
    return null;
  }

  const profileProgress = getChildProfileCompletion({
    name,
    age,
    photoURL,
    concerns: selectedConditions,
    medicalProfile: {
      foodAllergies,
      dietaryRestrictions,
      sensoryIssues,
      behavioralTriggers,
      currentMedications: medicationDetails.map(summarizeMedicationDetail).filter(Boolean),
      medicationDetails: medicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name),
      supplements: medicationDetails
        .map(normalizeMedicationDetail)
        .filter((entry) => ["supplement", "vitamin"].includes(entry.category)),
      communicationNeeds,
    },
  });

  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title={t('common:modal.edit_item', { item: child?.name || t('terms:profile_one') })}
      subtitle={t('terms:update_profile_description')}
      mobileBreakpoint={1023.95}
      maxWidth="sm"
      footer={null}
    >
      <ThemeSpacing variant="modal-content">
        <ChildProfileFlowContent
          mode="edit"
          stage={stage}
          submitError={submitError}
          setSubmitError={setSubmitError}
          documentError={documentError}
          setDocumentError={setDocumentError}
          name={name}
          setName={setName}
          age={age}
          setAge={setAge}
          setPhoto={setPhoto}
          photoURL={photoURL}
          setPhotoURL={setPhotoURL}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
          normalizeCondition={normalizeCondition}
          foodAllergies={foodAllergies}
          setFoodAllergies={setFoodAllergies}
          dietaryRestrictions={dietaryRestrictions}
          setDietaryRestrictions={setDietaryRestrictions}
          sensoryIssues={sensoryIssues}
          setSensoryIssues={setSensoryIssues}
          behavioralTriggers={behavioralTriggers}
          setBehavioralTriggers={setBehavioralTriggers}
          communicationNeeds={communicationNeeds}
          setCommunicationNeeds={setCommunicationNeeds}
          renderDocumentDropZone={renderDocumentDropZone}
          renderMedicationDetails={renderMedicationDetails}
          uploadedDocuments={uploadedDocuments}
          openSections={openSections}
          setOpenSections={setOpenSections}
          createdChildName={child?.name || name}
          profileProgress={profileProgress}
          isSubmitting={childForm.loading}
          onCreate={handleAdvanceBasicInfo}
          onFinish={handleSubmit}
          onClose={handleClose}
          t={t}
        />
      </ThemeSpacing>
    </LogFormShell>
  );
};

export default EditChildModal;
