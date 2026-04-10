import React, { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AllergyChip from "../../../components/UI/Allergies";
import ChildPhotoUploader from "../../../components/Dashboard/ChildPhotoUploader";
import colors from "../../../assets/theme/colors";
import { ThemeSpacing, CustomizableAutocomplete } from "../../../components/UI";
import {
  CONDITION_OPTIONS,
  FOOD_ALLERGY_OPTIONS,
  DIETARY_OPTIONS,
  SENSORY_OPTIONS,
  TRIGGER_OPTIONS,
  SLEEP_OPTIONS,
  COMMUNICATION_OPTIONS,
} from "../../../constants/childProfileOptions";

const ChildProfileFormFields = ({
  t,
  name,
  setName,
  age,
  setAge,
  setPhoto,
  photoURL,
  setPhotoURL,
  selectedConditions,
  setSelectedConditions,
  foodAllergies,
  setFoodAllergies,
  dietaryRestrictions,
  setDietaryRestrictions,
  sensoryIssues,
  setSensoryIssues,
  behavioralTriggers,
  setBehavioralTriggers,
  currentMedications,
  setCurrentMedications,
  sleepIssues,
  setSleepIssues,
  communicationNeeds,
  setCommunicationNeeds,
}) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const normalizeCondition = (item) => {
    if (typeof item === "string") {
      return { code: "OTHER", label: item, custom: true };
    }

    return item && item.label
      ? item
      : { code: "OTHER", label: String(item), custom: true };
  };

  return (
    <ThemeSpacing variant="modal-content">
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: { xs: 3.5, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(247,249,252,0.96) 100%)",
          boxShadow: "0 14px 32px rgba(60, 72, 88, 0.05)",
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ pr: 1 }}>
            <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
              Photo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optional, but helpful when you want to recognize this person quickly.
            </Typography>
          </Box>
          <ChildPhotoUploader
            setPhoto={setPhoto}
            photoURL={photoURL}
            setPhotoURL={setPhotoURL}
          />
        </Stack>
      </Box>

      <ThemeSpacing variant="field">
        <TextField
          label={t("terms:profile_name")}
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: { xs: 0.5, sm: 0.25 } }}
        />
      </ThemeSpacing>

      <ThemeSpacing variant="field">
        <TextField
          label={t("terms:profile_age")}
          variant="outlined"
          fullWidth
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </ThemeSpacing>

      <CustomizableAutocomplete
        options={CONDITION_OPTIONS}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        value={selectedConditions}
        onChange={(event, newValue) => {
          const normalized = newValue.map(normalizeCondition);
          setSelectedConditions(normalized);
        }}
        label="Diagnosis / concerns"
        addText="Add concern"
        helperText="Start with the main things you want to remember."
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
                  backgroundColor: colors.landing.sageLight,
                  color: colors.brand.navy,
                  "& .MuiChip-deleteIcon": { color: colors.brand.ink },
                }}
              />
            )
          )
        }
        sx={{ mb: 1 }}
      />

      <CustomizableAutocomplete
        options={SENSORY_OPTIONS}
        value={sensoryIssues}
        onChange={(event, newValue) => setSensoryIssues(newValue)}
        label="Sensitive to"
        addText="Add sensitivity"
        helperText="Things that affect them most."
        sx={{ mb: 1 }}
      />

      <Accordion
        expanded={showMoreDetails}
        onChange={() => setShowMoreDetails((current) => !current)}
        sx={{
          mt: 1,
          borderRadius: 3,
          overflow: "hidden",
          "&:before": { display: "none" },
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography sx={{ fontWeight: 800 }}>More details</Typography>
            <Typography variant="body2" color="text.secondary">
              Add the rest if you want a fuller picture.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <ThemeSpacing variant="modal-content">
            <CustomizableAutocomplete
              options={FOOD_ALLERGY_OPTIONS}
              value={foodAllergies}
              onChange={(event, newValue) => setFoodAllergies(newValue)}
              label="Food allergies / intolerances"
              addText="Add allergy"
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <AllergyChip
                    key={index}
                    allergy={option}
                    variant="compact"
                    inForm={true}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mb: 2.5 }}
            />

            <CustomizableAutocomplete
              options={DIETARY_OPTIONS}
              value={dietaryRestrictions}
              onChange={(event, newValue) => setDietaryRestrictions(newValue)}
              label="Dietary restrictions"
              addText="Add diet"
              helperText="Special diets or restrictions they follow."
              sx={{ mb: 2.5 }}
            />

            <CustomizableAutocomplete
              options={TRIGGER_OPTIONS}
              value={behavioralTriggers}
              onChange={(event, newValue) => setBehavioralTriggers(newValue)}
              label="Common triggers"
              addText="Add trigger"
              helperText="Situations that often make things harder."
              sx={{ mb: 2.5 }}
            />

            <CustomizableAutocomplete
              options={COMMUNICATION_OPTIONS}
              value={communicationNeeds}
              onChange={(event, newValue) => setCommunicationNeeds(newValue)}
              label="Communication needs"
              addText="Add communication need"
              helperText="How they communicate best."
              sx={{ mb: 2.5 }}
            />

            <CustomizableAutocomplete
              options={SLEEP_OPTIONS}
              value={sleepIssues}
              onChange={(event, newValue) => setSleepIssues(newValue)}
              label="Sleep"
              addText="Add sleep issue"
              helperText="Optional sleep-related details."
              sx={{ mb: 2.5 }}
            />

            <CustomizableAutocomplete
              options={[]}
              value={currentMedications}
              onChange={(event, newValue) => setCurrentMedications(newValue)}
              label="Current medications"
              addText="Add medication"
              helperText="Quick summary only. Use Medical Log for detailed dose tracking."
              placeholder="Quick summary only. Use Medical Log for detailed dose tracking."
              sx={{ mb: 0 }}
            />
          </ThemeSpacing>
        </AccordionDetails>
      </Accordion>
    </ThemeSpacing>
  );
};

export default ChildProfileFormFields;
