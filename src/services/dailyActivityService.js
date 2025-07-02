// src/services/activityService.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// —————————————————————
// 1) Fetch the list of all activities
// —————————————————————
export const fetchActivities = async (childId) => {
  if (!childId) throw new Error("childId is required to fetch activities");

  const q = query(
    collection(db, "children", childId, "activities"),
    orderBy("name", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// —————————————————————
// 2) Add a new activity to the master list
// —————————————————————
export const addActivity = async (childId, name) => {
  if (!childId || !name) throw new Error("childId & name are required");
  await addDoc(collection(db, "children", childId, "activities"), {
    name,
    createdAt: new Date(),
  });
};

// —————————————————————
// 3) Delete an activity (and optionally its logs)
// —————————————————————
export const deleteActivity = async (childId, activityId) => {
  const actRef = doc(db, "children", childId, "activities", activityId);
  await deleteDoc(actRef);
  // *Optionally*, also remove any logs for that activity:
  const logsQ = query(
    collection(db, `children/${childId}/activity_logs`),
    where("activityId", "==", activityId)
  );
  const logsSnap = await getDocs(logsQ);
  await Promise.all(
    logsSnap.docs.map((logDoc) =>
      deleteDoc(doc(db, `children/${childId}/activity_logs`, logDoc.id))
    )
  );
};

// —————————————————————
// 4) Fetch all activity logs (optionally filtered by date)
// —————————————————————
export const fetchActivityLogs = async (childId, date /*="YYYY-MM-DD"*/) => {
  if (!childId) throw new Error("childId is required to fetch logs");

  let logsCol = collection(db, "children", childId, "activity_logs");
  let logsQ = date
    ? query(logsCol, where("date", "==", date), orderBy("date", "desc"))
    : query(logsCol, orderBy("date", "desc"));

  const snap = await getDocs(logsQ);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// —————————————————————
// 5) Toggle (add/update) a log entry for one activity on one date
// —————————————————————
export const toggleActivityLog = async (childId, activityId, date) => {
  if (!childId || !activityId || !date)
    throw new Error("childId, activityId & date are required");

  const logsCol = collection(db, "children", childId, "activity_logs");
  // find existing log for this activity+date
  const q = query(
    logsCol,
    where("activityId", "==", activityId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    // no entry yet → create one as completed
    await addDoc(logsCol, {
      activityId,
      date,
      completed: true,
      timestamp: new Date(),
    });
  } else {
    // flip completed flag on the first matching doc
    const docRef = doc(
      db,
      `children/${childId}/activity_logs`,
      snap.docs[0].id
    );
    const current = snap.docs[0].data().completed;
    await updateDoc(docRef, { completed: !current, timestamp: new Date() });
  }
};

// —————————————————————
// 6) Delete a specific log entry (if you need that functionality)
// —————————————————————
export const deleteActivityLog = async (childId, logId) => {
  if (!childId || !logId) throw new Error("childId & logId are required");
  const logRef = doc(db, "children", childId, "activity_logs", logId);
  await deleteDoc(logRef);
};
