import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import MigrationRunner from '../components/Admin/MigrationRunner';
import TestDataRunner from '../components/Admin/TestDataRunner';

const AdminPage = () => {
  return (
    <ResponsiveLayout pageTitle="Admin Tools" showBottomNav={false}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Tools
        </Typography>
        
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
            Test Data Generation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate realistic test data including users, children, and activity content with media.
          </Typography>
          
          <TestDataRunner />
        </Paper>
        
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