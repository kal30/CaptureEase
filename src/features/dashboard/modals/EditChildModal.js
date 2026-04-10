import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { USER_ROLES } from "../../../constants/roles";
import { EnhancedLoadingButton, LogFormShell } from "../../../components/UI";
import { useAsyncForm } from "../../../hooks/useAsyncForm";
import ChildProfileFormFields from "../shared/ChildProfileFormFields";

const EditChildModal = ({ open, onClose, child, onSuccess, userRole }) => {
  const { t } = useTranslation(["terms", "common"]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [sensoryIssues, setSensoryIssues] = useState([]);
  const [behavioralTriggers, setBehavioralTriggers] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [sleepIssues, setSleepIssues] = useState([]);
  const [communicationNeeds, setCommunicationNeeds] = useState([]);
  const storage = getStorage();

  const canEdit = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER || userRole === "parent";
  const canEditMedicalInfo = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;

  const childForm = useAsyncForm({
    onSuccess: (result) => {
      if (onSuccess) onSuccess(result);
      onClose();
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

  useEffect(() => {
    if (open && child) {
      setName(child.name || "");
      setAge(child.age || "");
      setPhotoURL(child.photoURL || null);
      setSelectedConditions(child.concerns || child.conditions || []);

      const medicalProfile = child.medicalProfile || {};
      setFoodAllergies(medicalProfile.foodAllergies || []);
      setDietaryRestrictions(medicalProfile.dietaryRestrictions || []);
      setSensoryIssues(medicalProfile.sensoryIssues || []);
      setBehavioralTriggers(medicalProfile.behavioralTriggers || []);
      setCurrentMedications(medicalProfile.currentMedications || []);
      setSleepIssues(medicalProfile.sleepIssues || []);
      setCommunicationNeeds(medicalProfile.communicationNeeds || []);

      childForm.reset();
    }
  }, [open, child?.id, child, childForm]);

  const handleClose = () => {
    childForm.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canEdit) {
      throw new Error("You do not have permission to edit this profile");
    }

    if (!child) {
      throw new Error("Profile data is not available");
    }

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

        const childRef = doc(db, "children", child.id);
        await updateDoc(childRef, updatedChild);
        return updatedChild;
      },
      { name, age }
    );
  };

  if (!canEdit) {
    if (open) {
      console.warn("EditChildModal: User does not have permission to edit child details");
    }
    return null;
  }

  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title="Edit profile"
      subtitle="Update the basics or add more details any time."
      mobileBreakpoint="md"
      maxWidth="md"
      footer={(
        <EnhancedLoadingButton
          variant="gradient"
          loading={childForm.loading}
          loadingText="Saving profile..."
          onClick={handleSubmit}
          fullWidth
          size="large"
          loadingStyle="spinner"
        >
          Save changes
        </EnhancedLoadingButton>
      )}
    >
      {childForm.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => childForm.clearError()}>
          {childForm.error}
        </Alert>
      )}

      <ChildProfileFormFields
        t={t}
        name={name}
        setName={setName}
        age={age}
        setAge={setAge}
        setPhoto={setPhoto}
        photoURL={photoURL}
        setPhotoURL={setPhotoURL}
        selectedConditions={selectedConditions}
        setSelectedConditions={setSelectedConditions}
        foodAllergies={foodAllergies}
        setFoodAllergies={setFoodAllergies}
        dietaryRestrictions={dietaryRestrictions}
        setDietaryRestrictions={setDietaryRestrictions}
        sensoryIssues={sensoryIssues}
        setSensoryIssues={setSensoryIssues}
        behavioralTriggers={behavioralTriggers}
        setBehavioralTriggers={setBehavioralTriggers}
        currentMedications={currentMedications}
        setCurrentMedications={setCurrentMedications}
        sleepIssues={sleepIssues}
        setSleepIssues={setSleepIssues}
        communicationNeeds={communicationNeeds}
        setCommunicationNeeds={setCommunicationNeeds}
      />
    </LogFormShell>
  );
};

export default EditChildModal;
