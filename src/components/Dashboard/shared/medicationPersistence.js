import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";
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
  const createdBy = auth?.currentUser?.uid;

  if (!createdBy) {
    throw new Error("You must be signed in to save medication details.");
  }

  const record = {
    ...normalized,
    childId,
    createdBy,
    createdAt: savedAt,
    isArchived: Boolean(medication?.isArchived),
    archivedAt: medication?.archivedAt || "",
    archivedBy: medication?.archivedBy || "",
    syncStatus: status,
    savedAt,
    updatedAt: savedAt,
  };

  await setDoc(doc(db, "medications", normalized.id), record, { merge: true });

  return record;
};

export const archiveMedicationRecord = async ({
  childId,
  medication,
  archived = true,
}) => {
  if (!childId) {
    throw new Error("Child profile is not ready yet.");
  }

  const normalized = normalizeMedicationDetail(medication);
  const savedAt = new Date().toISOString();
  const archivedBy = auth?.currentUser?.uid;

  if (!archivedBy) {
    throw new Error("You must be signed in to update medication details.");
  }

  const record = {
    ...normalized,
    childId,
    createdBy: normalized.createdBy || archivedBy,
    createdAt: normalized.createdAt || savedAt,
    isArchived: archived,
    archivedAt: archived ? savedAt : "",
    archivedBy: archived ? archivedBy : "",
    syncStatus: archived ? "archived" : "saved",
    savedAt: normalized.savedAt || savedAt,
    updatedAt: savedAt,
  };

  await setDoc(doc(db, "medications", normalized.id), record, { merge: true });

  return record;
};
