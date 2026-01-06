import React, { useMemo, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const normalizeTag = (tag) => tag.trim();

const uniqueTags = (tags) => {
  const seen = new Set();
  return tags.filter((tag) => {
    const normalized = normalizeTag(tag).toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

const TagInput = ({
  value = [],
  onChange,
  suggestions = [],
  label = 'Tags',
  placeholder = 'Add tags',
  autoFocus = false,
  disabled = false,
  onClick,
  onMouseDown
}) => {
  const [inputValue, setInputValue] = useState('');

  const options = useMemo(() => uniqueTags(suggestions), [suggestions]);

  const commitTag = (rawTag) => {
    const trimmed = normalizeTag(rawTag);
    if (!trimmed) return;
    const next = uniqueTags([...(value || []), trimmed]);
    onChange?.(next);
  };

  const handleKeyDown = (event) => {
    if (event.key === ',') {
      event.preventDefault();
      commitTag(inputValue);
      setInputValue('');
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      commitTag(inputValue);
      setInputValue('');
    }
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      inputValue={inputValue}
      filterSelectedOptions
      disabled={disabled}
      onChange={(event, newValue) => {
        const next = uniqueTags(newValue);
        onChange?.(next);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
    />
  );
};

export default TagInput;
