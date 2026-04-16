import React from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import SportsHandballOutlinedIcon from "@mui/icons-material/SportsHandballOutlined";
import InvertColorsOutlinedIcon from "@mui/icons-material/InvertColorsOutlined";
import AirIcon from "@mui/icons-material/Air";
import { LogTimeField } from "../../UI";
import DoseUnitField from "./DoseUnitField";
import {
  MEDICATION_CATEGORY_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  createMedicationSchedule,
  normalizeMedicationSchedule,
  summarizeMedicationDetail,
} from "./childMedicationHelpers";
import colors from "../../../assets/theme/colors";

const categoryPalette = {
  prescription: {
    tint: "rgba(74, 122, 255, 0.08)",
    border: "rgba(74, 122, 255, 0.16)",
    dot: "#2F5FE3",
  },
  otc: {
    tint: "rgba(244, 178, 79, 0.08)",
    border: "rgba(244, 178, 79, 0.18)",
    dot: "#A96500",
  },
  supplement: {
    tint: "rgba(64, 174, 163, 0.08)",
    border: "rgba(64, 174, 163, 0.18)",
    dot: "#1E7C73",
  },
  vitamin: {
    tint: "rgba(150, 102, 217, 0.08)",
    border: "rgba(150, 102, 217, 0.18)",
    dot: "#7648C0",
  },
  prn: {
    tint: "rgba(217, 112, 137, 0.07)",
    border: "rgba(217, 112, 137, 0.18)",
    dot: "#B54E69",
  },
  other: {
    tint: "rgba(115, 130, 153, 0.06)",
    border: "rgba(115, 130, 153, 0.16)",
    dot: "#5A6679",
  },
};

const formIconMap = {
  pill: MedicationOutlinedIcon,
  tablet: MedicationOutlinedIcon,
  capsule: HealingOutlinedIcon,
  liquid: OpacityOutlinedIcon,
  drops: InvertColorsOutlinedIcon,
  cream: SpaOutlinedIcon,
  suppository: SportsHandballOutlinedIcon,
  inhaler: AirIcon,
};

const formPalette = {
  pill: "rgba(74, 122, 255, 0.10)",
  tablet: "rgba(74, 122, 255, 0.10)",
  capsule: "rgba(64, 174, 163, 0.12)",
  liquid: "rgba(64, 174, 163, 0.12)",
  drops: "rgba(150, 102, 217, 0.12)",
  cream: "rgba(244, 178, 79, 0.12)",
  suppository: "rgba(217, 112, 137, 0.12)",
  inhaler: "rgba(115, 130, 153, 0.12)",
};

const defaultSchedule = () => createMedicationSchedule();

const ensureSchedules = (entry) => {
  const schedules = Array.isArray(entry?.schedules) && entry.schedules.length
    ? entry.schedules.map(normalizeMedicationSchedule)
    : [defaultSchedule()];

  return schedules.length ? schedules : [defaultSchedule()];
};

const fieldLabelSx = {
  fontSize: "0.68rem",
  lineHeight: 1.1,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: colors.landing.textMuted,
};

const sectionTitleSx = {
  fontWeight: 800,
  color: colors.brand.navy,
  lineHeight: 1.1,
};

