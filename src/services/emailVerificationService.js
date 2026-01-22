import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "us-central1");
const sendVerificationEmailCallable = httpsCallable(
  functions,
  "sendVerificationEmail"
);

export const sendVerificationEmail = async ({ continueUrl } = {}) => {
  const payload = {};
  if (continueUrl) {
    payload.continueUrl = continueUrl;
  }
  const result = await sendVerificationEmailCallable(payload);
  return result.data;
};
