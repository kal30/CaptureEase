import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UserChecker from '../components/Debug/UserChecker';
import DataCleaner from '../components/Debug/DataCleaner';
import RoleUpdater from '../components/Debug/RoleUpdater';

const DebugPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          textAlign: 'center',
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          borderRadius: 3
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          🔧 Debug & Testing Tools
        </Typography>
        <Typography variant="h6">
          Development utilities for testing the application
        </Typography>
      </Paper>

      {/* Debug Tools Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Section 1: User Management */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            👤 User Management
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <UserChecker />
            <RoleUpdater />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section 2: Data Management */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
            🗑️ Data Management
          </Typography>
          <DataCleaner />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section 3: Instructions */}
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.50' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📋 Testing Instructions
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Clean Start Test Flow:</strong>
            <ol>
              <li>Use <strong>Data Cleaner</strong> to wipe all data</li>
              <li>Manually delete users from Firebase Console → Authentication</li>
              <li>Sign up fresh with parent account</li>
              <li>Add 2-3 children using Add Child button</li>
              <li>Test invitation system with "All Children" selection</li>
              <li>Verify only ONE email is sent (not separate emails)</li>
              <li>Accept invitation and check multi-child access</li>
            </ol>
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            <strong>Note:</strong> This page is only for development testing. 
            Remove it before production deployment.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DebugPage;