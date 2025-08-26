const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD5FrTMDOREdk288_Y9ledjU73kBPpG1fk",
  authDomain: "captureease-ef82f.firebaseapp.com",
  projectId: "captureease-ef82f",
  storageBucket: "captureease-ef82f.appspot.com",
  messagingSenderId: "527928340509",
  appId: "1:527928340509:web:5b23265f2399f1ab7056f4",
  measurementId: "G-LG6RDFXCDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userEmail = 'rentalkaushik@gmail.com';

async function checkAndUpdateUserRole() {
  try {
    // First, we need to find the user by email since we don't have the UID
    const { collection, query, where, getDocs } = require('firebase/firestore');
    
    console.log(`Looking for user with email: ${userEmail}`);
    
    // Query users collection by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No user found with that email');
      return;
    }
    
    // Get the first (should be only) matching user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    console.log('\n--- Current User Data ---');
    console.log('User ID:', userId);
    console.log('Email:', userData.email);
    console.log('Display Name:', userData.displayName);
    console.log('Current Role:', userData.role);
    console.log('Current Roles Array:', userData.roles);
    console.log('Created At:', userData.createdAt?.toDate());
    
    // Update role to array format if needed
    if (userData.role && !userData.roles) {
      console.log('\n--- Updating Role Format ---');
      console.log('Converting single role to array format...');
      
      const updateData = {
        roles: [userData.role], // Convert single role to array
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, 'users', userId), updateData);
      console.log('✅ Successfully updated role format');
      console.log('New roles array:', updateData.roles);
    } else if (userData.roles) {
      console.log('\n--- Current Status ---');
      console.log('✅ User already has roles array:', userData.roles);
    } else {
      console.log('\n--- Setting Default Role ---');
      console.log('No role found, setting default parent role...');
      
      const updateData = {
        roles: ['parent'],
        role: 'parent', // Keep for backward compatibility
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, 'users', userId), updateData);
      console.log('✅ Successfully set default parent role');
    }
    
    // Fetch updated data to confirm
    const updatedDoc = await getDoc(doc(db, 'users', userId));
    const updatedData = updatedDoc.data();
    
    console.log('\n--- Final User Data ---');
    console.log('Roles:', updatedData.roles);
    console.log('Legacy Role:', updatedData.role);
    
  } catch (error) {
    console.error('Error checking/updating user role:', error);
  }
}

// Run the script
checkAndUpdateUserRole();