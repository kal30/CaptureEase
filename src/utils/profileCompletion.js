const hasAnyValue = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => {
      if (item == null) return false;
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item === "object") {
        return Object.values(item).some((nested) => {
          if (nested == null) return false;
          if (typeof nested === "string") return nested.trim().length > 0;
          return Boolean(nested);
        });
      }
      return Boolean(item);
    });
  }

  if (typeof value === "object" && value) {
    return Object.values(value).some((nested) => {
      if (nested == null) return false;
      if (typeof nested === "string") return nested.trim().length > 0;
      if (Array.isArray(nested)) return hasAnyValue(nested);
      return Boolean(nested);
    });
  }

  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};

export const getChildProfileCompletion = (child = {}) => {
  let score = 0;

  if (hasAnyValue(child.name) && hasAnyValue(child.age)) {
    score += 20;
  } else if (hasAnyValue(child.name) || hasAnyValue(child.age)) {
    score += 10;
  }

  if (hasAnyValue(child.photoURL)) {
    score += 10;
  }

  if (hasAnyValue(child.concerns) || hasAnyValue(child.conditions) || hasAnyValue(child.diagnosis)) {
    score += 10;
  }

  const medicalProfile = child.medicalProfile || {};

  if (hasAnyValue(medicalProfile.foodAllergies)) {
    score += 15;
  }

  if (hasAnyValue(medicalProfile.currentMedications) || hasAnyValue(medicalProfile.medicationDetails)) {
    score += 15;
  }

  if (hasAnyValue(medicalProfile.sensoryIssues)) {
    score += 10;
  }

  if (hasAnyValue(medicalProfile.behavioralTriggers)) {
    score += 10;
  }

  if (hasAnyValue(medicalProfile.communicationNeeds)) {
    score += 10;
  }

  if (hasAnyValue(medicalProfile.sleepIssues)) {
    score += 5;
  }

  if (hasAnyValue(medicalProfile.dietaryRestrictions)) {
    score += 5;
  }

  return Math.min(100, score);
};

export const isChildProfileComplete = (child = {}) => getChildProfileCompletion(child) >= 100;
