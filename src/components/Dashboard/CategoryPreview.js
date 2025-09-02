import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const CategoryPreview = ({ emoji, name, color }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Category Preview
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '2rem' }}>{emoji}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: color }}>
          {name || 'Category Name'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CategoryPreview;