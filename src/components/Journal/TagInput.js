import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Chip, CircularProgress } from "@mui/material";
import { fetchTags, addTag } from "../../services/tagService"; // Firestore service functions

const TagInput = ({ tags, setTags, childId }) => {
  const [availableTags, setAvailableTags] = useState([]); // Available tags from Firestore
  const [loading, setLoading] = useState(false);

  // Fetch existing tags from Firestore when the component mounts
  useEffect(() => {
    const loadTags = async () => {
      setLoading(true);
      const fetchedTags = await fetchTags(childId);
      console.log("Fetched tags from Firestore:", fetchedTags);
      setAvailableTags(fetchedTags);
      setLoading(false);
    };

    loadTags();
  }, [childId]);

  const handleTagAddition = async (newValue) => {
    console.log("New value received in TagInput:", newValue); // Logs the selected or added tags

    // Format the new tags, converting strings to objects
    const newTags = newValue.map((tag) =>
      typeof tag === "string" ? { name: tag } : tag
    );

    console.log("Formatted new tags:", newTags); // Logs the formatted tags

    // Identify new tags that are not already in the available tags list
    const addedTags = newTags.filter(
      (tag) => !availableTags.some((t) => t.name === tag.name)
    );

    // Add new tags to Firestore
    for (const tag of addedTags) {
      await addTag(childId, tag.name); // Save the new tag to Firestore
      setAvailableTags((prev) => [...prev, tag]); // Update available tags in UI
    }

    // Update the tags state in AddJournalModal
    setTags(newTags);
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      value={tags} // Reflects the current selected tags
      onChange={(event, newValue) => handleTagAddition(newValue)} // Calls handleTagAddition when tags change
      options={availableTags} // Options fetched from Firestore
      getOptionLabel={
        (option) => (typeof option === "string" ? option : option.name) // Display the tag name
      }
      loading={loading} // Displays a loading spinner while fetching tags
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            key={index}
            variant="outlined"
            label={typeof option === "string" ? option : option.name}
            {...getTagProps({ index })}
          />
        ))
      }
    />
  );
};

export default TagInput;
