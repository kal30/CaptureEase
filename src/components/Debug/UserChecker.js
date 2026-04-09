import React, { useState } from 'react';
import { Button, Box, Typography, Paper, Alert, TextField, Divider } from '@mui/material';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { getChildrenWithRoles } from '../../services/roles/roleService';

const UserChecker = () => {
  const [email, setEmail] = useState('rkalyani@gmail.com');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    setResult('Checking...');
    
    try {
      // Check if user exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      const existsInAuth = signInMethods && signInMethods.length > 0;

      // Check if user exists in Firestore users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      const existsInFirestore = !querySnapshot.empty;
      const firestoreUserDoc = existsInFirestore ? querySnapshot.docs[0] : null;
      const firestoreUserId = firestoreUserDoc?.id || firestoreUserDoc?.data()?.uid || null;

      let firestoreData = null;
      if (existsInFirestore) {
        firestoreData = querySnapshot.docs[0].data();
      }

      let accessibleChildren = [];
      if (firestoreUserId) {
        const allChildren = await getChildrenWithRoles();
        accessibleChildren = allChildren
          .filter((child) => {
            const users = child?.users || {};
            return users.care_owner === firestoreUserId ||
              users.care_partners?.includes(firestoreUserId) ||
              users.caregivers?.includes(firestoreUserId) ||
              users.therapists?.includes(firestoreUserId) ||
              users.members?.includes(firestoreUserId);
          })
          .map((child) => ({
            id: child.id,
            name: child.name,
            role: child.userRole,
          }));
      }

      setResult(JSON.stringify({
        email,
        existsInAuth,
        existsInFirestore,
        signInMethods: signInMethods || [],
        firestoreUserId,
        firestoreData,
        accessibleChildren,
        timestamp: new Date().toISOString()
      }, null, 2));

    } catch (error) {
      setResult(`Error: ${error.message}`);
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        User Existence Checker
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Email to check"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          onClick={checkUser}
          disabled={loading}
        >
          Check User
        </Button>
      </Box>

      {result && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <pre style={{ fontSize: '12px', backgroundColor: 'transparent', padding: 0, margin: 0, whiteSpace: 'pre-wrap' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Paper>
  );
};

export default UserChecker;
