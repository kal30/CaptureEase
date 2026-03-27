import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const FOUNDING_FAMILIES_COLLECTION = "foundingFamilies";

export const saveFoundingFamilyEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  await setDoc(
    doc(db, FOUNDING_FAMILIES_COLLECTION, normalizedEmail),
    {
      email: normalizedEmail,
      source: "landing_page",
      updatedAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
