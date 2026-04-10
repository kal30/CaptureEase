import React, { useState } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addChild as createChild } from "../../../services/childService";
import { EnhancedLoadingButton, LogFormShell } from "../../../components/UI";
import { useAsyncForm } from "../../../hooks/useAsyncForm";
import ChildProfileFormFields from "../shared/ChildProfileFormFields";

const AddChildModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation(["terms", "common"]);
  const [submitError, setSubmitError] = useState("");
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

  const childForm = useAsyncForm({
    onSuccess: (docRef) => {
      resetForm();
      setSubmitError("");
      if (onSuccess) {
        onSuccess(docRef);
      } else {
        onClose();
      }
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

        const childData = {
          name,
          age,
          photoURL: photoDownloadURL,
          conditions: selectedConditions,
          conditionCodes,
          medicalProfile: {
            foodAllergies,
            dietaryRestrictions,
            sensoryIssues,
            behavioralTriggers,
            currentMedications,
            sleepIssues,
            communicationNeeds,
          },
        };

        const childId = await createChild(childData);
        return { id: childId, ...childData };
      },
      { name, age }
    );
  };

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
    childForm.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <LogFormShell
      open={open}
      onClose={handleClose}
      title="Add a new person to track"
      subtitle="Start with the basics. Add the rest later if you want."
      mobileBreakpoint="md"
      maxWidth="md"
      footer={(
        <>
          {submitError ? (
            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setSubmitError("")}>
              {submitError}
            </Alert>
          ) : null}
          <EnhancedLoadingButton
            variant="success-gradient"
            loading={childForm.loading}
            loadingStyle="pulse"
            loadingText={`${t("common:actions.add")}ing ${t("terms:profile_one").toLowerCase()}...`}
            onClick={handleSubmit}
            fullWidth
            elevated
            size="large"
          >
            {t("common:actions.add")} {t("terms:profile_one")}
          </EnhancedLoadingButton>
        </>
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

export default AddChildModal;
