export const MEDICATION_CATEGORY_OPTIONS = [
  { value: "prescription", label: "Prescription" },
  { value: "otc", label: "OTC" },
  { value: "supplement", label: "Supplement" },
  { value: "vitamin", label: "Vitamin" },
  { value: "prn", label: "PRN" },
  { value: "other", label: "Other" },
];

export const MEDICATION_FORM_OPTIONS = [
  { value: "pill", label: "Pill", icon: "pill", defaultRoute: "oral" },
  { value: "tablet", label: "Tablet", icon: "tablet", defaultRoute: "oral" },
  { value: "capsule", label: "Capsule", icon: "capsule", defaultRoute: "oral" },
  { value: "liquid", label: "Liquid", icon: "liquid", defaultRoute: "oral" },
  { value: "drops", label: "Drops", icon: "drops", defaultRoute: "eye" },
  { value: "cream", label: "Cream", icon: "cream", defaultRoute: "topical" },
  { value: "suppository", label: "Suppository", icon: "suppository", defaultRoute: "rectal" },
  { value: "inhaler", label: "Inhaler", icon: "inhaler", defaultRoute: "inhaled" },
];

export const MEDICATION_FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
  { value: "every_x_hours", label: "Every X hours" },
  { value: "custom", label: "Custom" },
];

export const MEDICATION_FOOD_OPTIONS = [
  { value: "before_food", label: "Before food" },
  { value: "with_food", label: "With food" },
  { value: "anytime", label: "Anytime" },
];

export const MEDICATION_TIMING_OPTIONS = [
  { value: "morning", label: "Morning", hint: "8:00" },
  { value: "afternoon", label: "Afternoon", hint: "1:00" },
  { value: "evening", label: "Evening", hint: "8:00" },
  { value: "bedtime", label: "Bedtime", hint: "10:00" },
];

export const MEDICATION_ROUTE_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "rectal", label: "Rectal" },
  { value: "vaginal", label: "Vaginal" },
  { value: "topical", label: "Topical" },
  { value: "eye", label: "Eyes" },
  { value: "ear", label: "Ears" },
  { value: "nose", label: "Nose" },
  { value: "inhaled", label: "Inhaled" },
  { value: "subcutaneous", label: "Injection" },
];

export const getMedicationDefaultRoute = (form) => {
  const formOption = MEDICATION_FORM_OPTIONS.find((option) => option.value === form);
  return formOption?.defaultRoute || "oral";
};

export const shouldShowMedicationRoute = (form) => {
  if (!form) {
    return false;
  }

  return ["suppository", "drops"].includes(form);
};

export const getMedicationRouteOptions = (form) => {
  if (form === "suppository") {
    return ["rectal", "vaginal"];
  }

  if (form === "drops") {
    return ["eye", "ear", "nose"];
  }

  return MEDICATION_ROUTE_OPTIONS.map((option) => option.value);
};

export const createMedicationDetail = (overrides = {}) => {
  const today = new Date().toISOString().slice(0, 10);
  const form = overrides.form || "pill";

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    dose: "",
    unit: "",
    frequency: "",
    category: "prescription",
    foodRelation: "anytime",
    notes: "",
    sourceDocuments: [],
    ...overrides,
    form,
    customFrequency: String(overrides.customFrequency || "").trim(),
    route: overrides.route || getMedicationDefaultRoute(form),
    timing: Array.isArray(overrides.timing) ? overrides.timing : [],
    days: Array.isArray(overrides.days) ? overrides.days : [],
    startDate: overrides.startDate || today,
    maxDailyDoses: String(overrides.maxDailyDoses || "").trim(),
    syncStatus: overrides.syncStatus || "draft",
    savedAt: overrides.savedAt || "",
  };
};

export const normalizeMedicationDetail = (entry = {}) => {
  const name = String(entry.name || "").trim();
  const form = entry.form || "pill";

  return {
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    dose: String(entry.dose || "").trim(),
    unit: String(entry.unit || "").trim(),
    frequency: String(entry.frequency || "").trim(),
    form,
    route: String(entry.route || getMedicationDefaultRoute(form)).trim() || getMedicationDefaultRoute(form),
    category: entry.category || "prescription",
    foodRelation: entry.foodRelation || "anytime",
    customFrequency: String(entry.customFrequency || "").trim(),
    timing: Array.isArray(entry.timing) ? entry.timing : [],
    days: Array.isArray(entry.days) ? entry.days : [],
    startDate: String(entry.startDate || "").trim(),
    maxDailyDoses: String(entry.maxDailyDoses || "").trim(),
    notes: String(entry.notes || "").trim(),
    sourceDocuments: Array.isArray(entry.sourceDocuments) ? entry.sourceDocuments : [],
    syncStatus: entry.syncStatus || "draft",
    savedAt: String(entry.savedAt || "").trim(),
  };
};

export const summarizeMedicationDetail = (entry = {}) => {
  const normalized = normalizeMedicationDetail(entry);
  if (!normalized.name) {
    return "";
  }

  const parts = [normalized.name];

  if (normalized.dose) {
    parts.push(normalized.unit ? `${normalized.dose} ${normalized.unit}` : normalized.dose);
  }

  if (normalized.form) {
    const formLabel = MEDICATION_FORM_OPTIONS.find((option) => option.value === normalized.form)?.label;
    if (formLabel) {
      parts.push(formLabel.toLowerCase());
    }
  }

  if (normalized.frequency) {
    parts.push(normalized.frequency);
    if (normalized.frequency === "custom" && normalized.customFrequency) {
      parts.push(normalized.customFrequency);
    }
  }

  if (normalized.foodRelation && normalized.foodRelation !== "anytime") {
    const foodLabel = MEDICATION_FOOD_OPTIONS.find((option) => option.value === normalized.foodRelation)?.label;
    if (foodLabel) {
      parts.push(foodLabel.toLowerCase());
    }
  }

  const categoryLabel = MEDICATION_CATEGORY_OPTIONS.find((option) => option.value === normalized.category)?.label || "Other";
  return `${categoryLabel}: ${parts.join(" • ")}`;
};
