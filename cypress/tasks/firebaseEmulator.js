const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_EMULATOR_PROJECT_ID || 'lifelog-tracker';

const TEST_USERS = [
  {
    uid: 'cypress-owner',
    email: 'test@captureez.com',
    password: 'TestPassword123!',
    displayName: 'Test Care Owner',
  },
  {
    uid: 'cypress-partner',
    email: 'partner@captureez.com',
    password: 'PartnerPassword123!',
    displayName: 'Test Care Partner',
  },
];

const TEST_CHILD = {
  id: 'cypress-child-1',
  name: 'Mia Johnson',
  age: 8,
  birthDate: '2017-03-15',
  description: 'Demo child for Cypress browser tests',
  status: 'active',
};

const getAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    projectId: PROJECT_ID,
  });
};

const getAuth = () => admin.auth(getAdminApp());
const getDb = () => admin.firestore(getAdminApp());

const deleteDocumentRecursively = async (docRef) => {
  const subcollections = await docRef.listCollections();

  for (const subcollection of subcollections) {
    const snapshots = await subcollection.get();
    for (const snapshot of snapshots.docs) {
      await deleteDocumentRecursively(snapshot.ref);
    }
  }

  await docRef.delete().catch(() => null);
};

const clearFirestore = async () => {
  const db = getDb();
  const collections = await db.listCollections();

  for (const collectionRef of collections) {
    const snapshots = await collectionRef.get();
    for (const snapshot of snapshots.docs) {
      await deleteDocumentRecursively(snapshot.ref);
    }
  }
};

const clearAuth = async () => {
  const auth = getAuth();
  let pageToken = undefined;

  do {
    const result = await auth.listUsers(1000, pageToken);
    const uids = result.users.map((user) => user.uid);
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
    }
    pageToken = result.pageToken;
  } while (pageToken);
};

const upsertAuthUser = async ({ uid, email, password, displayName }) => {
  const auth = getAuth();

  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      // Ignore missing users; any other error should still be surfaced below.
    }
  }

  await auth.createUser({
    uid,
    email,
    password,
    displayName,
    emailVerified: true,
    disabled: false,
  });
};

const seedDatabase = async () => {
  const db = getDb();
  const now = admin.firestore.Timestamp.now();

  for (const user of TEST_USERS) {
    await upsertAuthUser(user);
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName,
      photoURL: null,
      isOnline: true,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
      testData: true,
    });
  }

  await db.collection('children').doc(TEST_CHILD.id).set({
    name: TEST_CHILD.name,
    age: TEST_CHILD.age,
    birthDate: TEST_CHILD.birthDate,
    description: TEST_CHILD.description,
    status: TEST_CHILD.status,
    users: {
      care_owner: TEST_USERS[0].uid,
      care_partners: [TEST_USERS[1].uid],
      caregivers: [],
      therapists: [],
      members: TEST_USERS.map((user) => user.uid),
    },
    medicalProfile: {
      foodAllergies: [],
      currentMedications: [],
    },
    settings: {
      allow_therapist_family_logs: false,
    },
    createdBy: TEST_USERS[0].uid,
    createdAt: now,
    updatedBy: TEST_USERS[0].uid,
    updatedAt: now,
    testData: true,
  });

  await db.collection('child_access').doc(`${TEST_CHILD.id}_${TEST_USERS[0].uid}`).set({
    childId: TEST_CHILD.id,
    userId: TEST_USERS[0].uid,
    role: 'care_owner',
    permissions: ['manage_child', 'invite_caregivers', 'invite_therapists', 'add_daily_logs'],
    testData: true,
  });

  await db.collection('child_access').doc(`${TEST_CHILD.id}_${TEST_USERS[1].uid}`).set({
    childId: TEST_CHILD.id,
    userId: TEST_USERS[1].uid,
    role: 'care_partner',
    permissions: ['add_daily_logs'],
    testData: true,
  });

  return null;
};

module.exports = {
  clearDatabase: async () => {
    await clearFirestore();
    await clearAuth();
    return null;
  },
  seedDatabase,
};
