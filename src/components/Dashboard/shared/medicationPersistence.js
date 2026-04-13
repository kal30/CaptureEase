import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { normalizeMedicationDetail } from "./childMedicationHelpers";

export const saveMedicationRecord = async ({
  childId,
  medication,
  status = "draft",
}) => {
  if (!childId) {
    throw new Error("Child profile is not ready yet.");
  }

  const normalized = normalizeMedicationDetail(medication);
  const savedAt = new Date().toISOString();
  const record = {
    ...normalized,
    syncStatus: status,
    savedAt,
    updatedAt: savedAt,
  };

  await setDoc(doc(db, "children", childId, "medications", normalized.id), record, { merge: true });

  return record;
};
