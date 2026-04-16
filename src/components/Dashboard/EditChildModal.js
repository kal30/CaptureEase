import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
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
import ChildMedicationManager from "./shared/ChildMedicationManager";
import { LogFormShell } from "../UI";
import { useAsyncForm } from "../../hooks/useAsyncForm";
import { getChildProfileCompletion } from "../../utils/profileCompletion";
import {
  createMedicationDetail,
  normalizeMedicationDetail,
  summarizeMedicationDetail,
} from "./shared/childMedicationHelpers";
import { archiveMedicationRecord, saveMedicationRecord } from "./shared/medicationPersistence";

const EditChildModal = ({ open, onClose, child, onSuccess, userRole, initialStep = 1, onViewTodayMedications }) => {
  const { t } = useTranslation(['terms', 'common']);
  const storage = getStorage();
  const documentInputRefs = useRef({});
  const documentSectionsRef = useRef({
    medical: [],
    medications: [],
    behavioral: [],
  });
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
    if (open && child?.id) {
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
      
      // Reset form hook state when child data loads
      childForm.reset();
    }
  }, [open, child?.id, initialStep, childForm.reset]);

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

  const handleWizardBack = () => {
    setCurrentStep((current) => Math.max(1, current - 1));
  };

  const handleWizardContinue = async () => {
    if (currentStep === 1) {
      handleAdvanceBasicInfo();
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((current) => Math.min(5, current + 1));
      return;
    }

    await handleSubmit();
  };

  const wizardFooter = (
    <Stack direction="row" spacing={1.25} sx={{ width: "100%" }}>
      <Button
        variant="outlined"
        onClick={handleWizardBack}
        disabled={currentStep === 1}
        fullWidth
        sx={{ py: 1.15, textTransform: "none", borderRadius: 2 }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        onClick={handleWizardContinue}
        fullWidth
        sx={{
          py: 1.15,
          textTransform: "none",
          borderRadius: 2,
          bgcolor: colors.brand.ink,
          "&:hover": { bgcolor: colors.brand.deep },
        }}
      >
        Continue
      </Button>
    </Stack>
  );

  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title="Edit Child"
      titleBadge={child?.name || null}
      subtitle={t('terms:update_profile_description')}
      compactTitle
      mobileBreakpoint={1023.95}
      maxWidth="sm"
      surfaceSx={{ height: "80vh", maxHeight: "80vh" }}
      bodySx={{ px: { xs: 0, sm: 3 }, pt: { xs: 0.75, sm: 2.25 }, pb: { xs: 2, sm: 2.5 } }}
      headerContent={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 800, flexShrink: 0 }}>
            {child?.name || name || "Child"}
          </Typography>
          <Box sx={{ flex: 1, minWidth: 160 }}>
            <LinearProgress variant="determinate" value={profileProgress} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            editing
          </Typography>
        </Box>
      }
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
        profileProgress={profileProgress}
        isSubmitting={childForm.loading}
        onCreate={handleAdvanceBasicInfo}
        onFinish={handleSubmit}
        onClose={handleClose}
        t={t}
      />
    </LogFormShell>
  );
};

export default EditChildModal;
