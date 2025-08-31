import React from 'react';
import { TextField, Autocomplete, Typography, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { createFilterOptions } from '@mui/material/Autocomplete';

/**
 * CustomizableAutocomplete - Reusable dropdown component with custom entry support
 * 
 * Features:
 * - Shows existing options
 * - Shows "+ Add [custom text]" option when typing new entries
 * - Supports custom renderTags for special chip rendering (like AllergyChip)
 * - Consistent UX across all forms
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of predefined options (strings or objects)
 * @param {Array} props.value - Current selected values
 * @param {Function} props.onChange - Value change handler
 * @param {string} props.label - Field label
 * @param {string} props.helperText - Helper text (optional)
 * @param {Function} props.renderTags - Custom tag renderer (optional)
 * @param {Function} props.getOptionLabel - How to display options (for objects)
 * @param {string} props.addText - Custom text for add button (default: "Add")
 * @param {Object} props.sx - Additional styling
 */
const CustomizableAutocomplete = ({
  options = [],
  value = [],
  onChange,
  label,
  helperText,
  renderTags,
  getOptionLabel,
  addText = "Add",
  sx = {},
  ...autocompleteProps
}) => {
  const filter = createFilterOptions({
    stringify: getOptionLabel || ((option) => 
      typeof option === "string" ? option : option.label || String(option)
    ),
  });

  const handleFilterOptions = (opts, params) => {
    const filtered = filter(opts, params);
    
    // If user is typing and input doesn't match existing options, show "Add" option
    if (params.inputValue !== '') {
      const inputValue = params.inputValue.trim();
      const existingOption = opts.find(opt => {
        const optLabel = getOptionLabel ? 
          getOptionLabel(opt) : 
          (typeof opt === "string" ? opt : opt.label || String(opt));
        return optLabel.toLowerCase() === inputValue.toLowerCase();
      });
      
      // Only show "Add" option if input doesn't match existing options
      if (!existingOption && inputValue.length > 0) {
        filtered.push({
          inputValue,
          isCustom: true,
          label: `${addText} "${inputValue}"`
        });
      }
    }
    
    return filtered;
  };

  const handleChange = (event, newValue) => {
    // Process the new value to handle custom entries
    const processedValue = newValue.map(item => {
      // If it's a custom entry object, return just the input value
      if (item && typeof item === 'object' && item.isCustom) {
        return item.inputValue;
      }
      return item;
    });
    
    onChange(event, processedValue);
  };

  const displayOptionLabel = (option) => {
    if (typeof option === "string") {
      return option;
    }
    
    // Handle custom "Add" options
    if (option && option.isCustom) {
      return option.label;
    }
    
    // Use provided getOptionLabel or default
    if (getOptionLabel) {
      return getOptionLabel(option);
    }
    
    return option.label || String(option);
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      onChange={handleChange}
      filterOptions={handleFilterOptions}
      getOptionLabel={displayOptionLabel}
      renderTags={renderTags}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ...(option && option.isCustom && {
              color: 'primary.main',
              fontWeight: 500,
              backgroundColor: 'primary.50',
              '&:hover': {
                backgroundColor: 'primary.100'
              }
            })
          }}
        >
          {option && option.isCustom && (
            <AddIcon 
              sx={{ 
                fontSize: 16, 
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 16,
                height: 16,
                p: 0.2
              }} 
            />
          )}
          <Typography>
            {displayOptionLabel(option)}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          helperText={helperText || `Select from list or type custom ${label?.toLowerCase()} and click the + option (or press Enter)`}
          sx={sx}
        />
      )}
      {...autocompleteProps}
    />
  );
};

export default CustomizableAutocomplete;