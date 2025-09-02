import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { EnhancedLoadingButton } from './';
import LoadingButtonVariants from './LoadingButtonVariants';

/**
 * Examples of how to use the enhanced loading buttons
 * Copy these patterns to use in your actual components
 */
const LoadingButtonExamples = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

  const simulateOperation = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 3000);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Loading Buttons
      </Typography>

      <Stack spacing={4}>
        {/* Basic Enhanced Loading Button */}
        <Box>
          <Typography variant="h6" gutterBottom>
            1. Basic Enhanced Loading Button
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <EnhancedLoadingButton
              loading={loading1}
              loadingStyle="spinner"
              loadingText="Saving..."
              variant="gradient"
              onClick={() => simulateOperation(setLoading1)}
            >
              Save Changes
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={loading2}
              loadingStyle="dots"
              loadingText="Processing..."
              variant="outlined"
              color="secondary"
              onClick={() => simulateOperation(setLoading2)}
            >
              Process Data
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={loading3}
              loadingStyle="waves"
              loadingText="Uploading..."
              variant="success-gradient"
              onClick={() => simulateOperation(setLoading3)}
            >
              Upload File
            </EnhancedLoadingButton>
          </Stack>
        </Box>

        {/* Pre-configured Variants */}
        <Box>
          <Typography variant="h6" gutterBottom>
            2. Pre-configured Variants
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <LoadingButtonVariants.Save loading={false}>
              Save Document
            </LoadingButtonVariants.Save>

            <LoadingButtonVariants.Submit loading={false}>
              Submit Form
            </LoadingButtonVariants.Submit>

            <LoadingButtonVariants.Upload loading={false}>
              Upload Files
            </LoadingButtonVariants.Upload>

            <LoadingButtonVariants.Login loading={false}>
              Sign In
            </LoadingButtonVariants.Login>
          </Stack>
        </Box>

        {/* Different Animation Styles */}
        <Box>
          <Typography variant="h6" gutterBottom>
            3. Different Animation Styles
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <EnhancedLoadingButton
              loading={true}
              loadingStyle="spinner"
              loadingText="Spinning..."
              variant="contained"
            >
              Spinner
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={true}
              loadingStyle="dots"
              loadingText="Loading..."
              variant="outlined"
            >
              Dots
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={true}
              loadingStyle="pulse"
              loadingText="Pulsing..."
              variant="gradient"
            >
              Pulse
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={true}
              loadingStyle="waves"
              loadingText="Processing..."
              variant="success-gradient"
            >
              Waves
            </EnhancedLoadingButton>

            <EnhancedLoadingButton
              loading={true}
              loadingStyle="heartbeat"
              loadingText="Working..."
              variant="dailyCare"
            >
              Heartbeat
            </EnhancedLoadingButton>
          </Stack>
        </Box>

        {/* Usage Examples */}
        <Box>
          <Typography variant="h6" gutterBottom>
            4. How to Use in Your Components
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`// Import the components
import { EnhancedLoadingButton } from '../components/UI';
import LoadingButtonVariants from '../components/UI/LoadingButtonVariants';

// Use in your component
const MyComponent = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <EnhancedLoadingButton
      loading={saving}
      loadingStyle="waves"
      loadingText="Saving..."
      variant="gradient"
      onClick={handleSave}
    >
      Save Changes
    </EnhancedLoadingButton>
  );
};

// Or use pre-configured variants
<LoadingButtonVariants.Save loading={saving} onClick={handleSave}>
  Save Document
</LoadingButtonVariants.Save>`}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default LoadingButtonExamples;