import React, { useState } from 'react';
import { Button, Box, Typography, Paper, Alert } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const RoleUpdater = () => {
  const [status, setStatus] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkCurrentRole = async () => {
    setLoading(true);
    setStatus('Checking current role...');
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setStatus('No user logged in');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setStatus(`Found user: ${data.email}`);
        console.log('Current user data:', data);
      } else {
        setStatus('User document not found');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateToArrayRole = async () => {
    if (!userData) {
      setStatus('Please check current role first');
      return;
    }

    setLoading(true);
    setStatus('Updating role to array format...');
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setStatus('No user logged in');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      
      let newRoles;
      if (userData.role && !userData.roles) {
        // Convert single role to array
        newRoles = [userData.role];
      } else if (!userData.roles && !userData.role) {
        // No role set, default to parent
        newRoles = ['parent'];
      } else {
        // Already has roles array
        setStatus('User already has roles array');
        return;
      }

      const updateData = {
        roles: newRoles,
        role: newRoles[0], // Keep for backward compatibility
        updatedAt: new Date()
      };

      await updateDoc(userDocRef, updateData);
      
      setStatus(`✅ Successfully updated! New roles: ${newRoles.join(', ')}`);
      
      // Refresh user data
      await checkCurrentRole();
      
    } catch (error) {
      setStatus(`Error updating role: ${error.message}`);
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Role Updater Debug Tool
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={checkCurrentRole}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Check Current Role
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={updateToArrayRole}
          disabled={loading || !userData}
        >
          Update to Array Format
        </Button>
      </Box>

      {status && (
        <Alert severity={status.includes('✅') ? 'success' : status.includes('Error') ? 'error' : 'info'}>
          {status}
        </Alert>
      )}

      {userData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Current User Data:</Typography>
          <pre style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
            {JSON.stringify({
              email: userData.email,
              displayName: userData.displayName,
              role: userData.role,
              roles: userData.roles,
              createdAt: userData.createdAt?.toDate?.()?.toString() || userData.createdAt
            }, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default RoleUpdater;