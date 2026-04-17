import React from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MedicationDetailCard from "./MedicationDetailCard";
import { MEDICATION_CATEGORY_OPTIONS } from "./childMedicationHelpers";
import colors from "../../../assets/theme/colors";

const categoryAccentMap = {
  prescription: "#4A7AFF",
  otc: "#F4B24F",
  supplement: "#40AEA3",
  vitamin: "#9666D9",
  prn: "#D97089",
  other: "#738299",
};

const getMedicationSummary = (entry = {}) => {
  const categoryLabel =
    MEDICATION_CATEGORY_OPTIONS.find((option) => option.value === entry?.category)?.label || "Other";
  const primarySchedule = Array.isArray(entry?.schedules) && entry.schedules.length
    ? entry.schedules[0]
    : null;
  const dose = String(primarySchedule?.dose || entry?.dose || "").trim();
  const unit = String(primarySchedule?.unit || entry?.unit || "").trim();
  const time = String(primarySchedule?.time || entry?.time || "").trim();
  const details = [];

  if (dose) {
    details.push(unit ? `${dose} ${unit}` : dose);
  }

  if (time) {
    details.push(time);
  }

  return [categoryLabel, ...details].join(" • ");
};

const getAccentColor = (entry) => categoryAccentMap[entry?.category] || categoryAccentMap.other;

const listRowSx = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  columnGap: { xs: 0.75, sm: 1 },
  px: { xs: 0.25, sm: 0.5 },
  py: { xs: 0.8, sm: 0.9 },
  borderBottom: "1px solid rgba(217, 209, 238, 0.38)",
};

const actionButtonSx = {
  width: 30,
  height: 30,
  borderRadius: 1,
  border: "1px solid transparent",
  color: colors.brand.deep,
  bgcolor: "transparent",
  transition: "background-color 140ms ease, border-color 140ms ease, transform 140ms ease",
  "&:hover": {
    bgcolor: "rgba(74, 122, 255, 0.06)",
    borderColor: "rgba(217, 209, 238, 0.42)",
    transform: "translateY(-1px)",
  },
};

const ChildMedicationManager = ({
  medications = [],
  draft,
  editingMedicationId,
  isEditorOpen = false,
  onDraftChange,
  onSaveDraft,
  onEditMedication,
  onAddMedication,
  onArchiveMedication,
  onClearDraft,
}) => {
  const activeMedications = medications.filter((entry) => !entry?.isArchived);
  const archivedMedications = medications.filter((entry) => entry?.isArchived);
  const isEditing = Boolean(editingMedicationId);
  const showEditor = Boolean(isEditorOpen || isEditing);
  const hasActiveMedications = activeMedications.length > 0;

  const renderMedicationRow = (entry, index, archived = false) => {
    const accentColor = archived ? "rgba(115, 130, 153, 0.52)" : getAccentColor(entry);
    const summary = getMedicationSummary(entry);

    return (
      <Box
        key={entry.id}
        sx={{
          ...listRowSx,
          opacity: archived ? 0.68 : 1,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            borderLeft: `3px solid ${accentColor}`,
            pl: { xs: 0.95, sm: 1.05 },
            pr: 0.75,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: archived ? colors.brand.navy : colors.brand.ink,
              lineHeight: 1.08,
              fontSize: { xs: "0.98rem", sm: "1rem" },
            }}
            noWrap
          >
            {entry.name || (archived ? "Archived medication" : `Medication ${index + 1}`)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.2,
              lineHeight: 1.25,
              fontSize: { xs: "0.82rem", sm: "0.86rem" },
            }}
            noWrap
          >
            {summary || (archived ? "Archived" : "Saved medication")}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={0.35}
          sx={{
            alignItems: "center",
            justifySelf: "end",
            ml: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => onEditMedication?.(entry)}
            aria-label={`Edit medication ${entry.name || index + 1}`}
            sx={actionButtonSx}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onArchiveMedication?.(entry, !archived)}
            aria-label={`${archived ? "Unarchive" : "Archive"} medication ${entry.name || index + 1}`}
            sx={actionButtonSx}
          >
            <ArchiveOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    );
  };

  return (
    <Stack spacing={1.15} sx={{ width: "100%" }}>
      <Stack spacing={0.25}>
        {hasActiveMedications ? (
          activeMedications.map((entry, index) => renderMedicationRow(entry, index, false))
        ) : (
          <Box
            sx={{
              p: { xs: 1.4, sm: 1.75 },
              borderRadius: 2.5,
              border: "1px dashed rgba(217, 209, 238, 0.82)",
              bgcolor: "rgba(244, 241, 248, 0.34)",
            }}
          >
            <Typography sx={{ fontWeight: 800, color: colors.brand.navy, lineHeight: 1.15 }}>
              No medications added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.3 }}>
              Add the current medications first. You can log doses from the medication screen later.
            </Typography>
          </Box>
        )}
      </Stack>

      <Button
        onClick={() => onAddMedication?.()}
        variant="text"
        startIcon={<AddRoundedIcon />}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 1,
          color: colors.brand.deep,
          bgcolor: "transparent",
          px: 0.5,
          py: 0.6,
          minHeight: 36,
          "&:hover": {
            bgcolor: "rgba(244, 241, 248, 0.55)",
          },
        }}
      >
        Add medication
      </Button>

      {showEditor ? (
        <Stack spacing={1}>
          <MedicationDetailCard
            entry={draft}
            index={0}
            onChange={onDraftChange}
            onRemove={onClearDraft}
            onSave={onSaveDraft}
            title={isEditing ? "Edit medication" : ""}
            subtitle=""
          />
        </Stack>
      ) : null}

      {archivedMedications.length > 0 ? (
        <Stack spacing={0.45}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: colors.brand.deep,
              letterSpacing: "0.01em",
            }}
          >
            Archived medications
          </Typography>
          <Stack spacing={0}>
            {archivedMedications.map((entry, index) => renderMedicationRow(entry, index, true))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ChildMedicationManager;
