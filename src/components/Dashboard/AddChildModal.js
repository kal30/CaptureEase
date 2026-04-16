import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useTranslation } from "react-i18next";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import ChildProfileFlowContent from "./shared/ChildProfileFlowContent";
import ChildMedicationManager from "./shared/ChildMedicationManager";
import colors from "../../assets/theme/colors";
import { LogFormShell } from "../UI";
import { useAsyncForm } from "../../hooks/useAsyncForm";
import { getChildProfileCompletion } from "../../utils/profileCompletion";
import {
  createMedicationDetail,
  normalizeMedicationDetail,
  summarizeMedicationDetail,
} from "./shared/childMedicationHelpers";
import { archiveMedicationRecord, saveMedicationRecord } from "./shared/medicationPersistence";

const PROFILE_SETUP_PROGRESS = 20;

const AddChildModal = ({ open, onClose, onSuccess, onViewTodayMedications }) => {
  const { t } = useTranslation(["terms", "common"]);
  const storage = getStorage();
  const documentInputRefs = useRef({});
  const documentSectionsRef = useRef({
    medical: [],
    medications: [],
    behavioral: [],
  });

  const [stage, setStage] = useState("intake");
  const [createdChildId, setCreatedChildId] = useState("");
  const [createdChildName, setCreatedChildName] = useState("");
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

  useEffect(() => {
    documentSectionsRef.current = uploadedDocuments;
  }, [uploadedDocuments]);

  const normalizeCondition = (item) => {
    if (typeof item === "string") {
      return { code: "OTHER", label: item, custom: true };
    }

    return item && item.label
      ? item
      : { code: "OTHER", label: String(item), custom: true };
  };

  const resetForm = () => {
    setStage("intake");
    setCurrentStep(1);
    setCreatedChildId("");
    setCreatedChildName("");
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
    setUploadedDocuments({
      medical: [],
      medications: [],
      behavioral: [],
    });
    setOpenSections({
      medical: true,
      medications: false,
      behavioral: false,
    });
    documentSectionsRef.current = {
      medical: [],
      medications: [],
      behavioral: [],
    };
    childForm.reset();
  };

  const childForm = useAsyncForm({
    autoClose: false,
    onSuccess: () => {
      setStage("setup");
      setCurrentStep(2);
      setSubmitError("");
      setDocumentError("");
      setOpenSections({
        medical: true,
        medications: false,
        behavioral: false,
      });
    },
    onError: (error) => {
      setSubmitError(error?.message || "Could not save this profile right now.");
    },
    validate: ({ name: childName, age: childAge }) => {
      if (!childName?.trim()) {
        throw new Error(`Please enter the ${t("terms:profile_name").toLowerCase()}`);
      }
      if (!childAge?.trim()) {
        throw new Error(`Please enter the ${t("terms:profile_age").toLowerCase()}`);
      }
    },
  });

  const handleSubmit = () => {
    setSubmitError("");
    childForm.submitForm(
      async () => {
        let photoDownloadURL = "";

        if (photo) {
          const photoRef = ref(storage, `children/${photo.name}`);
          await uploadBytes(photoRef, photo);
          photoDownloadURL = await getDownloadURL(photoRef);
        }

        const conditionCodes = selectedConditions.map((c) => c.code);
        const auth = getAuth?.();
        const currentUserId = auth?.currentUser?.uid;

        if (!currentUserId) {
          throw new Error("User not logged in");
        }

        const newChild = {
          name,
          age,
          photoURL: photoDownloadURL,
          users: {
            care_owner: currentUserId,
            care_partners: [],
            caregivers: [],
            therapists: [],
            members: [currentUserId],
          },
          status: "active",
          settings: {
            allow_therapist_family_logs: false,
          },
          conditions: selectedConditions,
          conditionCodes,
          medicalProfile: {
            foodAllergies: [],
            dietaryRestrictions: [],
            sensoryIssues: [],
            behavioralTriggers: [],
            currentMedications: [],
            medicationDetails: [],
            supplements: [],
            communicationNeeds: [],
          },
          profileSetup: {
            stage: "intake",
            completed: false,
          },
        };

        const docRef = await addDoc(collection(db, "children"), newChild);
        const childId = docRef?.id || `child-${Date.now()}`;
        setCreatedChildId(childId);
        setCreatedChildName(name.trim());
        return { id: childId };
      },
      { name, age }
    ).catch((error) => {
      setSubmitError(error?.message || "Could not save this profile right now.");
    });
  };

  const updateCreatedChild = async (updates) => {
    if (!createdChildId) {
      return;
    }

    await updateDoc(doc(db, "children", createdChildId), updates);
  };

  const handleDocumentUpload = async (category, event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length || !createdChildId) {
      return;
    }

    setDocumentError("");

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `children/${createdChildId}/documents/${category}/${Date.now()}-${file.name}`
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
    if (!createdChildId) {
      setSubmitError("Create the profile basics first before saving medication details.");
      return;
    }

    const targetEntry = normalizeMedicationDetail(medicationDraft);
    if (!String(targetEntry.name || "").trim()) {
      setSubmitError("Please enter a medication name.");
      return;
    }

    const entryId = editingMedicationId || targetEntry.id;
    const savedAt = new Date().toISOString();
    const createdBy = auth?.currentUser?.uid;
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
        childId: createdChildId,
        medication: {
          ...targetEntry,
          id: entryId,
          childId: createdChildId,
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

      await updateCreatedChild(buildMedicalProfileUpdate(nextMedicationDetails));
      clearMedicationDraft();
    } catch (error) {
      console.error("Failed to save medication detail:", error);
      setSubmitError(error?.message || "Could not save this medication row right now.");
    }
  };

  const handleArchiveMedication = async (entry, archived = true) => {
    if (!entry?.id) {
      return;
    }

    const confirmed = window.confirm(
      archived
        ? `Archive ${entry.name || "this medication"}? It will stay saved but move out of the active list.`
        : `Unarchive ${entry.name || "this medication"}? It will return to the active list.`
    );

    if (!confirmed) {
      return;
    }

    const archivedAt = archived ? new Date().toISOString() : "";
    const archivedBy = archived ? (auth?.currentUser?.uid || "") : "";
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
        childId: createdChildId,
        medication: {
          ...entry,
          childId: createdChildId,
          createdBy: entry.createdBy || auth?.currentUser?.uid,
          createdAt: entry.createdAt || new Date().toISOString(),
          isArchived: archived,
          archivedAt,
          archivedBy,
        },
        archived,
      });

      await updateCreatedChild(buildMedicalProfileUpdate(nextMedicationDetails));

      if (editingMedicationId === entry.id) {
        clearMedicationDraft();
      }
    } catch (error) {
      console.error("Failed to archive medication detail:", error);
      setSubmitError(error?.message || "Could not update this medication right now.");
    }
  };

  const handleWizardBack = () => {
    setCurrentStep((current) => Math.max(1, current - 1));
  };

  const handleWizardContinue = async () => {
    if (currentStep === 1) {
      handleSubmit();
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((current) => Math.min(5, current + 1));
      return;
    }

    await handleFinish();
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
        disabled={childForm.loading}
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

  const handleFinish = async () => {
    setSubmitError("");
    try {
      if (createdChildId) {
        await updateCreatedChild(buildMedicalProfileUpdate());
      }

      if (onSuccess) {
        onSuccess({
          id: createdChildId,
          name: createdChildName || name.trim(),
        });
      } else {
        onClose();
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save profile details:", error);
      setSubmitError(error?.message || "Could not save the profile details right now.");
    }
  };

  const handleClose = async () => {
    if (createdChildId) {
      await handleFinish();
      return;
    }

    resetForm();
    onClose();
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
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <UploadFileOutlinedIcon fontSize="small" color="primary" />
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
        if (createdChildId) {
          onViewTodayMedications?.(createdChildId);
        }
      }}
      disabled={!createdChildId}
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


  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title={stage === "setup" ? "Profile Created!" : t("common:modal.add_new", { item: t("terms:profile_one") })}
      subtitle={stage === "setup" ? "Add more details at your leisure." : "Start with the basics. Add the rest later if you want."}
      mobileBreakpoint={1023.95}
      maxWidth="md"
      surfaceSx={{ height: "80vh", maxHeight: "80vh" }}
      bodySx={{ px: { xs: 0, sm: 3 }, pt: { xs: 0.75, sm: 2.25 }, pb: { xs: 2, sm: 2.5 } }}
      headerContent={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontWeight: 800, flexShrink: 0 }}>
            {createdChildName || name || "New child"}
          </Typography>
          <Box sx={{ flex: 1, minWidth: 160 }}>
            <LinearProgress variant="determinate" value={PROFILE_SETUP_PROGRESS} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            {`${PROFILE_SETUP_PROGRESS}% complete`}
          </Typography>
        </Box>
      }
      footer={wizardFooter}
    >
      <ChildProfileFlowContent
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
        photo={photo}
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
        createdChildName={createdChildName}
        profileProgress={PROFILE_SETUP_PROGRESS}
        isSubmitting={childForm.loading}
        onCreate={handleSubmit}
        onFinish={handleFinish}
        onClose={handleClose}
        t={t}
      />
    </LogFormShell>
  );
};

export default AddChildModal;
