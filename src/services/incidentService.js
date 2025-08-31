import { FOLLOW_UP_SCHEDULES } from "../constants/incidents/followUpSchedules";
import { INCIDENT_TYPES } from "../constants/incidents/types";
import { calculateFollowUpTimes, formatFollowUpSchedule as fmtFollowUp } from "./incidents/followUpScheduler";
import { createIncidentWithSmartFollowUp as _createIncidentWithSmartFollowUp, getCustomCategories as _getCustomCategories } from './incidents/repository';
import { SEVERITY_SCALES } from "../constants/incidents/severityScales";
import { EFFECTIVENESS_LEVELS } from "../constants/incidents/effectiveness";
import { 
  getIncidentTypeConfig as _getIncidentTypeConfig,
  getAllIncidentTypes as _getAllIncidentTypes,
  getIncidentTypeId as _getIncidentTypeId,
  getIncidentEmojiAndLabel as _getIncidentEmojiAndLabel
} from './incidents/resolvers';
export { INCIDENT_TYPES };
export { EFFECTIVENESS_LEVELS };

// Re-export resolvers for compatibility
export const getIncidentTypeConfig = _getIncidentTypeConfig;
export const getAllIncidentTypes = _getAllIncidentTypes;
export const getIncidentTypeId = _getIncidentTypeId;
export const getIncidentEmojiAndLabel = _getIncidentEmojiAndLabel;

// Helper: get severity scale for incident type
export const getSeverityScale = (incidentType) => {
  return SEVERITY_SCALES[incidentType] || SEVERITY_SCALES.other;
};

// Theme-friendly severity meta without colors (for UI mapping)
export const getSeverityMeta = (incidentType) => {
  const scale = getSeverityScale(incidentType) || {};
  const meta = {};
  Object.keys(scale).forEach((level) => {
    const { label, description } = scale[level] || {};
    if (label || description) meta[level] = { label, description };
  });
  return meta;
};

// Smart Follow-up Timing Configuration (compat re-export)
export { FOLLOW_UP_SCHEDULES };

export { calculateFollowUpTimes };
export const formatFollowUpSchedule = fmtFollowUp;
export const createIncidentWithSmartFollowUp = _createIncidentWithSmartFollowUp;
export { addIncident, updateIncidentEffectiveness, recordFollowUpResponse, getFollowUpSummary, getIncidents, getIncidentsPendingFollowUp } from './incidents/repository';

// Get custom categories for a child
export const getCustomCategories = _getCustomCategories;
export {
  getSimilarIncidentNames,
  analyzeOtherIncidentPatterns,
  checkForCategorySuggestion,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  mergeCustomCategories,
  migrateIncidentsToCustomCategory,
} from './incidents/categories';
