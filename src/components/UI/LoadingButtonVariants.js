import React from 'react';
import { Box, Fade, Grow } from '@mui/material';
import EnhancedLoadingButton from './EnhancedLoadingButton';

/**
 * Pre-configured loading button variants for common use cases
 * Uses your app's theme colors and provides contextual loading animations
 */

// Save button with document icon animation
export const SaveLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="pulse"
    loadingText="Saving..."
    variant="gradient"
    color="primary"
    loadingIcon={loading ? "📄" : null} // You can replace with actual icon
    startIcon={!loading ? "💾" : undefined}
    {...props}
  />
);

// Submit button with checkmark animation
export const SubmitLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="waves"
    loadingText="Submitting..."
    variant="success-gradient"
    loadingIcon={loading ? "⚡" : null}
    startIcon={!loading ? "✓" : undefined}
    {...props}
  />
);

// Delete button with warning animation
export const DeleteLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="heartbeat"
    loadingText="Deleting..."
    variant="contained"
    color="error"
    loadingIcon={loading ? "⚠️" : null}
    startIcon={!loading ? "🗑️" : undefined}
    {...props}
  />
);

// Upload button with progress animation
export const UploadLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="dots"
    loadingText="Uploading..."
    variant="outlined"
    color="secondary"
    loadingIcon={loading ? "📤" : null}
    startIcon={!loading ? "📁" : undefined}
    {...props}
  />
);

// Send button with message animation
export const SendLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="waves"
    loadingText="Sending..."
    variant="gradient"
    color="primary"
    loadingIcon={loading ? "📨" : null}
    startIcon={!loading ? "📬" : undefined}
    {...props}
  />
);

// Login button with authentication animation
export const LoginLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="spinner"
    loadingText="Signing in..."
    variant="gradient"
    color="primary"
    loadingIcon={loading ? "🔐" : null}
    startIcon={!loading ? "👤" : undefined}
    {...props}
  />
);

// Download button with arrow animation
export const DownloadLoadingButton = ({ loading, ...props }) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle="pulse"
    loadingText="Downloading..."
    variant="contained"
    color="info"
    loadingIcon={loading ? "⬇️" : null}
    startIcon={!loading ? "💾" : undefined}
    {...props}
  />
);

// Generic action button with customizable animation
export const ActionLoadingButton = ({
  loading,
  action = "Processing",
  icon = "⚙️",
  loadingIcon = "⏳",
  loadingStyle = "spinner",
  ...props
}) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingStyle={loadingStyle}
    loadingText={`${action}...`}
    loadingIcon={loading ? loadingIcon : null}
    startIcon={!loading ? icon : undefined}
    {...props}
  />
);

// Custom image-based loading button
export const ImageLoadingButton = ({
  loading,
  loadingImage, // URL to loading gif/image
  staticImage, // URL to static image
  ...props
}) => (
  <EnhancedLoadingButton
    loading={loading}
    loadingIcon={loading ? loadingImage : null}
    startIcon={
      !loading && staticImage ? (
        <Box
          component="img"
          src={staticImage}
          sx={{
            width: 20,
            height: 20,
            objectFit: 'contain',
          }}
        />
      ) : undefined
    }
    {...props}
  />
);

// Floating action button with expanding animation
export const FloatingLoadingButton = ({ loading, ...props }) => (
  <Grow in={true} timeout={500}>
    <Box>
      <EnhancedLoadingButton
        loading={loading}
        loadingStyle="pulse"
        variant="gradient"
        elevated
        sx={{
          borderRadius: '50%',
          minWidth: 56,
          height: 56,
          '&:hover': {
            transform: loading ? 'none' : 'scale(1.1)',
          },
          ...props.sx,
        }}
        {...props}
      />
    </Box>
  </Grow>
);

export default {
  Save: SaveLoadingButton,
  Submit: SubmitLoadingButton,
  Delete: DeleteLoadingButton,
  Upload: UploadLoadingButton,
  Send: SendLoadingButton,
  Login: LoginLoadingButton,
  Download: DownloadLoadingButton,
  Action: ActionLoadingButton,
  Image: ImageLoadingButton,
  Floating: FloatingLoadingButton,
};