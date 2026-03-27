import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "us-central1");
const sendContactEmailCallable = httpsCallable(functions, "sendContactEmail");

export const sendContactEmail = async ({ senderName, senderEmail, subject, message }) => {
  const response = await sendContactEmailCallable({
    senderName,
    senderEmail,
    subject,
    message,
  });

  return response.data;
};
