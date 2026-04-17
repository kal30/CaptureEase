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
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { USER_ROLES } from "../../constants/roles";
import ChildProfileFlowContent from "./shared/ChildProfileFlowContent";
import ChildMedicationManager from "./shared/ChildMedicationManager";
import { useAsyncForm } from "../../hooks/useAsyncForm";
import { getChildProfileCompletion } from "../../utils/profileCompletion";
import {
  createMedicationDetail,
  normalizeMedicationDetail,
  summarizeMedicationDetail,
} from "./shared/childMedicationHelpers";
import { archiveMedicationRecord, saveMedicationRecord } from "./shared/medicationPersistence";
import ChildProfileFlowPageShell from "./shared/ChildProfileFlowPageShell";

const EditChildModal = ({ open, onClose, child, onSuccess, userRole, initialStep = 1, onViewTodayMedications }) => {
  const { t } = useTranslation(['terms', 'common']);
  const navigate = useNavigate();
  const storage = getStorage();
  const documentInputRefs = useRef({});
  const documentSectionsRef = useRef({
    medical: [],
    medications: [],
    behavioral: [],
  });
  const initialSnapshotRef = useRef("");
  const [stage, setStage] = useState("intake");
  const [currentStep, setCurrentStep] = useState(1);
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
  const [medicationDetails, setMedicationDetails] = useState([]);
  const [medicationDraft, setMedicationDraft] = useState(createMedicationDetail());
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [isMedicationEditorOpen, setIsMedicationEditorOpen] = useState(false);
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

  const serializeProfileSnapshot = ({
    snapshotName = "",
    snapshotAge = "",
    snapshotPhotoURL = "",
    snapshotPhotoName = "",
    snapshotConditions = [],
    snapshotFoodAllergies = [],
    snapshotDietaryRestrictions = [],
    snapshotSensoryIssues = [],
    snapshotBehavioralTriggers = [],
    snapshotCommunicationNeeds = [],
    snapshotMedicationDetails = [],
    snapshotDocuments = { medical: [], medications: [], behavioral: [] },
  } = {}) => JSON.stringify({
    name: snapshotName,
    age: snapshotAge,
    photoURL: snapshotPhotoURL,
    photoName: snapshotPhotoName,
    conditions: snapshotConditions.map((item) => item?.code || item?.label || String(item)),
    foodAllergies: snapshotFoodAllergies,
    dietaryRestrictions: snapshotDietaryRestrictions,
    sensoryIssues: snapshotSensoryIssues,
    behavioralTriggers: snapshotBehavioralTriggers,
    communicationNeeds: snapshotCommunicationNeeds,
    medicationDetails: snapshotMedicationDetails.map((item) => ({
      id: item?.id || "",
      name: item?.name || "",
      category: item?.category || "",
      dosage: item?.dosage || "",
      scheduleType: item?.scheduleType || "",
      isArchived: Boolean(item?.isArchived),
    })),
    documents: {
      medical: (snapshotDocuments.medical || []).map((item) => item?.name || item?.url || ""),
      medications: (snapshotDocuments.medications || []).map((item) => item?.name || item?.url || ""),
      behavioral: (snapshotDocuments.behavioral || []).map((item) => item?.name || item?.url || ""),
    },
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
    if (child?.id) {
      setName(child.name || "");
      setAge(child.age || "");
      setPhotoURL(child.photoURL || null);
      setSelectedConditions(child.concerns || child.conditions || []);
      setStage("intake");
      setCurrentStep(initialStep || 1);
      
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
      setMedicationDetails(existingMedicationDetails.length ? existingMedicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name) : []);
      setMedicationDraft(createMedicationDetail());
      setEditingMedicationId(null);
      setIsMedicationEditorOpen(false);
      setUploadedDocuments(child.profileDocuments || { medical: [], medications: [], behavioral: [] });
      documentSectionsRef.current = child.profileDocuments || { medical: [], medications: [], behavioral: [] };
      setOpenSections({
        medical: true,
        medications: false,
        behavioral: false,
      });
      initialSnapshotRef.current = serializeProfileSnapshot({
        snapshotName: child.name || "",
        snapshotAge: child.age || "",
        snapshotPhotoURL: child.photoURL || "",
        snapshotConditions: child.concerns || child.conditions || [],
        snapshotFoodAllergies: medicalProfile.foodAllergies || [],
        snapshotDietaryRestrictions: medicalProfile.dietaryRestrictions || [],
        snapshotSensoryIssues: medicalProfile.sensoryIssues || [],
        snapshotBehavioralTriggers: medicalProfile.behavioralTriggers || [],
        snapshotCommunicationNeeds: medicalProfile.communicationNeeds || [],
        snapshotMedicationDetails: existingMedicationDetails.length ? existingMedicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name) : [],
        snapshotDocuments: child.profileDocuments || { medical: [], medications: [], behavioral: [] },
      });
      
      // Reset form hook state when child data loads
      childForm.reset();
    }
  }, [child?.id, initialStep]);

  const resetForm = () => {
    setStage("intake");
    setCurrentStep(1);
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
    setMedicationDetails([]);
    setMedicationDraft(createMedicationDetail());
    setEditingMedicationId(null);
    setIsMedicationEditorOpen(false);
    setUploadedDocuments({ medical: [], medications: [], behavioral: [] });
    setOpenSections({ medical: true, medications: false, behavioral: false });
    documentSectionsRef.current = { medical: [], medications: [], behavioral: [] };
    initialSnapshotRef.current = "";
    childForm.reset();
  };

  const handleClose = () => {
    if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Leave this page?")) {
      return;
    }

    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard", { replace: true });
    }
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

  const handleAdvanceBasicInfo = () => {
    if (!canEdit) {
      throw new Error('You do not have permission to edit this child\'s information');
    }

    if (!child) {
      throw new Error('Child data is not available');
    }

    setSubmitError("");
    return childForm.submitForm(
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
        initialSnapshotRef.current = serializeProfileSnapshot({
          snapshotName: name,
          snapshotAge: age,
          snapshotPhotoURL: photoDownloadURL || "",
          snapshotPhotoName: photo?.name || "",
          snapshotConditions: selectedConditions,
          snapshotFoodAllergies: foodAllergies,
          snapshotDietaryRestrictions: dietaryRestrictions,
          snapshotSensoryIssues: sensoryIssues,
          snapshotBehavioralTriggers: behavioralTriggers,
          snapshotCommunicationNeeds: communicationNeeds,
          snapshotMedicationDetails: medicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name || entry.id),
          snapshotDocuments: uploadedDocuments,
        });

        setStage("setup");
        setCurrentStep(2);
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

    return childForm.submitForm(
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
        initialSnapshotRef.current = serializeProfileSnapshot({
          snapshotName: name,
          snapshotAge: age,
          snapshotPhotoURL: photoURL || "",
          snapshotPhotoName: photo?.name || "",
          snapshotConditions: selectedConditions,
          snapshotFoodAllergies: foodAllergies,
          snapshotDietaryRestrictions: dietaryRestrictions,
          snapshotSensoryIssues: sensoryIssues,
          snapshotBehavioralTriggers: behavioralTriggers,
          snapshotCommunicationNeeds: communicationNeeds,
          snapshotMedicationDetails: medicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name || entry.id),
          snapshotDocuments: uploadedDocuments,
        });

        if (onSuccess) {
          onSuccess(updatedChild);
        } else {
          resetForm();
          if (onClose) {
            onClose();
          } else {
            navigate("/dashboard", { replace: true });
          }
        }

        return updatedChild;
      },
      { name, age }
    );
  };

  const hasUnsavedChanges = serializeProfileSnapshot({
    snapshotName: name,
    snapshotAge: age,
    snapshotPhotoURL: photoURL || "",
    snapshotPhotoName: photo?.name || "",
    snapshotConditions: selectedConditions,
    snapshotFoodAllergies: foodAllergies,
    snapshotDietaryRestrictions: dietaryRestrictions,
    snapshotSensoryIssues: sensoryIssues,
    snapshotBehavioralTriggers: behavioralTriggers,
    snapshotCommunicationNeeds: communicationNeeds,
    snapshotMedicationDetails: medicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name || entry.id),
    snapshotDocuments: uploadedDocuments,
  }) !== initialSnapshotRef.current;
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Security check - only parents can edit
  if (!canEdit) {
    if (open) {
      console.warn('EditChildModal: User does not have permission to edit child details');
    }
    return null;
  }

  const buildMedicalProfileUpdate = (detailList = medicationDetails) => {
    const normalizedMedicationDetails = detailList
      .map(normalizeMedicationDetail)
      .filter((entry) => entry.name && !entry.isArchived);

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

  const updateMedicationDraft = (field, value) => {
    setMedicationDraft((current) => ({
      ...current,
      [field]: field === "schedules" && Array.isArray(value) ? value : value,
    }));
  };

  const clearMedicationDraft = () => {
    setMedicationDraft(createMedicationDetail());
    setEditingMedicationId(null);
    setIsMedicationEditorOpen(false);
  };

  const addMedicationDetail = () => {
    setMedicationDraft(createMedicationDetail());
    setEditingMedicationId(null);
    setIsMedicationEditorOpen(true);
  };

  const editMedicationDetail = (entry) => {
    if (!entry) {
      return;
    }

    setEditingMedicationId(entry.id);
    setMedicationDraft(normalizeMedicationDetail(entry));
    setIsMedicationEditorOpen(true);
  };

  const handleSaveMedicationDraft = async () => {
    if (!child?.id) {
      setSubmitError("Child profile is not ready yet.");
      return;
    }

    const targetEntry = normalizeMedicationDetail(medicationDraft);
    if (!String(targetEntry.name || "").trim()) {
      setSubmitError("Please enter a medication name.");
      return;
    }

    const entryId = editingMedicationId || targetEntry.id;
    const savedAt = new Date().toISOString();
    const createdBy = child?.users?.care_owner || child?.users?.members?.[0] || "";
    const nextMedicationDetails = editingMedicationId
      ? medicationDetails.map((entry) => (
          entry.id === entryId
            ? {
                ...targetEntry,
                id: entryId,
                isArchived: false,
                archivedAt: "",
                archivedBy: "",
                syncStatus: "saved",
                savedAt,
              }
            : entry
        ))
      : [
          ...medicationDetails,
          {
            ...targetEntry,
            id: entryId,
            isArchived: false,
            archivedAt: "",
            archivedBy: "",
            syncStatus: "saved",
            savedAt,
          },
        ];

    setMedicationDetails(nextMedicationDetails);

    try {
      await saveMedicationRecord({
        childId: child.id,
        medication: {
          ...targetEntry,
          id: entryId,
          childId: child.id,
          createdBy,
          createdAt: savedAt,
          isArchived: false,
          archivedAt: "",
          archivedBy: "",
          syncStatus: "saved",
          savedAt,
        },
        status: "saved",
      });
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, {
        ...buildMedicalProfileUpdate(nextMedicationDetails),
        medicalProfile: {
          ...buildMedicalProfileUpdate(nextMedicationDetails).medicalProfile,
          sleepIssues: child?.medicalProfile?.sleepIssues || [],
        },
      });
      initialSnapshotRef.current = serializeProfileSnapshot({
        snapshotName: name,
        snapshotAge: age,
        snapshotPhotoURL: photoURL || "",
        snapshotPhotoName: photo?.name || "",
        snapshotConditions: selectedConditions,
        snapshotFoodAllergies: foodAllergies,
        snapshotDietaryRestrictions: dietaryRestrictions,
        snapshotSensoryIssues: sensoryIssues,
        snapshotBehavioralTriggers: behavioralTriggers,
        snapshotCommunicationNeeds: communicationNeeds,
        snapshotMedicationDetails: nextMedicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name || entry.id),
        snapshotDocuments: uploadedDocuments,
      });

      clearMedicationDraft();
    } catch (error) {
      console.error("Failed to save medication detail:", error);
      setSubmitError(error?.message || "Could not save this medication row right now.");
    }
  };

  const handleArchiveMedication = async (entry, archived = true) => {
    if (!child?.id || !entry?.id) {
      return;
    }

    const createdBy = child?.users?.care_owner || child?.users?.members?.[0] || "";
    const confirmed = window.confirm(
      archived
        ? `Archive ${entry.name || "this medication"}? It will stay saved but move out of the active list.`
        : `Unarchive ${entry.name || "this medication"}? It will return to the active list.`
    );

    if (!confirmed) {
      return;
    }

    const archivedAt = archived ? new Date().toISOString() : "";
    const archivedBy = archived ? (child?.users?.care_owner || child?.users?.members?.[0] || "") : "";
    const nextMedicationDetails = medicationDetails.map((item) => (
      item.id === entry.id
        ? {
            ...item,
            isArchived: archived,
            archivedAt,
            archivedBy,
            syncStatus: archived ? "archived" : "saved",
          }
        : item
    ));
    setMedicationDetails(nextMedicationDetails);

    try {
      await archiveMedicationRecord({
        childId: child.id,
        medication: {
          ...entry,
          childId: child.id,
          createdBy: entry.createdBy || createdBy,
          createdAt: entry.createdAt || new Date().toISOString(),
          isArchived: archived,
          archivedAt,
          archivedBy,
        },
        archived,
      });
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, {
        ...buildMedicalProfileUpdate(nextMedicationDetails),
        medicalProfile: {
          ...buildMedicalProfileUpdate(nextMedicationDetails).medicalProfile,
          sleepIssues: child?.medicalProfile?.sleepIssues || [],
        },
      });
      initialSnapshotRef.current = serializeProfileSnapshot({
        snapshotName: name,
        snapshotAge: age,
        snapshotPhotoURL: photoURL || "",
        snapshotPhotoName: photo?.name || "",
        snapshotConditions: selectedConditions,
        snapshotFoodAllergies: foodAllergies,
        snapshotDietaryRestrictions: dietaryRestrictions,
        snapshotSensoryIssues: sensoryIssues,
        snapshotBehavioralTriggers: behavioralTriggers,
        snapshotCommunicationNeeds: communicationNeeds,
        snapshotMedicationDetails: nextMedicationDetails.map(normalizeMedicationDetail).filter((entry) => entry.name || entry.id),
        snapshotDocuments: uploadedDocuments,
      });
      if (editingMedicationId === entry.id) {
        clearMedicationDraft();
      }
    } catch (error) {
      console.error("Failed to archive medication detail:", error);
      setSubmitError(error?.message || "Could not update this medication right now.");
    }
  };

  const renderMedicationDetails = () => (
      <ChildMedicationManager
        medications={medicationDetails}
        draft={medicationDraft}
        editingMedicationId={editingMedicationId}
        isEditorOpen={isMedicationEditorOpen}
        onDraftChange={updateMedicationDraft}
        onSaveDraft={handleSaveMedicationDraft}
        onEditMedication={editMedicationDetail}
        onAddMedication={addMedicationDetail}
        onArchiveMedication={handleArchiveMedication}
        onClearDraft={clearMedicationDraft}
      />
  );

  const renderMedicationHeaderAction = () => (
    <Button
      type="button"
      variant="text"
      onClick={() => {
        if (child?.id) {
          onViewTodayMedications?.(child);
        }
      }}
      sx={{
        minWidth: 0,
        px: 0,
        py: 0,
        textTransform: "none",
        fontWeight: 700,
        color: colors.brand.deep,
        justifyContent: "flex-start",
        "&:hover": {
          bgcolor: "transparent",
          textDecoration: "underline",
        },
      }}
    >
      View today&apos;s medications
    </Button>
  );

  const handlePrimaryAction = async () => {
    if (currentStep === 1) {
      void handleAdvanceBasicInfo();
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((current) => Math.min(5, current + 1));
      return;
    }

    await handleSubmit();
  };

  const primaryActionLabel = currentStep >= 5 ? "Complete Profile" : "Continue";

  const wizardFooter = (
    <Button
      variant="contained"
      onClick={handlePrimaryAction}
      fullWidth
      disabled={childForm.loading}
      size="large"
      sx={{
        py: { xs: 1.05, sm: 1.15 },
        textTransform: "none",
        borderRadius: 2,
        bgcolor: colors.brand.ink,
        "&:hover": { bgcolor: colors.brand.deep },
        minHeight: 48,
      }}
    >
      {primaryActionLabel}
    </Button>
  );

  const currentStepLabel = `${["Basics", "Health", "Medication Management", "Behavior", "Review"][Math.min(currentStep, 5) - 1] || "Basics"} (${Math.min(currentStep, 5)}/5)`;
  const pageProgress = (Math.min(currentStep, 5) / 5) * 100;

  return (
    <ChildProfileFlowPageShell
      title="Edit Child"
      stepLabel={currentStepLabel}
      progress={pageProgress}
      activeStep={currentStep}
      onStepChange={setCurrentStep}
      stepItems={[
        { step: 1, label: "Basics", disabled: false },
        { step: 2, label: "Health", disabled: false },
        { step: 3, label: "Meds", disabled: false },
        { step: 4, label: "Behavior", disabled: false },
        { step: 5, label: "Review", disabled: false },
      ]}
      onBack={handleClose}
      footer={wizardFooter}
    >
      <ChildProfileFlowContent
        mode="edit"
        stage={stage}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
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
        renderMedicationHeaderAction={renderMedicationHeaderAction}
        medicationDetails={medicationDetails}
        uploadedDocuments={uploadedDocuments}
        openSections={openSections}
        setOpenSections={setOpenSections}
        createdChildName={child?.name || name}
        isSubmitting={childForm.loading}
        onCreate={handleAdvanceBasicInfo}
        onFinish={handleSubmit}
        onClose={handleClose}
        t={t}
      />
    </ChildProfileFlowPageShell>
  );
};

export default EditChildModal;
