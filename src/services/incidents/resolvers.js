import { INCIDENT_TYPES } from '../../constants/incidents/types';

// Resolve incident type config by enum key (e.g., 'BEHAVIORAL') or id (e.g., 'behavioral')
export const getIncidentTypeConfig = (typeOrId, customCategories = {}) => {
  if (!typeOrId) return INCIDENT_TYPES.OTHER;
  // 1) Direct key match on enum-like keys
  if (INCIDENT_TYPES[typeOrId]) return INCIDENT_TYPES[typeOrId];
  // 2) Match by id field on base types
  const byId = Object.values(INCIDENT_TYPES).find(
    (t) => t.id === String(typeOrId).toLowerCase()
  );
  if (byId) return byId;
  // 3) Custom categories can be keyed by id
  if (customCategories && customCategories[typeOrId]) return customCategories[typeOrId];
  // 4) Try to find in custom categories by id match
  const customById = Object.values(customCategories || {}).find(
    (c) => c.id === String(typeOrId).toLowerCase()
  );
  if (customById) return customById;
  return INCIDENT_TYPES.OTHER;
};

// Return merged map of incident types with optional custom categories (custom overrides)
export const getAllIncidentTypes = (customCategories = {}) => ({
  ...INCIDENT_TYPES,
  ...customCategories,
});

export const getIncidentTypeId = (typeOrId, customCategories = {}) => {
  const cfg = getIncidentTypeConfig(typeOrId, customCategories);
  return cfg?.id || 'other';
};

export const getIncidentEmojiAndLabel = (typeOrId, customCategories = {}) => {
  const cfg = getIncidentTypeConfig(typeOrId, customCategories);
  return { emoji: cfg?.emoji || '📝', label: cfg?.label || 'Other' };
};

