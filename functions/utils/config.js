const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Cache for app config
let appConfigCache = null;
let appConfigCacheTime = 0;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get application configuration with caching
 * @returns {Promise<Object>} App configuration object
 */
const getAppConfig = async () => {
  const now = Date.now();
  if (appConfigCache && now - appConfigCacheTime < CONFIG_CACHE_TTL) {
    return appConfigCache;
  }

  try {
    const db = admin.firestore();
    const configDoc = await db.collection("app_config").doc("ingest").get();

    appConfigCache = configDoc.exists ? configDoc.data() : {};

    // Apply defaults
    appConfigCache = {
      smsEnabled: true,
      whatsappEnabled: true,
      maxMedia: 3,
      allowedMime: ["image/jpeg", "image/png", "video/mp4", "audio/mpeg"],
      verifySignatures: true,
      ...appConfigCache,
    };

    appConfigCacheTime = now;
    return appConfigCache;
  } catch (error) {
    logger.error("Failed to load app config, using defaults:", error);
    return {
      smsEnabled: true,
      whatsappEnabled: true,
      maxMedia: 3,
      allowedMime: ["image/jpeg", "image/png", "video/mp4", "audio/mpeg"],
      verifySignatures: true,
    };
  }
};

module.exports = {
  getAppConfig
};