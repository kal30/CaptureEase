import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  Paper,
  useMediaQuery,
  Stack,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ShareIcon from "@mui/icons-material/Share";
import { alpha, useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import colors from "../../assets/theme/colors";
import { getTimelineEntries } from "../../services/timelineService";
import { CATEGORY_COLORS } from "../../constants/categoryColors";
import { useNavigate } from "react-router-dom";

const RANGE_PRESET = {
  WEEK: "week",
  MONTH: "month",
  CUSTOM: "custom",
};

const GROUP_MODE = {
  DATE: "date",
  ACTIVITY: "activity",
};

const CATEGORY_META = {
  incident: { label: "IMPORTANT MOMENT", emoji: "🚨", order: 1 },
  importantMoment: { label: "IMPORTANT MOMENT", emoji: "⭐", order: 1 },
  behavior: { label: "BEHAVIOR", emoji: "🌋", order: 2 },
  health: { label: "HEALTH", emoji: "💊", order: 3 },
  mood: { label: "MOOD", emoji: "😰", order: 4 },
  sleep: { label: "SLEEP", emoji: "😴", order: 5 },
  food: { label: "FOOD", emoji: "🍽️", order: 6 },
  milestone: { label: "WIN", emoji: "⭐", order: 7 },
  log: { label: "DAILY LOG", emoji: "📓", order: 8 },
  daily_note: { label: "DAILY LOG", emoji: "📓", order: 8 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toEntryDate = (timestamp) => timestamp?.toDate?.() || new Date(timestamp);

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const getWeekRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
};

const getMonthRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start, end };
};

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

