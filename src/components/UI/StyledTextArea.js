import { TextField, Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * StyledTextArea - Handles all textarea patterns consistently  
 * Eliminates the need for sx props on TextFields throughout the app
 * All styles, variants, and behaviors defined in one place
 * 
 * Usage:
 * <StyledTextArea variant="notes" label="Additional Notes" value={notes} onChange={setNotes} />
 * <StyledTextArea variant="comments" label="Care Comments" value={comments} onChange={setComments} />
 * <StyledTextArea variant="feedback" label="Weekly Feedback" value={feedback} onChange={setFeedback} />
 */
const StyledTextArea = ({ 
  variant = 'notes',
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  error = false,
  helperText,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  const getVariantStyles = () => {
    const variants = {
      // Standard notes input
      'notes': {
        paper: {
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        },
        label: {
          variant: 'subtitle1',
          gutterBottom: true,
          sx: { 
            fontWeight: 600,
            color: '#1f2937'
          }
        },
        field: {
          placeholder: placeholder || "Any additional details...",
          sx: {}
        }
      },
      
      // Comments/feedback input
      'comments': {
        paper: {
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        },
        label: {
          variant: 'subtitle1',
          gutterBottom: true,
          sx: { 
            fontWeight: 600,
            color: '#1f2937'
          }
        },
        field: {
          placeholder: placeholder || "Share your thoughts...",
          sx: {}
        }
      },
      
      // Compact variant for inline use
      'compact': {
        paper: null, // No paper wrapper
        label: {
          variant: 'body2',
          sx: { 
            fontWeight: 500,
            mb: 1
          }
        },
        field: {
          placeholder: placeholder || "Add notes...",
          sx: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }
        }
      },
      
      // Feedback/report variant
      'feedback': {
        paper: {
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#f8f9fa'
        },
        label: {
          variant: 'subtitle1',
          gutterBottom: true,
          sx: { 
            fontWeight: 600,
            color: theme.palette.primary.main
          }
        },
        field: {
          placeholder: placeholder || "Provide your feedback...",
          sx: {}
        }
      }
    };
    
    return variants[variant] || variants.notes;
  };

  const variantConfig = getVariantStyles();
  
  // Text field component
  const textField = (
    <TextField
      fullWidth
      multiline
      rows={rows}
      variant="outlined"
      value={value}
      onChange={onChange}
      placeholder={variantConfig.field.placeholder}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      sx={{
        ...variantConfig.field.sx,
        ...sx
      }}
      {...props}
    />
  );
  
  // For compact variant, return just the field
  if (variant === 'compact') {
    return (
      <Box>
        {label && (
          <Typography {...variantConfig.label}>
            {label}
          </Typography>
        )}
        {textField}
      </Box>
    );
  }
  
  // For other variants, wrap in Paper
  return (
    <Paper elevation={0} sx={variantConfig.paper}>
      {label && (
        <Typography {...variantConfig.label}>
          {label}
        </Typography>
      )}
      {textField}
    </Paper>
  );
};

export default StyledTextArea;