import { getQuickTagGroups } from "../constants/logTypeRegistry";

const STORAGE_KEY_PREFIX = "captureez-custom-quick-tags";
const DEFAULT_EMOJI = "✨";
const DEFAULT_TAGS = [];

export const QUICK_TAG_EMOJI_CHOICES = ["✨", "💜", "🌟", "🔥", "🌈", "🫶", "💡", "🌿"];

export const normalizeQuickTagKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createCustomQuickTag = (label, icon = DEFAULT_EMOJI) => {
  const cleanLabel = String(label || "").trim();
  return {
    key: normalizeQuickTagKey(cleanLabel),
    label: cleanLabel,
    icon: icon || DEFAULT_EMOJI,
    custom: true,
  };
};

export const getCustomQuickTagsStorageKey = (userId) =>
  `${STORAGE_KEY_PREFIX}:${userId || "guest"}`;

export const loadCustomQuickTags = (userId) => {
  if (typeof window === "undefined") {
    return DEFAULT_TAGS;
  }

  try {
    const raw = window.localStorage.getItem(getCustomQuickTagsStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return DEFAULT_TAGS;
    }

    return parsed
      .map((tag) => {
        if (!tag) return null;
        if (typeof tag === "string") {
          const cleanLabel = tag.trim();
          if (!cleanLabel) return null;
          return createCustomQuickTag(cleanLabel);
        }

        const key = tag.key || normalizeQuickTagKey(tag.label);
        const label = String(tag.label || "").trim();
        if (!key || !label) return null;

        return {
          key,
          label,
          icon: tag.icon || DEFAULT_EMOJI,
          custom: true,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error loading custom quick tags:", error);
    return DEFAULT_TAGS;
  }
};

export const saveCustomQuickTags = (userId, tags = []) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getCustomQuickTagsStorageKey(userId), JSON.stringify(tags));
  } catch (error) {
    console.error("Error saving custom quick tags:", error);
  }
};

export const getBuiltinQuickTagGroups = () => getQuickTagGroups();

export const getQuickTagLookup = (customTags = []) => {
  const lookup = new Map();

  getQuickTagGroups().forEach((group) => {
    group.items.forEach((item) => {
      lookup.set(item.key, {
        key: item.key,
        label: item.label,
        icon: item.icon,
        custom: false,
      });
    });
  });

  customTags.forEach((tag) => {
    lookup.set(tag.key, {
      key: tag.key,
      label: tag.label,
      icon: tag.icon || DEFAULT_EMOJI,
      custom: true,
    });
  });

  return lookup;
};

export const getQuickTagDisplay = (tagKey, customTags = []) => {
  const lookup = getQuickTagLookup(customTags);
  const resolved = lookup.get(tagKey);
  if (resolved) {
    return resolved;
  }

  return {
    key: tagKey,
    label: tagKey,
    icon: DEFAULT_EMOJI,
    custom: true,
  };
};

export const getAllQuickTagOptions = (customTags = []) => {
  const builtins = getQuickTagGroups().flatMap((group) => group.items);
  const custom = customTags.map((tag) => ({
    key: tag.key,
    label: tag.label,
    icon: tag.icon || DEFAULT_EMOJI,
    custom: true,
  }));

  return [...builtins, ...custom];
};
