import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { migrateUsersMembers } from '../../services/migrations/usersMembersMigration';

const MigrationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    
    try {
      const migrationResult = await migrateUsersMembers();
      setResult(migrationResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Database Migration Runner
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This will migrate all children documents to include the users.members field for optimized queries.
        This is a one-time migration that is safe to run multiple times.
      </Typography>
      
      <Button
        variant="contained"
        onClick={runMigration}
        disabled={isRunning}
        startIcon={isRunning ? <CircularProgress size={20} /> : null}
        sx={{ mb: 2 }}
      >
        {isRunning ? 'Running Migration...' : 'Run Users.Members Migration'}
      </Button>
      
      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Migration completed successfully!<br />
          Processed: {result.processed} children<br />
          Updated: {result.updated} children
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Migration failed: {error}
        </Alert>
      )}
    </Box>
  );
};

export default MigrationRunner;