import { getAuth } from "firebase/auth";

const ENDPOINT =
  "https://us-central1-captureease-ef82f.cloudfunctions.net/updateChildSmsSettingsHttp";

/**
 * Call the HTTP function with explicit CORS + auth token.
 * This sidesteps browser preflight/CORS blocks seen with the callable path.
 */
export const updateChildSmsSettings = async (childId, smsEnabled, reminderSettings = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to update SMS settings");
  }

  const token = await user.getIdToken();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ childId, smsEnabled, ...reminderSettings }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      (response.status === 401
        ? "Please log in again"
        : "Failed to update SMS settings");
    const err = new Error(message);
    err.code = data.error;
    throw err;
  }

  return data;
};
