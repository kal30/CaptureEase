const { getStorage } = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");

/**
 * Get MIME type category
 * @param {string} mimeType - MIME type string
 * @returns {string} Category: image, video, audio, or file
 */
const getMimeKind = (mimeType) => {
  if (!mimeType) return "file";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
};

/**
 * Upload media to Firebase Storage
 * @param {string} mediaUrl - URL of media to download
 * @param {string} childId - Child ID for storage path
 * @param {string} messageSid - Message ID for storage path
 * @param {string} filename - Filename for storage
 * @param {string} mimeType - MIME type of the media
 * @returns {Promise<Object>} Storage metadata
 */
const uploadMediaToStorage = async (
  mediaUrl,
  childId,
  messageSid,
  filename,
  mimeType
) => {
  try {
    const bucket = getStorage().bucket();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const storagePath = `media/${childId}/${year}/${month}/${messageSid}/${filename}`;

    // Download media from Twilio
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          source: "twilio-ingest",
          messageSid: messageSid,
          originalUrl: mediaUrl,
        },
      },
    });

    return {
      path: storagePath,
      kind: getMimeKind(mimeType),
      mime: mimeType,
      bytes: buffer.length,
    };
  } catch (error) {
    logger.error("Failed to upload media to storage:", error);
    throw error;
  }
};

module.exports = {
  getMimeKind,
  uploadMediaToStorage
};