const MedicationDetailCard = ({
  entry,
  index,
  onChange,
  onRemove,
  onSave,
  title,
  subtitle,
}) => {
  const normalizedSchedules = ensureSchedules(entry);
  const category = entry.category || "prescription";
  const form = entry.form || "pill";
  const categoryTheme = categoryPalette[category] || categoryPalette.other;
  const canSave = Boolean(
    String(entry?.name || "").trim()
      && String(entry?.startDate || "").trim()
      && String(entry?.category || "").trim()
      && String(entry?.form || "").trim()
      && normalizedSchedules.length
      && normalizedSchedules.every((schedule) => String(schedule?.dose || "").trim() && String(schedule?.time || "").trim())
  );
  const summary = summarizeMedicationDetail({
    ...entry,
    schedules: normalizedSchedules,
  });

  const updateSchedules = (nextSchedules) => {
    onChange("schedules", nextSchedules.map((schedule, scheduleIndex) => normalizeMedicationSchedule({
      ...schedule,
      id: schedule.id || `${entry.id || index}-${scheduleIndex}`,
    })));
  };

  const updateScheduleField = (scheduleIndex, field, value) => {
    const nextSchedules = normalizedSchedules.map((schedule, indexValue) => (
      indexValue === scheduleIndex
        ? {
            ...schedule,
            [field]: value,
          }
        : schedule
    ));
    updateSchedules(nextSchedules);
  };

  const addScheduleRow = () => {
    updateSchedules([
      ...normalizedSchedules,
      defaultSchedule(),
    ]);
  };

  const removeScheduleRow = (scheduleIndex) => {
    if (normalizedSchedules.length <= 1) {
      return;
    }

    updateSchedules(normalizedSchedules.filter((_, indexValue) => indexValue !== scheduleIndex));
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 0,
        p: 0,
        bgcolor: "transparent",
        border: "none",
        boxShadow: "none",
      }}
    >
      <Stack spacing={1.05} sx={{ px: { xs: 0.2, sm: 0.35 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              <Typography sx={sectionTitleSx}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.35 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1.55fr) minmax(118px, 0.8fr)", sm: "minmax(0, 1.65fr) minmax(150px, 0.72fr)" },
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={fieldLabelSx}>Medication name</Typography>
            <TextField
              size="small"
              value={entry.name || ""}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. Melatonin"
              fullWidth
              sx={{
                mt: 0.4,
                "& .MuiInputBase-root": {
                  minHeight: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.94)",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(217, 209, 238, 0.58)",
                  borderWidth: "1px",
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Start date</Typography>
            <TextField
              size="small"
              type="date"
              value={entry.startDate || ""}
              onChange={(event) => onChange("startDate", event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                mt: 0.4,
                "& .MuiInputBase-root": {
                  minHeight: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.94)",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(217, 209, 238, 0.58)",
                  borderWidth: "1px",
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={fieldLabelSx}>Category</Typography>
            <TextField
              select
              size="small"
              value={category}
              onChange={(event) => onChange("category", event.target.value)}
              fullWidth
              sx={{
                mt: 0.4,
                "& .MuiInputBase-root": {
                  minHeight: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.94)",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: categoryTheme.border,
                  borderWidth: "1px",
                },
              }}
              SelectProps={{
                renderValue: (selected) => {
                  const selectedOption = MEDICATION_CATEGORY_OPTIONS.find((option) => option.value === selected);
                  const selectedTheme = categoryPalette[selected] || categoryPalette.other;

                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, minWidth: 0 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: selectedTheme.dot, flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 700, color: selectedTheme.dot, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {selectedOption?.label || "Category"}
                      </Typography>
                    </Box>
                  );
                },
              }}
            >
              {MEDICATION_CATEGORY_OPTIONS.map((option) => {
                const theme = categoryPalette[option.value] || categoryPalette.other;
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: theme.dot, flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 600 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Form</Typography>
            <TextField
              select
              size="small"
              value={form}
              onChange={(event) => onChange("form", event.target.value)}
              fullWidth
              sx={{
                mt: 0.4,
                "& .MuiInputBase-root": {
                  minHeight: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.94)",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(217, 209, 238, 0.58)",
                  borderWidth: "1px",
                },
              }}
              SelectProps={{
                renderValue: (selected) => {
                  const selectedOption = MEDICATION_FORM_OPTIONS.find((option) => option.value === selected);
                  const SelectedIcon = formIconMap[selected] || MedicationOutlinedIcon;
                  const formTint = formPalette[selected] || "rgba(115, 130, 153, 0.10)";

                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          bgcolor: formTint,
                          color: colors.brand.deep,
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <SelectedIcon sx={{ fontSize: 12 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: colors.brand.navy }}>
                        {selectedOption?.label || "Form"}
                      </Typography>
                    </Box>
                  );
                },
              }}
            >
              {MEDICATION_FORM_OPTIONS.map((option) => {
                const OptionIcon = formIconMap[option.value] || MedicationOutlinedIcon;
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: formPalette[option.value] || "rgba(115,130,153,0.12)", display: "grid", placeItems: "center", color: colors.brand.deep }}>
                        <OptionIcon sx={{ fontSize: 12 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ ...fieldLabelSx, mb: 0.75 }}>Dosage schedule</Typography>
          <Stack spacing={0.85}>
            {normalizedSchedules.map((schedule, scheduleIndex) => {
              const isLast = scheduleIndex === normalizedSchedules.length - 1;

              return (
                <Box
                  key={schedule.id || `${entry.id || index}-${scheduleIndex}`}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0.7,
                    flexWrap: "nowrap",
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ flex: "1.35 1 0%", minWidth: 0 }}>
                    <DoseUnitField
                      dose={schedule.dose}
                      unit={schedule.unit || "mg"}
                      onDoseChange={(value) => updateScheduleField(scheduleIndex, "dose", value)}
                      onUnitChange={(value) => updateScheduleField(scheduleIndex, "unit", value)}
                    />
                  </Box>

                  <Box sx={{ flex: "0.95 1 0%", minWidth: 120 }}>
                    <LogTimeField
                      value={schedule.time || ""}
                      onChange={(event) => updateScheduleField(scheduleIndex, "time", event.target.value)}
                      showLabel={false}
                      sx={{
                        "& .MuiInputBase-root": {
                          minHeight: 48,
                          borderRadius: "12px",
                        },
                        "& input": {
                          paddingTop: "0.82rem",
                          paddingBottom: "0.82rem",
                          fontWeight: 600,
                          fontSize: "0.96rem",
                        },
                      }}
                    />
                  </Box>

                  <IconButton
                    size="small"
                    onClick={isLast ? addScheduleRow : () => removeScheduleRow(scheduleIndex)}
                    aria-label={isLast ? "Add schedule row" : "Remove schedule row"}
                      sx={{
                      flexShrink: 0,
                      width: 38,
                      height: 38,
                      mt: 0.3,
                      borderRadius: "10px",
                      border: "1px solid rgba(217, 209, 238, 0.58)",
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: colors.brand.deep,
                    }}
                  >
                    {isLast ? <AddRoundedIcon fontSize="small" /> : <DeleteOutlineIcon fontSize="small" />}
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box
          sx={{
            pt: 0.35,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            {summary || "Fill the row to create a quick medication summary."}
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}>
            <IconButton
              type="button"
              onClick={onRemove}
              aria-label="Cancel medication"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                border: "1px solid rgba(217, 209, 238, 0.58)",
                color: colors.brand.deep,
                bgcolor: "rgba(255,255,255,0.88)",
                "&:hover": {
                  borderColor: "rgba(194, 181, 229, 1)",
                  bgcolor: "rgba(255,255,255,0.96)",
                },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              type="button"
              onClick={onSave}
              disabled={!canSave}
              aria-label="Save medication"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                border: "1px solid rgba(217, 209, 238, 0.58)",
                color: canSave ? colors.brand.ink : "rgba(73, 79, 92, 0.35)",
                bgcolor: canSave ? colors.landing.sageLight : "rgba(115, 130, 153, 0.12)",
                "&:hover": canSave
                  ? {
                      borderColor: "rgba(194, 181, 229, 1)",
                      bgcolor: "rgba(244, 241, 248, 0.94)",
                    }
                  : undefined,
              }}
            >
              <CheckRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default MedicationDetailCard;
