import React from "react";
import {
  Box,
  Chip,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import SportsHandballOutlinedIcon from "@mui/icons-material/SportsHandballOutlined";
import InvertColorsOutlinedIcon from "@mui/icons-material/InvertColorsOutlined";
import AirIcon from "@mui/icons-material/Air";
import NightlightOutlinedIcon from "@mui/icons-material/NightlightOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import WbTwilightOutlinedIcon from "@mui/icons-material/WbTwilightOutlined";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import {
  MEDICATION_CATEGORY_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  MEDICATION_FOOD_OPTIONS,
  MEDICATION_FREQUENCY_OPTIONS,
  MEDICATION_ROUTE_OPTIONS,
  MEDICATION_TIMING_OPTIONS,
  getMedicationRouteOptions,
  shouldShowMedicationRoute,
  summarizeMedicationDetail,
} from "./childMedicationHelpers";
import colors from "../../../assets/theme/colors";

const categoryPalette = {
  prescription: {
    surface: "rgba(74, 122, 255, 0.07)",
    border: "rgba(74, 122, 255, 0.18)",
    chipBg: "rgba(74, 122, 255, 0.12)",
    chipText: "#2F5FE3",
  },
  otc: {
    surface: "rgba(244, 178, 79, 0.08)",
    border: "rgba(244, 178, 79, 0.18)",
    chipBg: "rgba(244, 178, 79, 0.16)",
    chipText: "#A96500",
  },
  supplement: {
    surface: "rgba(64, 174, 163, 0.08)",
    border: "rgba(64, 174, 163, 0.18)",
    chipBg: "rgba(64, 174, 163, 0.14)",
    chipText: "#1E7C73",
  },
  vitamin: {
    surface: "rgba(150, 102, 217, 0.08)",
    border: "rgba(150, 102, 217, 0.18)",
    chipBg: "rgba(150, 102, 217, 0.14)",
    chipText: "#7648C0",
  },
  prn: {
    surface: "rgba(217, 112, 137, 0.07)",
    border: "rgba(217, 112, 137, 0.18)",
    chipBg: "rgba(217, 112, 137, 0.14)",
    chipText: "#B54E69",
  },
  other: {
    surface: "rgba(115, 130, 153, 0.06)",
    border: "rgba(115, 130, 153, 0.16)",
    chipBg: "rgba(115, 130, 153, 0.12)",
    chipText: "#5A6679",
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

const formBgMap = {
  pill: "rgba(74, 122, 255, 0.08)",
  tablet: "rgba(74, 122, 255, 0.08)",
  capsule: "rgba(64, 174, 163, 0.10)",
  liquid: "rgba(64, 174, 163, 0.10)",
  drops: "rgba(150, 102, 217, 0.10)",
  cream: "rgba(244, 178, 79, 0.10)",
  suppository: "rgba(217, 112, 137, 0.10)",
  inhaler: "rgba(115, 130, 153, 0.10)",
};

const timingIcons = {
  morning: WbSunnyOutlinedIcon,
  afternoon: WbTwilightOutlinedIcon,
  evening: NightlightOutlinedIcon,
  bedtime: BedtimeRoundedIcon,
};

const timingStyles = {
  morning: {
    iconBg: "rgba(250, 204, 21, 0.14)",
    iconColor: "#D97706",
    chipBg: "rgba(250, 204, 21, 0.12)",
    chipBorder: "rgba(250, 204, 21, 0.26)",
  },
  afternoon: {
    iconBg: "rgba(251, 146, 60, 0.14)",
    iconColor: "#EA580C",
    chipBg: "rgba(251, 146, 60, 0.12)",
    chipBorder: "rgba(251, 146, 60, 0.26)",
  },
  evening: {
    iconBg: "rgba(139, 92, 246, 0.14)",
    iconColor: "#7C3AED",
    chipBg: "rgba(139, 92, 246, 0.12)",
    chipBorder: "rgba(139, 92, 246, 0.26)",
  },
  bedtime: {
    iconBg: "rgba(14, 165, 233, 0.14)",
    iconColor: "#0284C7",
    chipBg: "rgba(14, 165, 233, 0.12)",
    chipBorder: "rgba(14, 165, 233, 0.26)",
  },
};

const medicationLabelStyles = {
  borderRadius: 999,
  px: 1.05,
  py: 0.5,
  fontWeight: 700,
  textTransform: "none",
};

const MedicationDetailCard = ({ entry, index, onChange, onRemove, onSave }) => {
  const category = entry.category || "prescription";
  const palette = categoryPalette[category] || categoryPalette.other;
  const selectedForm = entry.form || "pill";
  const showRoute = shouldShowMedicationRoute(selectedForm);
  const routeOptions = getMedicationRouteOptions(selectedForm);
  const summary = summarizeMedicationDetail(entry);
  const isPrn = category === "prn";
  const isCustomFrequency = entry.frequency === "custom";
  const hasAdvancedData =
    isPrn ||
    isCustomFrequency ||
    (Array.isArray(entry.timing) && entry.timing.length > 0) ||
    (entry.foodRelation && entry.foodRelation !== "anytime") ||
    Boolean(entry.route) ||
    Boolean(entry.maxDailyDoses);
  const [showAdvanced, setShowAdvanced] = React.useState(hasAdvancedData);
  const summaryParts = [summary];
  const syncStatus = entry.syncStatus || "draft";
  const isSaved = syncStatus === "saved";
  const canSave = typeof onSave === "function" && Boolean(String(entry.name || "").trim());

  React.useEffect(() => {
    setShowAdvanced(hasAdvancedData);
  }, [entry.id, hasAdvancedData]);

  if (showRoute && entry.route) {
    const routeSummary = MEDICATION_ROUTE_OPTIONS.find((option) => option.value === entry.route)?.label || entry.route;
    summaryParts.push(`Route: ${routeSummary}`);
  }

  if (isPrn && entry.maxDailyDoses) {
    summaryParts.push(`Max ${entry.maxDailyDoses}/day`);
  }

  const handleTimingToggle = (value) => {
    const currentTiming = Array.isArray(entry.timing) ? entry.timing : [];
    const nextTiming = currentTiming.includes(value)
      ? currentTiming.filter((item) => item !== value)
      : [...currentTiming, value];
    onChange("timing", nextTiming);
  };

  return (
    <Box
      sx={{
        width: "calc(100% + 0.5rem)",
        mx: { xs: -0.25, sm: -0.35 },
        px: 0,
        py: { xs: 0.15, sm: 0.2 },
        borderRadius: 0,
        border: 0,
        bgcolor: palette.surface,
        boxShadow: "none",
      }}
    >
      <Stack spacing={0.65}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Medication {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Save this row when you are ready to keep it.
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Chip
              label={isSaved ? "Saved" : "Draft"}
              size="small"
              sx={{
                bgcolor: isSaved ? "rgba(64, 174, 163, 0.14)" : "rgba(115, 130, 153, 0.10)",
                color: isSaved ? "#1E7C73" : colors.landing.textMuted,
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
            />
            <IconButton
              size="small"
              onClick={onRemove}
              aria-label={`Remove medication ${index + 1}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.85)",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 12px rgba(60, 72, 88, 0.04)",
                flexShrink: 0,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.35,
            pt: 0.2,
          }}
        >
          <TextField
            size="small"
            select
            label="Category"
            value={category}
            onChange={(event) => onChange("category", event.target.value)}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 170px" },
              "& .MuiInputBase-root": {
                borderRadius: 999,
              },
            }}
            SelectProps={{
              renderValue: (selected) => {
                const option = MEDICATION_CATEGORY_OPTIONS.find((item) => item.value === selected);
                const optionPalette = categoryPalette[selected] || categoryPalette.other;

                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        bgcolor: optionPalette.chipText,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 700,
                        color: optionPalette.chipText,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {option?.label || "Category"}
                    </Typography>
                  </Box>
                );
              },
            }}
          >
            {MEDICATION_CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: (categoryPalette[option.value] || categoryPalette.other).chipText,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontWeight: 600 }}>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="How often"
            value={entry.frequency}
            onChange={(event) => onChange("frequency", event.target.value)}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 170px" },
              "& .MuiInputBase-root": {
                borderRadius: 999,
              },
            }}
            SelectProps={{
              renderValue: (selected) => {
                const option = MEDICATION_FREQUENCY_OPTIONS.find((item) => item.value === selected);
                return option?.label || "How often";
              },
            }}
          >
            {MEDICATION_FREQUENCY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {isCustomFrequency ? (
            <Box
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 220px" },
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.6,
                py: 0.25,
                borderRadius: 999,
                border: "1px solid",
                borderColor: palette.border,
                bgcolor: "rgba(255,255,255,0.72)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
                minWidth: 0,
              }}
            >
              <Chip
                label="Custom"
                size="small"
                sx={{
                  ...medicationLabelStyles,
                  px: 0.65,
                  py: 0.1,
                  bgcolor: palette.chipBg,
                  color: palette.chipText,
                  minHeight: 20,
                }}
              />
              <TextField
                variant="standard"
                size="small"
                value={entry.customFrequency || ""}
                onChange={(event) => onChange("customFrequency", event.target.value)}
                placeholder="Every 3h"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  minWidth: 0,
                  flex: 1,
                  "& .MuiInputBase-input": {
                    py: 0.1,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 0.5,
          }}
        >
          <TextField
            size="small"
            label="Medication name"
            value={entry.name}
            onChange={(event) => onChange("name", event.target.value)}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(0, 1fr) minmax(120px, 0.48fr)",
            },
            gap: 0.5,
          }}
        >
          <TextField
            size="small"
            label="Dose"
            value={entry.dose}
            onChange={(event) => onChange("dose", event.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Unit"
            value={entry.unit}
            onChange={(event) => onChange("unit", event.target.value)}
            fullWidth
            placeholder="mg, ml, puffs"
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography
            sx={{
              fontWeight: 500,
              color: colors.landing.textMuted,
              textTransform: "none",
              letterSpacing: 0,
              fontSize: "0.72rem",
              lineHeight: 1.1,
              mb: -0.15,
            }}
          >
            Form
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 0.2,
              overflowX: "auto",
              pb: 0.5,
              flexWrap: "nowrap",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": { borderRadius: 999, background: "rgba(115,130,153,0.18)" },
            }}
          >
            {MEDICATION_FORM_OPTIONS.map((option) => {
              const SelectedIcon = formIconMap[option.value] || MedicationOutlinedIcon;
              const isActive = selectedForm === option.value;
              const optionBg = formBgMap[option.value] || "rgba(115,130,153,0.08)";

              return (
                <Box
                  key={option.value}
                  component="button"
                  type="button"
                  onClick={() => onChange("form", option.value)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: isActive ? palette.border : "divider",
                    bgcolor: isActive ? optionBg : "background.paper",
                    px: 0.72,
                    py: 0.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.28,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: palette.border,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(255,255,255,0.6)",
                      color: colors.brand.deep,
                      flexShrink: 0,
                    }}
                  >
                    <SelectedIcon fontSize="inherit" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {option.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 0.5,
          }}
        >
          <TextField
            size="small"
            label="Start date"
            type="date"
            value={entry.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Notes"
            value={entry.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Optional reminders or instructions"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            variant="text"
            onClick={() => setShowAdvanced((current) => !current)}
            sx={{
              minWidth: 0,
              px: 0,
              py: 0,
              textTransform: "none",
              fontWeight: 700,
              color: colors.brand.deep,
            }}
          >
            {showAdvanced ? "Hide details" : "More details"}
          </Button>

          <Typography variant="caption" color="text.secondary">
            Timing, food, and route stay tucked away.
          </Typography>
        </Box>

        {showAdvanced ? (
          <Stack spacing={0.85}>
            {isPrn ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 0.7fr) 1fr" },
                  gap: 0.5,
                }}
              >
                <TextField
                  size="small"
                  label="Max doses/day"
                  value={entry.maxDailyDoses}
                  onChange={(event) => onChange("maxDailyDoses", event.target.value)}
                  fullWidth
                  helperText="Used for PRN medications."
                />
                <Box
                  sx={{
                    p: 1.1,
                    borderRadius: 2,
                    bgcolor: "rgba(115, 130, 153, 0.08)",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Timing is hidden for PRN.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.55 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  Timing
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.4}
                  useFlexGap={false}
                  sx={{
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    pb: 0.4,
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": { borderRadius: 999, background: "rgba(115,130,153,0.18)" },
                  }}
                >
              {MEDICATION_TIMING_OPTIONS.map((option) => {
                const active = Array.isArray(entry.timing) && entry.timing.includes(option.value);
                const TimingIcon = timingIcons[option.value] || WbSunnyOutlinedIcon;
                const timingStyle = timingStyles[option.value] || timingStyles.morning;

                return (
                  <Chip
                    key={option.value}
                    label={option.label}
                    icon={<TimingIcon fontSize="small" />}
                    onClick={() => handleTimingToggle(option.value)}
                    variant={active ? "filled" : "outlined"}
                    sx={{
                      ...medicationLabelStyles,
                      px: 0.8,
                      py: 0.4,
                      bgcolor: active ? timingStyle.chipBg : "transparent",
                      color: active ? timingStyle.iconColor : colors.brand.navy,
                      borderColor: active ? timingStyle.chipBorder : "divider",
                      "& .MuiChip-icon": {
                        color: active ? timingStyle.iconColor : colors.brand.deep,
                        bgcolor: timingStyle.iconBg,
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        display: "grid",
                        placeItems: "center",
                        marginLeft: 0.25,
                      },
                    }}
                  />
                );
              })}
                </Stack>
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.55 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Food relation
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                {MEDICATION_FOOD_OPTIONS.map((option) => {
                  const active = entry.foodRelation === option.value;
                  const iconMap = {
                    before_food: <ScienceOutlinedIcon fontSize="small" />,
                    with_food: <LocalDiningOutlinedIcon fontSize="small" />,
                    anytime: <MonitorHeartOutlinedIcon fontSize="small" />,
                  };

                  return (
                    <Chip
                      key={option.value}
                      label={option.label}
                      icon={iconMap[option.value]}
                      onClick={() => onChange("foodRelation", option.value)}
                      variant={active ? "filled" : "outlined"}
                      sx={{
                        ...medicationLabelStyles,
                        bgcolor: active ? palette.chipBg : "transparent",
                        color: active ? palette.chipText : colors.brand.navy,
                        borderColor: active ? palette.border : "divider",
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {showRoute ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.55 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  How to give
                </Typography>
                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                  {routeOptions.map((routeValue) => {
                    const routeLabel = MEDICATION_ROUTE_OPTIONS.find((option) => option.value === routeValue)?.label || routeValue;
                    const active = entry.route === routeValue;
                    return (
                      <Chip
                        key={routeValue}
                        label={routeLabel}
                        onClick={() => onChange("route", routeValue)}
                        variant={active ? "filled" : "outlined"}
                        sx={{
                          ...medicationLabelStyles,
                          bgcolor: active ? palette.chipBg : "transparent",
                          color: active ? palette.chipText : colors.brand.navy,
                          borderColor: active ? palette.border : "divider",
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        ) : null}

        <Box
          sx={{
            pt: 0.5,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {summaryParts.filter(Boolean).join(" • ") || "Fill in the row to generate a quick summary."}
          </Typography>

          {typeof onSave === "function" ? (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-end" } }}>
              <Button
                size="small"
                variant={isSaved ? "outlined" : "contained"}
                startIcon={<SaveOutlinedIcon fontSize="small" />}
                onClick={onSave}
                disabled={!canSave}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  minWidth: 0,
                  px: 0.65,
                  py: 0.15,
                  minHeight: 20,
                  fontSize: "0.62rem",
                  bgcolor: isSaved ? "background.paper" : colors.dashboard?.childHeader?.finishProfileBg || "rgba(240,207,195,0.5)",
                  color: colors.brand.navy,
                  borderColor: isSaved ? "divider" : colors.dashboard?.childHeader?.finishProfileBorder || "rgba(240,207,195,0.55)",
                  boxShadow: isSaved ? "none" : "0 6px 16px rgba(60,72,88,0.06)",
                  "&:hover": {
                    bgcolor: isSaved ? "background.paper" : colors.dashboard?.childHeader?.finishProfileHoverBg || "rgba(240,207,195,0.7)",
                    boxShadow: "none",
                  },
                }}
              >
                {isSaved ? "Saved" : "Save medication"}
              </Button>
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

export default MedicationDetailCard;
