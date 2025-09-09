import React from 'react';
import { Button } from '@mui/material';

const RemoveMediaButton = ({ handleRemoveMedia }) => (
  <Button
    variant="outlined"
    color="secondary"
    sx={{ mt: 2, display: 'block', margin: '0 auto' }} // Center the button
    onClick={handleRemoveMedia}
  >
    Remove Media
  </Button>
);

export default RemoveMediaButton;