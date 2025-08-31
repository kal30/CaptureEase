import React, { useState } from 'react';
import { Button, Box, Typography, Paper, Alert } from '@mui/material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const DataCleaner = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const deleteCollection = async (collectionName) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(document => 
      deleteDoc(doc(db, collectionName, document.id))
    );
    await Promise.all(deletePromises);
    return querySnapshot.docs.length;
  };

  const cleanupData = async () => {
    setLoading(true);
    setStatus('Starting cleanup...');
    
    try {
      // Delete all children
      setStatus('Deleting children...');
      const childrenCount = await deleteCollection('children');
      
      // Delete all users  
      setStatus('Deleting users...');
      const usersCount = await deleteCollection('users');
      
      setStatus(`✅ Cleanup complete! 
      - Deleted ${childrenCount} children
      - Deleted ${usersCount} users
      
      Note: You'll need to manually delete users from Firebase Auth > Users tab as well.`);
      
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Cleanup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2, maxWidth: 600, bgcolor: 'error.50', border: '2px solid', borderColor: 'error.main' }}>
      <Typography variant="h6" gutterBottom color="error">
        ⚠️ Data Cleanup Tool
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }} color="error">
        This will DELETE ALL children and users from Firestore. This action cannot be undone!
      </Typography>
      
      <Button 
        variant="contained" 
        color="error"
        onClick={cleanupData}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Deleting...' : 'DELETE ALL DATA'}
      </Button>

      {status && (
        <Alert severity={status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {status}
          </pre>
        </Alert>
      )}
    </Paper>
  );
};

export default DataCleaner;