const formatCompactDate = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const formatPeriodLabel = (start, end, preset) => {
  if (!isValidDate(start) || !isValidDate(end)) return "";

  if (preset === RANGE_PRESET.WEEK) {
    return `Week of ${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  }

  return `${formatLongDate(start)} – ${formatLongDate(end)}`;
};

const getRangeHelperText = (preset) => {
  if (preset === RANGE_PRESET.WEEK) {
    return "This Week — default for weekly therapy appointments";
  }
  if (preset === RANGE_PRESET.MONTH) {
    return "This Month — for monthly specialist visits, psychiatrist appointments, IEP reviews";
  }
  return "Custom Range — for parents who want to pull 6 weeks before an annual IEP meeting or a new doctor consultation";
};

const sanitizeSummary = (value = "") => value.replace(/^(Behavior|Health|Mood|Sleep|Food|Win|Daily Log|Important Moment):\s*/i, "").trim();

const getMeaningfulSummary = (entry) => {
  const content = sanitizeSummary(entry.content || entry.originalData?.text || entry.originalData?.notes || entry.originalData?.description || "");
  if (content) return content;

  const title = sanitizeSummary(entry.title || "");
  if (title && title !== "Entry" && title !== "Daily Care") return title;

  return "";
};

const getLoggedByName = (entry) => {
  const value =
    entry.originalData?.authorName ||
    entry.originalData?.loggedBy?.name ||
    entry.originalData?.author ||
    entry.originalData?.createdByName ||
    entry.author;

  if (!value || value === "Unknown") {
    return "";
  }

  return String(value).trim();
};

const getInitials = (name = "") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
};

const isLowSignalEntry = (entry) => {
  if (entry.type === "daily_care") {
    return true;
  }

  const summary = getMeaningfulSummary(entry);
  if (!summary) {
    return true;
  }

  if (["mood_log", "sleep_log", "food_log"].includes(entry.type) && /update$/i.test(summary)) {
    return true;
  }

  return false;
};

const isImportantMomentEntry = (entry) =>
  entry.type === "incident" || entry.isImportantMoment || entry.importantMoment || entry.originalData?.importantMoment;

const getCategoryMeta = (entry) => {
  if (isImportantMomentEntry(entry)) {
    return CATEGORY_META.importantMoment;
  }

  return CATEGORY_META[entry.type] || CATEGORY_META.log;
};

const getCategoryColors = (entry) => {
  if (isImportantMomentEntry(entry)) {
    return CATEGORY_COLORS.importantMoment;
  }

  return CATEGORY_COLORS[entry.type] || CATEGORY_COLORS.log;
};

const normalizeText = (value = "") => String(value ?? "").replace(/\s+/g, " ").trim();

const getEntryDayKey = (entry) => startOfDay(toEntryDate(entry.timestamp)).toISOString();

const getEntrySearchText = (entry = {}) =>
  normalizeText([
    getMeaningfulSummary(entry),
    entry.title,
    entry.content,
    entry.notes,
    entry.description,
    entry.originalData?.text,
    entry.originalData?.notes,
    entry.originalData?.description,
    entry.incidentData?.notes,
    entry.incidentData?.description,
    entry.categoryLabel,
    entry.titlePrefix,
    entry.medicationName,
    entry.medicationDetails?.medicationName,
    entry.medicationDetails?.name,
    entry.medicationScheduleDose,
    entry.medicationDetails?.dosage,
    entry.medicationDetails?.dose,
    entry.medicationScheduleUnit,
    entry.medicationDetails?.unit,
  ].filter(Boolean).join(" "));

const isSleepEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || "").toLowerCase();
  return type.includes("sleep") || /\bsleep\b/i.test(getEntrySearchText(entry));
};

const isFoodEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || "").toLowerCase();
  return type.includes("food") || /\bfood\b/i.test(getEntrySearchText(entry));
};

const isMedicationEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || "").toLowerCase();
  if (type.includes("medication") || type === "meds") {
    return true;
  }

  const label = normalizeText([entry.titlePrefix, entry.categoryLabel, entry.title].filter(Boolean).join(" ")).toLowerCase();
  return /\bmedication(s)?\b/.test(label) || /\bmeds?\b/.test(label);
};

const isBehaviorEntry = (entry = {}) => {
  if (isImportantMomentEntry(entry)) {
    return true;
  }

  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || "").toLowerCase();
  if (type.includes("behavior") || type === "incident") {
    return true;
  }

  return /behavior|meltdown|tantrum|aggress|hit|bite|kick|elop|refus|unsafe|restraint/i.test(getEntrySearchText(entry));
};

const DISTURBED_SLEEP_PATTERNS = [
  /restless/i,
  /disturb/i,
  /woke/i,
  /waking/i,
  /broken sleep/i,
  /poor sleep/i,
  /trouble sleeping/i,
  /night waking/i,
  /interrupted/i,
  /short sleep/i,
  /bad night/i,
  /sleep \w*poor/i,
];

const STABLE_SLEEP_PATTERNS = [
  /slept through/i,
  /rested/i,
  /good sleep/i,
  /steady sleep/i,
  /calm night/i,
  /well slept/i,
];

const FOOD_SIGNAL_PATTERNS = [
  /low appetite/i,
  /poor appetite/i,
  /didn'?t eat/i,
  /did not eat/i,
  /skipped (?:breakfast|lunch|dinner|a meal|meals)/i,
  /refused to eat/i,
  /picky/i,
  /selective eating/i,
  /snack(?:s)? only/i,
  /small meal/i,
  /barely ate/i,
  /ate a little/i,
];

const BEHAVIOR_CONCERN_RULES = [
  {
    key: "aggression",
    label: "Aggression",
    patterns: [/aggress/i, /\bhit(?:ting|s|)\b/i, /\bbit(?:e|ing|es)?\b/i, /\bkick(?:ed|ing|s)?\b/i, /\bthrow(?:s|ing|n)?\b/i],
  },
  {
    key: "school_refusal",
    label: "School refusal",
    patterns: [/school refusal/i, /refus(?:ed|al).*school/i, /won'?t go to school/i, /\bschool\b.*\brefus/i],
  },
  {
    key: "escalation",
    label: "Escalation",
    patterns: [/meltdown/i, /tantrum/i, /elop(?:e|ed|ing)?/i, /\bunsafe\b/i, /restraint/i, /panic/i],
  },
];

const summarizeMedicationEntries = (entries = []) => {
  const medicationEntries = entries.filter(isMedicationEntry);
  if (!medicationEntries.length) {
    return {
      text: "Medication logs were not added for this period.",
      groups: [],
      dayCount: 0,
      entryCount: 0,
    };
  }

  const grouped = medicationEntries.reduce((acc, entry) => {
    const name = normalizeText(
      entry.medicationName
      || entry.medicationDetails?.medicationName
      || entry.medicationDetails?.name
      || entry.title
      || entry.categoryLabel
      || entry.titlePrefix
      || "Medication"
    ) || "Medication";
    const dose = normalizeText([
      entry.medicationScheduleDose || entry.medicationDetails?.dosage || entry.medicationDetails?.dose || entry.dosage || entry.dose,
      entry.medicationScheduleUnit || entry.medicationDetails?.unit || entry.unit,
    ].filter(Boolean).join(" "));
    const status = String(entry.status || entry.backfillStatus || "").toLowerCase() === "missed" ? "missed" : "given";
    const key = `${name.toLowerCase()}|${dose.toLowerCase()}`;

    if (!acc[key]) {
      acc[key] = {
        name,
        dose,
        givenCount: 0,
        missedCount: 0,
        dayKeys: new Set(),
      };
    }

    acc[key][status === "missed" ? "missedCount" : "givenCount"] += 1;
    acc[key].dayKeys.add(getEntryDayKey(entry));
    return acc;
  }, {});

  const groups = Object.values(grouped)
    .sort((a, b) => (b.givenCount + b.missedCount) - (a.givenCount + a.missedCount) || a.name.localeCompare(b.name))
    .slice(0, 3);

  const totalDays = new Set(medicationEntries.map(getEntryDayKey)).size;
  const groupText = groups.map((group) => {
    const label = group.dose ? `${group.name} ${group.dose}` : group.name;
    if (group.givenCount && group.missedCount) {
      return `${label} — given ${group.givenCount} times, missed ${group.missedCount} times`;
    }
    if (group.missedCount && !group.givenCount) {
      return `${label} — missed ${group.missedCount} times`;
    }
    return `${label} — given ${group.givenCount || group.missedCount} times`;
  }).join("; ");
  const extraCount = Object.keys(grouped).length - groups.length;

  return {
    text: `Medication logs were added on ${totalDays} ${totalDays === 1 ? "day" : "days"}${groupText ? `: ${groupText}` : ""}${extraCount > 0 ? `; +${extraCount} more` : ""}.`,
    groups,
    dayCount: totalDays,
    entryCount: medicationEntries.length,
  };
};

const summarizeSleepEntries = (entries = []) => {
  const sleepEntries = entries.filter(isSleepEntry);
  if (!sleepEntries.length) {
    return {
      text: "Sleep logs were not added for this period.",
      dayKeys: new Set(),
      entryCount: 0,
    };
  }

  const dayKeys = new Set(sleepEntries.map(getEntryDayKey));
  const restlessCount = sleepEntries.filter((entry) => DISTURBED_SLEEP_PATTERNS.some((pattern) => pattern.test(getEntrySearchText(entry)))).length;
  const steadyCount = sleepEntries.filter((entry) => STABLE_SLEEP_PATTERNS.some((pattern) => pattern.test(getEntrySearchText(entry)))).length;

  let patternText = "Sleep looked mostly steady.";
  if (restlessCount && steadyCount) {
    patternText = "Sleep was mixed, with some restless or interrupted nights.";
  } else if (restlessCount) {
    patternText = "Sleep looked restless or interrupted on several nights.";
  }

  return {
    text: `Sleep was logged on ${dayKeys.size} ${dayKeys.size === 1 ? "day" : "days"}. ${patternText}`,
    dayKeys,
    entryCount: sleepEntries.length,
  };
};

const summarizeFoodEntries = (entries = []) => {
  const foodEntries = entries.filter(isFoodEntry);
  if (!foodEntries.length) {
    const generalEntries = entries.filter((entry) => !isSleepEntry(entry) && !isMedicationEntry(entry) && !isBehaviorEntry(entry));
    return {
      text: generalEntries.length
        ? "General notes were brief and mostly routine."
        : "Food and general notes were limited for this period.",
      dayKeys: new Set(generalEntries.map(getEntryDayKey)),
      entryCount: generalEntries.length,
    };
  }

  const dayKeys = new Set(foodEntries.map(getEntryDayKey));
  const signalCount = foodEntries.filter((entry) => FOOD_SIGNAL_PATTERNS.some((pattern) => pattern.test(getEntrySearchText(entry)))).length;
  const noteText = signalCount
    ? `Food notes mentioned lower appetite or selective eating on ${dayKeys.size} ${dayKeys.size === 1 ? "day" : "days"}.`
    : "Food entries were brief and mostly routine.";

  return {
    text: noteText,
    dayKeys,
    entryCount: foodEntries.length,
  };
};

const summarizeBehaviorEntries = (entries = []) => {
  const behaviorEntries = entries.filter(isBehaviorEntry);
  if (!behaviorEntries.length) {
    return {
      text: "Behavior was not logged in this period.",
      concerns: [],
      dayKeys: new Set(),
      entryCount: 0,
    };
  }

  const buckets = behaviorEntries.reduce((acc, entry) => {
    const text = getEntrySearchText(entry);
    const matchedRule = BEHAVIOR_CONCERN_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(text)));
    const key = matchedRule?.key || "general_behavior";
    if (!acc[key]) {
      acc[key] = {
        label: matchedRule?.label || (isImportantMomentEntry(entry) ? "Important moment" : "Behavior concern"),
        count: 0,
        dayKeys: new Set(),
        examples: [],
      };
    }

    acc[key].count += 1;
    acc[key].dayKeys.add(getEntryDayKey(entry));
    const example = getMeaningfulSummary(entry);
    if (example && acc[key].examples.length < 2) {
      acc[key].examples.push(example);
    }
    return acc;
  }, {});

  const concerns = Object.values(buckets)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 3)
    .map((bucket) => {
      const dayCount = bucket.dayKeys.size;
      const exampleText = bucket.examples[0] ? ` Example: ${bucket.examples[0]}.` : "";
      return `${bucket.label} was noted ${bucket.count} ${bucket.count === 1 ? "time" : "times"} across ${dayCount} ${dayCount === 1 ? "day" : "days"}.${exampleText}`;
    });

  return {
    text: `${behaviorEntries.length} behavior ${behaviorEntries.length === 1 ? "entry was" : "entries were"} logged.`,
    concerns,
    dayKeys: new Set(behaviorEntries.map(getEntryDayKey)),
    entryCount: behaviorEntries.length,
  };
};

const summarizePatterns = ({ sleepSummary, behaviorSummary, foodSummary, medicationSummary }) => {
  const patterns = [];
  const sleepBehaviorOverlap = [...sleepSummary.dayKeys].filter((dayKey) => behaviorSummary.dayKeys.has(dayKey));
  const foodBehaviorOverlap = [...foodSummary.dayKeys].filter((dayKey) => behaviorSummary.dayKeys.has(dayKey));

  if (sleepSummary.entryCount && behaviorSummary.entryCount && sleepBehaviorOverlap.length) {
    patterns.push("Behavior concerns showed up on some of the same days as restless sleep.");
  }

  if (foodSummary.entryCount && behaviorSummary.entryCount && foodBehaviorOverlap.length) {
    patterns.push("Food-related notes appeared on some of the same days as behavior concerns.");
  }

  if (medicationSummary.entryCount) {
    const totalGroups = medicationSummary.groups?.length || 0;
    if (totalGroups === 1 && medicationSummary.dayCount >= 3) {
      patterns.push("Medication logging was fairly consistent across the period.");
    } else if (medicationSummary.dayCount >= 4) {
      patterns.push("Medication logs were spread across most of the period.");
    }
  }

  if (!patterns.length) {
    patterns.push("No clear pattern stood out from this period.");
  }

  return patterns.slice(0, 3);
};

const buildTherapyPrepSummary = (entries = []) => {
  const sleepSummary = summarizeSleepEntries(entries);
  const behaviorSummary = summarizeBehaviorEntries(entries);
  const medicationSummary = summarizeMedicationEntries(entries);
  const foodSummary = summarizeFoodEntries(entries);
  const patterns = summarizePatterns({
    sleepSummary,
    behaviorSummary,
    foodSummary,
    medicationSummary,
  });

  return {
    bullets: [
      { label: "Sleep", text: sleepSummary.text },
      { label: "Behavior", text: behaviorSummary.text },
      { label: "Medication", text: medicationSummary.text },
      { label: "Food / notes", text: foodSummary.text },
    ],
    notableConcerns: behaviorSummary.concerns.slice(0, 3),
    possiblePatterns: patterns,
    medicationSummary,
  };
};

const getTherapyPrepCategory = (entry = {}) => {
  if (isSleepEntry(entry)) return "sleep";
  if (isBehaviorEntry(entry)) return "behavior";
  if (isMedicationEntry(entry)) return "medication";
  if (isFoodEntry(entry)) return "food";
  return "notes";
};

const THERAPY_PREP_FILTERS = [
  { key: "sleep", label: "Sleep", emoji: "😴" },
  { key: "behavior", label: "Behavior", emoji: "🌋" },
  { key: "medication", label: "Medication", emoji: "💊" },
  { key: "food", label: "Food", emoji: "🍽️" },
  { key: "notes", label: "Notes", emoji: "📓" },
];

const buildQuestionsToDiscuss = (summaryData) => {
  const questions = [];
  const sleepText = summaryData.bullets.find((item) => item.label === "Sleep")?.text || "";
  const behaviorConcerns = summaryData.notableConcerns || [];
  const foodText = summaryData.bullets.find((item) => item.label === "Food / notes")?.text || "";
  const medicationText = summaryData.bullets.find((item) => item.label === "Medication")?.text || "";

  if (/restless|interrupted|mixed/i.test(sleepText)) {
    questions.push("Did anything in the evening routine line up with the restless sleep?");
  } else {
    questions.push("How consistent has sleep been during this period?");
  }

  if (behaviorConcerns.length) {
    questions.push("What usually helped when these behavior concerns came up?");
  } else {
    questions.push("Were there any new behavior triggers or changes to watch for?");
  }

  if (/medication logs were added/i.test(medicationText)) {
    questions.push("Any side effects, missed doses, or medication timing changes to note?");
  } else if (/food notes mentioned/i.test(foodText)) {
    questions.push("Did appetite or food preferences change on the harder days?");
  } else {
    questions.push("Is there anything else you want the therapist to keep in mind?");
  }

  return questions.slice(0, 3);
};

const buildKeyEvents = (entries = []) => {
  const sorted = [...entries].sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp));
  const behaviorEvents = sorted.filter((entry) => isBehaviorEntry(entry) || isImportantMomentEntry(entry));
  const medicationEvents = sorted.filter(isMedicationEntry);
  const events = [];

  behaviorEvents.slice(0, 4).forEach((entry) => {
    events.push({
      id: entry.id,
      label: isImportantMomentEntry(entry) ? "Important moment" : "Behavior",
      text: getMeaningfulSummary(entry) || "Behavior note",
      date: toEntryDate(entry.timestamp),
      category: getTherapyPrepCategory(entry),
    });
  });

  if (events.length < 4 && medicationEvents.length) {
    const medSummary = summarizeMedicationEntries(medicationEvents);
    medSummary.groups.slice(0, 2).forEach((group, index) => {
      events.push({
        id: `med-${index}-${group.name}`,
        label: "Medication",
        text: group.dose ? `${group.name} ${group.dose} — given ${group.givenCount || group.missedCount} times` : `${group.name} — given ${group.givenCount || group.missedCount} times`,
        date: toEntryDate(medicationEvents[0].timestamp),
        category: "medication",
      });
    });
  }

  return events.slice(0, 5);
};

const groupMedicationEntriesByDose = (entries = []) => {
  const grouped = entries.reduce((acc, entry) => {
    const name = normalizeText(
      entry.medicationName
      || entry.medicationDetails?.medicationName
      || entry.medicationDetails?.name
      || entry.title
      || entry.categoryLabel
      || entry.titlePrefix
      || "Medication"
    ) || "Medication";
    const dose = normalizeText([
      entry.medicationScheduleDose || entry.medicationDetails?.dosage || entry.medicationDetails?.dose || entry.dosage || entry.dose,
      entry.medicationScheduleUnit || entry.medicationDetails?.unit || entry.unit,
    ].filter(Boolean).join(" "));
    const status = String(entry.status || entry.backfillStatus || "").toLowerCase() === "missed" ? "missed" : "given";
    const key = `${name.toLowerCase()}|${dose.toLowerCase()}`;

    if (!acc[key]) {
      acc[key] = {
        name,
        dose,
        givenCount: 0,
        missedCount: 0,
      };
    }

    acc[key][status === "missed" ? "missedCount" : "givenCount"] += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => (b.givenCount + b.missedCount) - (a.givenCount + a.missedCount) || a.name.localeCompare(b.name));
};

const getSectionHeaderSx = (theme) => ({
  fontWeight: 900,
  fontSize: "0.92rem",
  letterSpacing: 0.45,
});

const getDateHeaderSx = () => ({
  fontWeight: 900,
  fontSize: "1.08rem",
  letterSpacing: 0.15,
  mb: 0.9,
});

const getLoggerBadgeSx = (theme) => ({
  width: 22,
  height: 22,
  borderRadius: "50%",
  bgcolor: alpha(theme.palette.text.primary, 0.08),
  color: "text.secondary",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.65rem",
  fontWeight: 800,
});

const getMetaDateSx = () => ({
  fontSize: "0.86rem",
  fontWeight: 700,
  letterSpacing: 0.15,
  color: "text.secondary",
  fontFamily: '"Avenir Next", "Inter", sans-serif',
});

const getMetaTimeSx = (theme) => ({
  fontSize: "0.78rem",
  fontWeight: 600,
  color: alpha(theme.palette.text.secondary, 0.82),
  ml: 0.35,
});

const getCategoryPillSx = (palette = {}, theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.65,
  px: 0.95,
  py: 0.34,
  borderRadius: 999,
  bgcolor: palette.bg || alpha(theme.palette.text.primary, 0.06),
  color: palette.text || theme.palette.text.primary,
  border: `1px solid ${palette.border || alpha(theme.palette.text.primary, 0.12)}`,
});

const getCategoryPillTextSx = () => ({
  fontSize: "0.86rem",
  fontWeight: 900,
  color: "inherit",
  lineHeight: 1.1,
  display: "flex",
  alignItems: "center",
});

const buildCategorySections = (entries) => {
  const grouped = entries.reduce((acc, entry) => {
    const meta = getCategoryMeta(entry);
    const key = meta.label;
    if (!acc[key]) {
      acc[key] = { ...meta, items: [] };
    }
    acc[key].items.push(entry);
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((section) => ({
      ...section,
      items: section.items.sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp)),
    }));
};

const buildDateSections = (entries) => {
  const grouped = entries.reduce((acc, entry) => {
    const date = toEntryDate(entry.timestamp);
    const key = startOfDay(date).toISOString();
    if (!acc[key]) {
      acc[key] = { date, items: [] };
    }
    acc[key].items.push(entry);
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.date - a.date)
    .map((section) => ({
      ...section,
      items: section.items.sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp)),
    }));
};

const buildShareText = ({ childName, periodLabel, dateSections, summaryData, questions, keyEvents }) => {
  const lines = [`Therapy Prep — ${childName}`, periodLabel, ""];

  lines.push("Summary");
  summaryData.bullets.forEach((bullet) => {
    lines.push(`- ${bullet.label}: ${bullet.text}`);
  });

  if (summaryData.notableConcerns.length) {
    lines.push("");
    lines.push("Notable concerns");
    summaryData.notableConcerns.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (summaryData.possiblePatterns.length) {
    lines.push("");
    lines.push("Possible patterns");
    summaryData.possiblePatterns.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (questions.length) {
    lines.push("");
    lines.push("Questions to discuss");
    questions.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (keyEvents.length) {
    lines.push("");
    lines.push("Key events");
    keyEvents.forEach((item) => {
      lines.push(`- ${formatCompactDate(item.date)} · ${item.label}: ${item.text}`);
    });
  }

  lines.push("");
  lines.push("Full logs");
  lines.push("");

  dateSections.forEach((section) => {
    lines.push(section.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    lines.push("───────────────────");
    const meds = groupMedicationEntriesByDose(section.items.filter(isMedicationEntry));
    const otherItems = section.items.filter((entry) => !isMedicationEntry(entry));

    meds.forEach((group) => {
      const label = group.dose ? `${group.name} ${group.dose}` : group.name;
      const summary = group.givenCount && group.missedCount
        ? `given ${group.givenCount} times, missed ${group.missedCount} times`
        : `given ${group.givenCount || group.missedCount} times`;
      lines.push(`💊 Medication · ${label} — ${summary}`);
    });

    otherItems.forEach((entry) => {
      const meta = getCategoryMeta(entry);
      const entryTime = toEntryDate(entry.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      lines.push(`${meta.emoji} ${meta.label} · ${entryTime} · ${getMeaningfulSummary(entry)}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
};

const DailyCareReport = ({ child, childId, childName, onLogSomething }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [rangePreset, setRangePreset] = useState(RANGE_PRESET.WEEK);
  const [customStartDate, setCustomStartDate] = useState(() => getWeekRange().start);
  const [customEndDate, setCustomEndDate] = useState(() => getWeekRange().end);
  const [entries, setEntries] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [selectedFilters, setSelectedFilters] = useState(() => THERAPY_PREP_FILTERS.map((item) => item.key));
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const activeRange = useMemo(() => {
    if (rangePreset === RANGE_PRESET.MONTH) return getMonthRange();
    if (rangePreset === RANGE_PRESET.CUSTOM) return { start: customStartDate, end: customEndDate };
    return getWeekRange();
  }, [customEndDate, customStartDate, rangePreset]);

  const rangeStart = useMemo(() => startOfDay(activeRange.start), [activeRange]);
  const rangeEnd = useMemo(() => endOfDay(activeRange.end), [activeRange]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const date = toEntryDate(entry.timestamp);
        return isValidDate(date) && date >= rangeStart && date <= rangeEnd;
      })
      .filter((entry) => selectedFilters.includes(getTherapyPrepCategory(entry)));
  }, [entries, rangeEnd, rangeStart, selectedFilters]);

  const dateSections = useMemo(() => buildDateSections(filteredEntries), [filteredEntries]);
  const summaryData = useMemo(() => buildTherapyPrepSummary(filteredEntries), [filteredEntries]);
  const keyEvents = useMemo(() => buildKeyEvents(filteredEntries), [filteredEntries]);
  const questionsToDiscuss = useMemo(() => buildQuestionsToDiscuss(summaryData), [summaryData]);
  const peopleLoggedCount = useMemo(() => {
    return new Set(filteredEntries.map(getLoggedByName).filter(Boolean)).size;
  }, [filteredEntries]);
  const periodLabel = useMemo(
    () => formatPeriodLabel(rangeStart, rangeEnd, rangePreset),
    [rangeEnd, rangePreset, rangeStart]
  );

  const shareText = useMemo(
    () =>
      buildShareText({
        childName,
        periodLabel,
        dateSections,
        summaryData,
        keyEvents,
        questions: questionsToDiscuss,
      }),
    [childName, dateSections, keyEvents, periodLabel, questionsToDiscuss, summaryData]
  );

  const loadEntries = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setFeedback("");

    try {
      const timelineEntries = await new Promise((resolve) => {
        let settled = false;
        const unsubscribe = getTimelineEntries(childId, (nextEntries) => {
          if (settled) return;
          settled = true;
          resolve(nextEntries || []);
          unsubscribe();
        });
      });

      setEntries(timelineEntries);
    } catch (error) {
      console.error("Error loading therapy prep entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    if (childId) {
      loadEntries();
    }
  }, [childId, loadEntries]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setFeedback("Therapy prep copied.");
    } catch (error) {
      console.error("Error copying therapy prep:", error);
      setFeedback("Copy failed. Try again.");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Therapy Prep — ${childName}`,
          text: shareText,
        });
        setFeedback("Therapy prep shared.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setFeedback("Share is not available here. Copied instead.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Error sharing therapy prep:", error);
        setFeedback("Share failed. Try again.");
      }
    }
  };

  const handleDownloadPdf = () => {
    setFeedback("Use the print dialog to save the report as a PDF.");
    window.setTimeout(() => {
      window.print();
    }, 0);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogSomething = () => {
    if (child && typeof onLogSomething === "function") {
      onLogSomething(child);
    }
  };

  const toggleFilter = (filterKey) => {
    setSelectedFilters((current) => {
      if (current.includes(filterKey)) {
        return current.filter((item) => item !== filterKey);
      }
      return [...current, filterKey];
    });
  };

  const toggleSection = (sectionLabel) => {
    setCollapsedSections((current) => ({
      ...current,
      [sectionLabel]: !current[sectionLabel],
    }));
  };

  const renderBulletList = (items, emptyLabel = "No clear pattern stood out.") => (
    <Stack spacing={0.6}>
      {items.length ? items.map((item) => (
        <Box key={item} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
          <Box
            sx={{
              mt: 0.85,
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.text.primary, 0.65),
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.55 }}>
            {item}
          </Typography>
        </Box>
      )) : (
        <Typography variant="body2" color="text.secondary">
          {emptyLabel}
        </Typography>
      )}
    </Stack>
  );

  const renderSummarySection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Week Snapshot
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            High-value highlights for therapists at a glance.
          </Typography>
        </Box>

        <Stack spacing={1.1}>
          {summaryData.bullets.map((bullet) => (
            <Box key={bullet.label} sx={{ display: "grid", gap: 0.15 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {bullet.label}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.55 }}>
                {bullet.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );

  const renderTopConcernsSection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: "#fff",
      }}
    >
      <Stack spacing={1.2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Top Concerns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            The highest-signal items surfaced from the period.
          </Typography>
        </Box>
        {renderBulletList(summaryData.notableConcerns, "No high-signal concerns stood out in this period.")}
      </Stack>
    </Paper>
  );

  const renderPatternsSection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: "#fff",
      }}
    >
      <Stack spacing={1.2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Possible Patterns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Simple rule-based observations to discuss, not diagnoses.
          </Typography>
        </Box>
        {renderBulletList(summaryData.possiblePatterns)}
      </Stack>
    </Paper>
  );

  const renderQuestionsSection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: "#fff",
      }}
    >
      <Stack spacing={1.2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Questions to Discuss
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            A few simple prompts for the therapist.
          </Typography>
        </Box>

        <Stack spacing={0.8}>
          {questionsToDiscuss.map((question) => (
            <Box key={question} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
              <Box
                sx={{
                  mt: 0.8,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.55 }}>
                {question}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );

  const renderKeyEventsSection = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: "#fff",
      }}
    >
      <Stack spacing={1.2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Key Events
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            High-signal moments and repeated medication context.
          </Typography>
        </Box>

        <Stack spacing={1}>
          {keyEvents.length ? keyEvents.map((event) => (
            <Box
              key={event.id}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {formatCompactDate(event.date)}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 0.2 }}>
                {event.label}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.5, mt: 0.2 }}>
                {event.text}
              </Typography>
            </Box>
          )) : (
            <Typography variant="body2" color="text.secondary">
              No standout events surfaced for this period.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  const renderDateRangeControls = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.25,
        flexWrap: "nowrap",
        overflowX: "auto",
        pb: 0.25,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ flexWrap: "nowrap", gap: 1, minWidth: "fit-content" }}>
        <Chip
          label="This Week"
          clickable
          color={rangePreset === RANGE_PRESET.WEEK ? "primary" : "default"}
          variant={rangePreset === RANGE_PRESET.WEEK ? "filled" : "outlined"}
          onClick={() => setRangePreset(RANGE_PRESET.WEEK)}
        />
        <Chip
          label="This Month"
          clickable
          color={rangePreset === RANGE_PRESET.MONTH ? "primary" : "default"}
          variant={rangePreset === RANGE_PRESET.MONTH ? "filled" : "outlined"}
          onClick={() => setRangePreset(RANGE_PRESET.MONTH)}
        />
        <Chip
          label="Custom Range"
          clickable
          color={rangePreset === RANGE_PRESET.CUSTOM ? "primary" : "default"}
          variant={rangePreset === RANGE_PRESET.CUSTOM ? "filled" : "outlined"}
          onClick={() => setRangePreset(RANGE_PRESET.CUSTOM)}
        />
      </Stack>
    </Box>
  );

  const renderDateSections = () => (
    <Stack spacing={3}>
      {dateSections.map((section) => (
        <Paper
          key={section.date.toISOString()}
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.25 },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            bgcolor: "#fff",
          }}
        >
          <Typography variant="h6" sx={getDateHeaderSx()}>
            {section.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Typography>
          <Box sx={{ height: 1, bgcolor: alpha(theme.palette.text.primary, 0.14), mb: 1.5 }} />
          <Stack spacing={1.2}>
            {groupMedicationEntriesByDose(section.items.filter(isMedicationEntry)).map((group) => (
              <Box
                key={`${group.name}-${group.dose || "no-dose"}`}
                sx={{
                  p: 1.15,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                  💊 Medication
                </Typography>
                <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600, lineHeight: 1.5, mt: 0.2 }}>
                  {group.dose ? `${group.name} ${group.dose}` : group.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.15 }}>
                  {group.givenCount && group.missedCount
                    ? `Given ${group.givenCount} times, missed ${group.missedCount} times`
                    : `Given ${group.givenCount || group.missedCount} times`}
                </Typography>
              </Box>
            ))}

            {section.items.filter((entry) => !isMedicationEntry(entry)).map((entry) => {
              const meta = getCategoryMeta(entry);
              const categoryPalette = getCategoryColors(entry) || {};
              const loggerInitials = getInitials(getLoggedByName(entry));
              const entryTime = toEntryDate(entry.timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
              return (
                <Box
                  key={entry.id}
                  sx={{
                    py: 1.1,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: entry.type === "milestone" ? alpha(theme.palette.success.light, 0.12) : "transparent",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap", mb: 0.35 }}>
                        <Box sx={getCategoryPillSx(categoryPalette, theme)}>
                          <Typography sx={getCategoryPillTextSx()}>
                            {meta.emoji} {meta.label}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          {entryTime}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.5 }}>
                        {getMeaningfulSummary(entry)}
                      </Typography>
                    </Box>

                    {loggerInitials ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0, pt: 0.15 }}>
                        <Box sx={getLoggerBadgeSx(theme)}>
                          {loggerInitials}
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
  const isCustomRangeInvalid = !isValidDate(rangeStart) || !isValidDate(rangeEnd) || rangeStart > rangeEnd;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: colors.landing.pageBackground,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(248, 250, 252, 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 1.25, sm: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <IconButton
              onClick={handleBackToDashboard}
              aria-label="Back to dashboard"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.25,
                bgcolor: colors.landing.surfaceSoft,
                border: `1px solid ${colors.landing.borderLight}`,
                color: colors.landing.heroText,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                Therapy Prep — {childName}
              </Typography>
              <Typography variant="body2" noWrap sx={{ mt: 0.25, color: "text.secondary", fontWeight: 600 }}>
                {periodLabel}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
              <IconButton
                onClick={handleDownloadPdf}
                size="small"
                aria-label="Download therapy prep as PDF"
                sx={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: "#fff",
                  color: "primary.main",
                }}
              >
                <PictureAsPdfOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleCopy}
                size="small"
                aria-label="Copy therapy prep"
                sx={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: "#fff",
                  color: "primary.main",
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleShare}
                size="small"
                aria-label="Share therapy prep"
                sx={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: "#fff",
                  color: "primary.main",
                }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setFilterPanelOpen(true)}
                size="small"
                aria-label="Open therapy filters"
                sx={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: "#fff",
                  color: "primary.main",
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            {renderDateRangeControls()}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.85 }}>
            {getRangeHelperText(rangePreset)}
          </Typography>

          {rangePreset === RANGE_PRESET.CUSTOM ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1.5 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start"
                  value={customStartDate}
                  onChange={(value) => value && setCustomStartDate(value)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
                <DatePicker
                  label="End"
                  value={customEndDate}
                  onChange={(value) => value && setCustomEndDate(value)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </LocalizationProvider>
            </Stack>
          ) : null}
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 2.5, pb: { xs: 4, md: 5 }, flex: 1 }}>
        <Stack spacing={3}>
          {feedback && <Alert severity="info">{feedback}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Building therapy prep...
              </Typography>
            </Box>
          ) : isCustomRangeInvalid ? (
            <Alert severity="warning">Select a valid date range to build therapy prep.</Alert>
          ) : filteredEntries.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Therapy Prep — {childName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {periodLabel}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No entries logged for this period. Start logging to build your therapy prep report.
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={handleLogSomething}
                underline="hover"
                sx={{ fontWeight: 700 }}
              >
                Open the daily log popup
              </Link>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleLogSomething}>
                  + Log Something
                </Button>
              </Box>
            </Paper>
          ) : (
            <>
              {renderSummarySection()}
              {renderTopConcernsSection()}
              {renderPatternsSection()}
              {renderQuestionsSection()}
              {renderKeyEventsSection()}

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Full Logs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  All logs grouped by date, with medication rows compressed for readability.
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2, flexWrap: "wrap", mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 600 }}>
                    {filteredEntries.length} total {filteredEntries.length === 1 ? "entry" : "entries"}
                    {` · ${peopleLoggedCount} ${peopleLoggedCount === 1 ? "person" : "people"} logged`}
                  </Typography>
                </Box>
                {renderDateSections()}
              </Box>
            </>
          )}
        </Stack>
      </Container>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 360,
            maxHeight: isMobile ? "72vh" : "100%",
            borderTopLeftRadius: isMobile ? 18 : 0,
            borderTopRightRadius: isMobile ? 18 : 0,
            px: 2,
            py: 2,
          },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optional activity filters
              </Typography>
            </Box>
            <Button onClick={() => setFilterPanelOpen(false)} sx={{ textTransform: "none" }}>
              Done
            </Button>
          </Box>

          <Divider />

          <Stack spacing={0.5}>
            {THERAPY_PREP_FILTERS.map((item) => (
              <Box
                key={item.key}
                onClick={() => toggleFilter(item.key)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  p: 1,
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor: selectedFilters.includes(item.key) ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                }}
              >
                <Checkbox checked={selectedFilters.includes(item.key)} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.emoji} {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => setSelectedFilters([])} sx={{ textTransform: "none" }}>
              Clear
            </Button>
            <Button variant="contained" fullWidth onClick={() => setSelectedFilters(THERAPY_PREP_FILTERS.map((item) => item.key))} sx={{ textTransform: "none" }}>
              Select All
            </Button>
          </Box>
        </Stack>
      </Drawer>
    </Box>
  );
};

export default DailyCareReport;
