import React from 'react';
import { Container, Typography, Box, Paper, Divider, Alert } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import MigrationRunner from '../components/Admin/MigrationRunner';
import TestDataRunner from '../components/Admin/TestDataRunner';
import UserChecker from '../components/Debug/UserChecker';
import DataCleaner from '../components/Debug/DataCleaner';
import ContactSubmissionsInbox from '../components/Admin/ContactSubmissionsInbox';
import { auth } from '../services/firebase';
import { isContactInboxAdminEmail } from '../constants/admin';

const AdminPage = () => {
  const [user, loading] = useAuthState(auth);
  const isAdmin = isContactInboxAdminEmail(user?.email);

  if (loading) {
    return (
      <ResponsiveLayout pageTitle="Admin Tools" showBottomNav={false}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Tools
          </Typography>
          <Alert severity="info">Checking admin access...</Alert>
        </Container>
      </ResponsiveLayout>
    );
  }

  if (!isAdmin) {
    return (
      <ResponsiveLayout pageTitle="Admin Tools" showBottomNav={false}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Tools
          </Typography>
          <Alert severity="error">
            You do not have access to the admin inbox.
          </Alert>
        </Container>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout pageTitle="Admin Tools" showBottomNav={false}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Tools
        </Typography>

        <ContactSubmissionsInbox />
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Database Migrations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Run database migrations to optimize performance and add new features.
          </Typography>
          
          <MigrationRunner />
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            User / Child Lookup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check whether a user exists, which Firebase Auth account they have, and which children they can access.
          </Typography>

          <UserChecker />
        </Paper>

        <Divider sx={{ my: 4 }} />
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Data Generation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate realistic test data including users, children, and activity content with media.
          </Typography>
          
          <TestDataRunner />
        </Paper>

        <Divider sx={{ my: 4 }} />

        <DataCleaner />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Note: These tools are for development and administration purposes only.
          </Typography>
        </Box>
      </Container>
    </ResponsiveLayout>
  );
};

export default AdminPage;
