
import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddBehaviorForm from '../../components/Behaviors/AddBehaviorForm';
import BehaviorList from '../../components/Behaviors/BehaviorList';

const BehaviorTab = ({ childId, onSaveSuccess }) => {
  const [showAddForm, setShowAddForm] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
    if (onSaveSuccess) {
      onSaveSuccess();
    }
    setShowAddForm(false); // Switch to the list view after saving
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add New Behavior
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(false)}
          disabled={!showAddForm}
        >
          View Recorded Behaviors
        </Button>
      </Box>

      {showAddForm ? (
        <AddBehaviorForm
          childId={childId}
          onSaveSuccess={handleSave}
          selectedTemplate={selectedTemplate}
        />
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Defined Behaviors</Typography>
          <BehaviorList childId={childId} refreshTrigger={refreshTrigger} />
        </Box>
      )}
    </Box>
  );
};

export default BehaviorTab;
