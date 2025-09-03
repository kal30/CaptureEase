import React from 'react';
import {
  Box,
  Container
} from '@mui/material';

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
      <Container maxWidth={fullWidth ? false : "xl"}>
        {children}
      </Container>
    </Box>
  );
};

export default DesktopLayout;