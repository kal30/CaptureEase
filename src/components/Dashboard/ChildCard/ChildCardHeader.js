import React from "react";
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

const ChildCardHeader = ({
  child,
  expanded,
  onAccordionChange,
  onEditChild,
  handleMenuOpen,
  quickActions,
  concernLabels,
  userRole,
}) => {
  const theme = useTheme();
  return (
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {/* Avatar */}
        <Avatar
          src={child.photoURL || `https://i.pravatar.cc/150?u=${child.id}`}
          alt={child.name}
          sx={{
            width: 64,
            height: 64,
            bgcolor: "primary.main",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#FFFFFF",
            border: "3px solid #FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {!child.photoURL && child.name.charAt(0).toUpperCase()}
        </Avatar>

        {/* Child Info */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                fontSize: "1.25rem",
                lineHeight: 1.2,
              }}
            >
              {child.name}
            </Typography>

            {/* More Options Menu */}
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: alpha("#000", 0.05) },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 1.5, fontWeight: 500 }}
          >
            Age: {child.age}
          </Typography>

          {/* Diagnosis */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {concernLabels.length > 0 ? (
                <>
                  {concernLabels.slice(0, 3).map((concern, index) => (
                    <Chip
                      key={index}
                      label={concern}
                      size="small"
                      sx={{
                        bgcolor: alpha("#5B8C51", 0.1),
                        color: "#2F5E27",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    />
                  ))}
                  {concernLabels.length > 3 && (
                    <Chip
                      label={`+${concernLabels.length - 3} more`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: alpha("#5B8C51", 0.3),
                        color: "text.secondary",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", fontStyle: "italic" }}
                >
                  No diagnosis set
                </Typography>
              )}
              {userRole === "parent" && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<SettingsIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditChild(child);
                  }}
                  sx={{
                    minWidth: 0,
                    px: 1,
                    py: 0.5,
                    fontSize: "0.7rem",
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: "info.main",
                    borderColor: "info.main",
                    "&:hover": {
                      backgroundColor: alpha("#5B8C51", 0.05),
                    },
                  }}
                >
                  Manage
                </Button>
              )}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {quickActions.map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                  sx={{
                    bgcolor: alpha(
                      "#5B8C51",
                      0.1
                    ),
                    color: action.color === "primary" ? "#2F5E27" : "#8B4513",
                    "&:hover": {
                      bgcolor: alpha(
                        "#5B8C51",
                        0.2
                      ),
                    },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Expand Icon */}
        <IconButton
          size="small"
          onClick={onAccordionChange}
          sx={{
            color: "text.secondary",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </CardContent>
  );
};

export default ChildCardHeader;
