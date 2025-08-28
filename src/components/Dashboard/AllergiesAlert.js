import {
  Box,
  Chip,
  Typography,
  Stack,
} from '@mui/material';
import {
  Warning as AllergyIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const SafetyContainer = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(1),
  gap: theme.spacing(0.5),
}));

const SafetyRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const SafetyIcon = styled(Box)(({ theme, icontype }) => ({
  color: icontype === 'allergy' ? theme.palette.safety.allergy : theme.palette.safety.medication,
  fontSize: 14,
  marginRight: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
}));

const ChipsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
}));

const SafetyChip = styled(Chip)(({ theme, chiptype }) => ({
  height: 18,
  fontSize: '0.7rem',
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  ...(chiptype === 'allergy' && {
    backgroundColor: theme.palette.safety.allergyBg,
    color: theme.palette.safety.allergy,
    border: `1px solid ${theme.palette.safety.allergyBorder}`,
  }),
  ...(chiptype === 'medication' && {
    backgroundColor: theme.palette.safety.medicationBg,
    color: theme.palette.safety.medication,
    border: `1px solid ${theme.palette.safety.medicationBorder}`,
  }),
}));

const CountText = styled(Typography)(({ theme, texttype }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  alignSelf: 'center',
  marginLeft: theme.spacing(0.5),
  color: texttype === 'allergy' ? theme.palette.safety.allergy : theme.palette.safety.medication,
}));

const LabelText = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  marginLeft: theme.spacing(0.5),
  alignSelf: 'center',
}));

/**
 * AllergiesAlert - Critical safety information display
 * Shows important allergies and medications prominently in child card header for safety
 */
const AllergiesAlert = ({ foodAllergies = [], currentMedications = [] }) => {
  // Filter out empty strings and null values
  const validAllergies = foodAllergies.filter(allergy => allergy && allergy.trim());
  const validMedications = currentMedications.filter(med => med && (med.name || med).trim());

  // Show component if there are allergies OR medications
  if ((!validAllergies || validAllergies.length === 0) && (!validMedications || validMedications.length === 0)) {
    return null;
  }
  
  return (
    <SafetyContainer>
      {/* Allergies Section */}
      {validAllergies.length > 0 && (
        <SafetyRow>
          <SafetyIcon icontype="allergy">
            <AllergyIcon fontSize="inherit" />
          </SafetyIcon>
          
          <ChipsContainer>
            {validAllergies.slice(0, 2).map((allergy, index) => (
              <SafetyChip
                key={index}
                label={allergy}
                size="small"
                chiptype="allergy"
              />
            ))}
            {validAllergies.length > 2 && (
              <CountText variant="caption" texttype="allergy">
                +{validAllergies.length - 2}
              </CountText>
            )}
          </ChipsContainer>
          
          <LabelText variant="caption">
            ALLERGIES
          </LabelText>
        </SafetyRow>
      )}

      {/* Medications Section */}
      {validMedications.length > 0 && (
        <SafetyRow>
          <SafetyIcon icontype="medication">
            <MedicationIcon fontSize="inherit" />
          </SafetyIcon>
          
          <ChipsContainer>
            {validMedications.slice(0, 2).map((medication, index) => {
              const medName = medication.name || medication;
              return (
                <SafetyChip
                  key={index}
                  label={medName}
                  size="small"
                  chiptype="medication"
                />
              );
            })}
            {validMedications.length > 2 && (
              <CountText variant="caption" texttype="medication">
                +{validMedications.length - 2}
              </CountText>
            )}
          </ChipsContainer>
          
          <LabelText variant="caption">
            MEDS
          </LabelText>
        </SafetyRow>
      )}
    </SafetyContainer>
  );
};

export default AllergiesAlert;