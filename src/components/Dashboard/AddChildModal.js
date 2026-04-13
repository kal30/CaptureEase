import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useTranslation } from "react-i18next";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../services/firebase";
import ChildProfileFlowContent from "./shared/ChildProfileFlowContent";
import MedicationDetailCard from "./shared/MedicationDetailCard";
import colors from "../../assets/theme/colors";
import {
  ThemeSpacing,
  LogFormShell,
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

const PROFILE_SETUP_PROGRESS = 20;

const AddChildModal = ({ open, onClose, onSuccess }) => {
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
    setMedicationDetails([createMedicationDetail()]);
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
    if (!createdChildId) {
      setSubmitError("Create the profile basics first before saving medication details.");
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
        childId: createdChildId,
        medication: {
          ...targetEntry,
          syncStatus: "saved",
          savedAt,
        },
        status: "saved",
      });

      await updateCreatedChild(buildMedicalProfileUpdate(nextMedicationDetails));
    } catch (error) {
      console.error("Failed to save medication detail:", error);
      setSubmitError(error?.message || "Could not save this medication row right now.");
    }
  };

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


  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title={
        stage === "setup"
          ? "Profile Created!"
          : t("common:modal.add_new", { item: t("terms:profile_one") })
      }
      subtitle={
        stage === "setup"
          ? "Add more details at your leisure."
          : "Start with the basics. Add the rest later if you want."
      }
      mobileBreakpoint={1023.95}
      maxWidth="md"
      footer={null}
    >
      <ThemeSpacing variant="modal-content">
        <ChildProfileFlowContent
          stage={stage}
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
      </ThemeSpacing>
    </LogFormShell>
  );
};

export default AddChildModal;
