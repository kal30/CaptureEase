import React from 'react';
import {
  Box,
  Container
} from '@mui/material';
import PWAUpdateBanner from '../UI/PWAUpdateBanner';

const DesktopLayout = ({ children, pageTitle, fullWidth = false, sx = {} }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
        ...sx
      }}
    >
      <PWAUpdateBanner />
      <Container maxWidth={fullWidth ? false : "xl"}>
        {children}
      </Container>
    </Box>
  );
};

export default DesktopLayout;
