import React from "react";
import { Box, MenuItem, TextField } from "@mui/material";

const UNIT_OPTIONS = ["mg", "mL", "mcg", "tablet", "capsule", "drop"];

const DoseUnitField = ({
  dose = "",
  unit = "mg",
  onDoseChange,
  onUnitChange,
  sx = {},
}) => {
  const nextUnit = unit || "mg";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        minWidth: 0,
        borderRadius: "16px",
        border: "1px solid rgba(217, 209, 238, 0.58)",
        bgcolor: "rgba(255,255,255,0.92)",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        ...sx,
      }}
    >
      <TextField
        variant="standard"
        value={dose || ""}
        onChange={(event) => onDoseChange?.(event.target.value)}
        placeholder="Dose"
        fullWidth
        InputProps={{
          disableUnderline: true,
        }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          "aria-label": "dose",
        }}
        sx={{
          flex: "1.35 1 0%",
          minWidth: 0,
          "& .MuiInputBase-input": {
            px: 1.25,
            py: 1.08,
            fontSize: "0.96rem",
            fontWeight: 600,
            color: "#334155",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#9ca3af",
            opacity: 1,
          },
        }}
      />

      <Box sx={{ width: "1px", bgcolor: "rgba(217, 209, 238, 0.72)", flex: "none" }} />

      <TextField
        select
        variant="standard"
        value={nextUnit}
        onChange={(event) => onUnitChange?.(event.target.value)}
        fullWidth
        InputProps={{
          disableUnderline: true,
        }}
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => selected || "Unit",
        }}
        inputProps={{
          "aria-label": "dose unit",
        }}
        sx={{
          flex: "0.95 0 0%",
          minWidth: 0,
          "& .MuiInputBase-root": {
            height: "100%",
          },
          "& .MuiSelect-select": {
            px: 1.08,
            py: 1.08,
            fontSize: "0.96rem",
            fontWeight: 600,
            color: "#334155",
          },
        }}
      >
        {UNIT_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default DoseUnitField;
