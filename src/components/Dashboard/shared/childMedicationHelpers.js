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

const getCurrentLocalTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const createMedicationSchedule = (overrides = {}) => ({
  id: overrides.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dose: String(overrides.dose || "").trim(),
  unit: String(overrides.unit || "mg").trim() || "mg",
  time: String(overrides.time || getCurrentLocalTime()).trim(),
});

export const normalizeMedicationSchedule = (entry = {}, fallbackId = "") => ({
  id: entry.id || fallbackId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dose: String(entry.dose || "").trim(),
  unit: String(entry.unit || "mg").trim() || "mg",
  time: String(entry.time || "").trim(),
});

export const createMedicationDetail = (overrides = {}) => {
  const today = new Date().toISOString().slice(0, 10);
  const form = overrides.form || "pill";
  const schedules = Array.isArray(overrides.schedules) && overrides.schedules.length
    ? overrides.schedules.map((schedule, index) => normalizeMedicationSchedule(
        schedule,
        `${overrides.id || "med"}-${index}`
      ))
    : [createMedicationSchedule({ dose: overrides.dose || "", unit: overrides.unit || "mg", time: overrides.time || "" })];
  const firstSchedule = schedules[0] || createMedicationSchedule();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    dose: firstSchedule.dose || "",
    unit: firstSchedule.unit || "mg",
    category: "prescription",
    sourceDocuments: [],
    ...overrides,
    form,
    schedules,
    startDate: overrides.startDate || today,
    isArchived: Boolean(overrides.isArchived),
    archivedAt: overrides.archivedAt || "",
    archivedBy: overrides.archivedBy || "",
    syncStatus: overrides.syncStatus || "draft",
    savedAt: overrides.savedAt || "",
  };
};

export const normalizeMedicationDetail = (entry = {}, fallbackId = "") => {
  const name = String(entry.name || "").trim();
  const form = entry.form || "pill";
  const resolvedId = entry.id || fallbackId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const schedules = Array.isArray(entry.schedules) && entry.schedules.length
    ? entry.schedules.map((schedule, index) => normalizeMedicationSchedule(
        schedule,
        `${resolvedId}-${index}`
      ))
    : [normalizeMedicationSchedule({
        id: `${resolvedId}-0`,
        dose: entry.dose || "",
        unit: entry.unit || "mg",
        time: entry.time || "",
      }, `${resolvedId}-0`)];
  const firstSchedule = schedules[0] || createMedicationSchedule();

  return {
    id: resolvedId,
    name,
    dose: firstSchedule.dose || String(entry.dose || "").trim(),
    unit: firstSchedule.unit || String(entry.unit || "mg").trim() || "mg",
    time: firstSchedule.time || String(entry.time || "").trim(),
    form,
    category: entry.category || "prescription",
    schedules,
    startDate: String(entry.startDate || "").trim(),
    isArchived: Boolean(entry.isArchived),
    archivedAt: String(entry.archivedAt || "").trim(),
    archivedBy: String(entry.archivedBy || "").trim(),
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

  const scheduleCount = Array.isArray(normalized.schedules) ? normalized.schedules.length : 0;
  const primarySchedule = normalized.schedules?.[0];
  const doseText = primarySchedule?.dose || normalized.dose;
  const unitText = primarySchedule?.unit || normalized.unit;
  const timeText = primarySchedule?.time || normalized.time;
  const parts = [];

  parts.push(normalized.name);
  if (doseText) {
    parts.push(unitText ? `${doseText} ${unitText}` : doseText);
  }

  if (timeText) {
    parts.push(timeText);
  }

  if (scheduleCount > 1) {
    parts.push(`${scheduleCount} doses`);
  }

  const categoryLabel = MEDICATION_CATEGORY_OPTIONS.find((option) => option.value === normalized.category)?.label || "Other";
  return `${categoryLabel}: ${parts.join(" • ")}`;
};
