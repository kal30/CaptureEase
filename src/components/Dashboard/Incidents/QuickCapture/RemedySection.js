import React from 'react';
import { 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField 
} from '@mui/material';

const RemedySection = ({ 
  remedy, 
  onRemedyChange,
  customRemedy,
  onCustomRemedyChange,
  incidentConfig 
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: '#1f2937'
        }}
      >
        🩹 Remedy Applied
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select remedy</InputLabel>
        <Select
          value={remedy}
          label="Select remedy"
          onChange={onRemedyChange}
        >
          {incidentConfig?.remedies?.map((remedyOption) => (
            <MenuItem key={remedyOption} value={remedyOption}>
              {remedyOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {remedy === 'Other' && (
        <TextField
          fullWidth
          label="Custom remedy"
          placeholder="Describe what you did..."
          value={customRemedy}
          onChange={onCustomRemedyChange}
          multiline
          rows={2}
        />
      )}
    </Paper>
  );
};

export default RemedySection;