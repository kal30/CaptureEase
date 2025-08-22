import React from 'react';
import {
  Box,
  Container
} from '@mui/material';

const DesktopLayout = ({ children, pageTitle, fullWidth = false }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth={fullWidth ? false : "xl"}>
        {children}
      </Container>
    </Box>
  );
};

export default DesktopLayout;