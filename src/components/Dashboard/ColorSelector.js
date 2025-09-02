import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { COLOR_OPTIONS } from '../../constants/categoryConstants';

const ColorSelector = ({ selectedColor, onColorSelect }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Color
      </Typography>
      <FormControl fullWidth>
        <Select
          value={selectedColor}
          onChange={(e) => onColorSelect(e.target.value)}
          renderValue={(value) => {
            const option = COLOR_OPTIONS.find(opt => opt.value === value);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: value
                  }}
                />
                {option?.label}
              </Box>
            );
          }}
        >
          {COLOR_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: option.preview
                  }}
                />
                {option.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ColorSelector;