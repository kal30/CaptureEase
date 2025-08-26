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
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      {/* Large Role Title */}
      <Box 
        style={{
          backgroundColor: userRole === "therapist" 
            ? "#1976D2" 
            : userRole === "caregiver" 
            ? "#FF6F00" 
            : "#2E7D32",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold"
        }}
      >
        {userRole === "therapist" ? "🩺 THERAPIST VIEWING" : userRole === "caregiver" ? "🤗 CAREGIVER VIEWING" : "👑 PARENT VIEWING"}
      </Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {/* Avatar */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={child.photoURL || `https://i.pravatar.cc/150?u=${child.id}`}
            alt={child.name}
            sx={{
              width: { xs: 80, md: 96 },
              height: { xs: 80, md: 96 },
              bgcolor: userRole === "therapist"
                ? "#1976D2 !important"
                : userRole === "caregiver"
                ? "#F57C00 !important"
                : "#388E3C !important",
              fontSize: { xs: "1.75rem", md: "2rem" },
              fontWeight: 700,
              color: "#FFFFFF",
              border: userRole === "therapist"
                ? "6px solid #2196F3 !important"
                : userRole === "caregiver"
                ? "6px solid #FF9800 !important"
                : "6px solid #4CAF50 !important",
              boxShadow: userRole === "therapist"
                ? "0 6px 20px rgba(21,101,192,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                : userRole === "caregiver"
                ? "0 4px 12px rgba(255,152,0,0.3)"
                : "0 6px 20px rgba(46,125,50,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              position: "relative",
              "&:after": userRole === "therapist" || (userRole === "parent" || userRole === "primary_parent" || userRole === "co_parent") ? {
                content: userRole === "therapist" ? '"🩺"' : '"👑"',
                position: "absolute",
                bottom: -4,
                right: -4,
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: userRole === "therapist" ? "#E3F2FD" : "#E8F5E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                border: userRole === "therapist" ? "2px solid #1565C0" : "2px solid #2E7D32",
              } : {},
            }}
          >
            {!child.photoURL && child.name.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

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
              variant="h4"
              sx={{
                color: userRole === "therapist"
                  ? "#0D47A1"
                  : userRole === "caregiver"
                  ? "#E65100"
                  : "#1B5E20",
                fontWeight: userRole === "therapist" ? 600 : 700,
                fontSize: { xs: "1.5rem", md: "1.75rem" },
                lineHeight: 1.2,
                fontFamily: userRole === "therapist" 
                  ? '"Roboto Slab", serif' 
                  : userRole === "parent" || userRole === "primary_parent" || userRole === "co_parent"
                  ? '"Inter", sans-serif'
                  : 'inherit',
                textShadow: userRole === "therapist"
                  ? "0 1px 2px rgba(13,71,161,0.1)"
                  : userRole === "parent" || userRole === "primary_parent" || userRole === "co_parent"
                  ? "0 1px 2px rgba(27,94,32,0.1)"
                  : "none",
              }}
            >
              {userRole === "therapist" && "Dr. "}{child.name}
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
            variant="body1"
            sx={{ 
              color: "text.secondary", 
              mb: 1.5, 
              fontWeight: 500,
              fontSize: { xs: "1rem", md: "1.1rem" }
            }}
          >
            {userRole === "therapist" 
              ? `Age: ${child.age} • Last Session: ${child.lastSession || 'Not scheduled'}`
              : userRole === "caregiver"
              ? `Age: ${child.age} • Care Since: ${child.careStartDate || 'N/A'}`
              : `Age: ${child.age} • DOB: ${child.dateOfBirth || 'N/A'}`
            }
          </Typography>

          {/* Role-specific information */}
          <Box sx={{ mb: 2 }}>
            {/* Role indicator */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label={userRole === "therapist" ? "🩺 CLINICAL THERAPIST" : userRole === "caregiver" ? "🤗 CAREGIVER" : "👨‍👩‍👧‍👦 PRIMARY GUARDIAN"}
                size="medium"
                style={{
                  backgroundColor: userRole === "therapist" 
                    ? "#2196F3"
                    : userRole === "caregiver"
                    ? "#FF9800"
                    : "#4CAF50",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "16px",
                  borderRadius: userRole === "therapist" ? "4px" : "8px",
                  padding: "12px 16px",
                  height: 'auto',
                  border: userRole === "therapist" 
                    ? "3px solid #0D47A1"
                    : userRole === "parent" || userRole === "primary_parent" || userRole === "co_parent"
                    ? "3px solid #1B5E20"
                    : "3px solid #E65100",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              />
            </Box>
            
            {/* Concerns/Diagnosis */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {concernLabels.length > 0 ? (
                <>
                  {concernLabels.slice(0, userRole === "therapist" ? 4 : 3).map((concern, index) => (
                    <Chip
                      key={index}
                      label={concern}
                      size="small"
                      sx={{
                        bgcolor: userRole === "therapist" 
                          ? "#BBDEFB"
                          : userRole === "caregiver"
                          ? "#FFCC02"
                          : "#C8E6C9",
                        color: userRole === "therapist" 
                          ? "#0D47A1"
                          : userRole === "caregiver"
                          ? "#BF360C"
                          : "#1B5E20",
                        fontWeight: 600,
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                        borderRadius: 2,
                      }}
                    />
                  ))}
                  {concernLabels.length > (userRole === "therapist" ? 4 : 3) && (
                    <Chip
                      label={`+${concernLabels.length - (userRole === "therapist" ? 4 : 3)} more`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: userRole === "therapist" 
                          ? "#2196F3"
                          : userRole === "caregiver"
                          ? "#FF9800"
                          : "#4CAF50",
                        borderWidth: 2,
                        color: "text.secondary",
                        fontSize: { xs: "0.8rem", md: "0.85rem" },
                        fontWeight: 500
                      }}
                    />
                  )}
                </>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ 
                    color: "text.disabled", 
                    fontStyle: "italic",
                    fontSize: { xs: "0.95rem", md: "1rem" }
                  }}
                >
                  {userRole === "therapist" ? "No treatment goals set" : "No diagnosis set"}
                </Typography>
              )}
              {(userRole === "parent" || userRole === "primary_parent" || userRole === "co_parent") && (
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
                    px: 2,
                    py: 1,
                    fontSize: { xs: "0.85rem", md: "0.9rem" },
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: "#E8F5E8",
                    color: "#1B5E20",
                    border: "2px solid #4CAF50",
                    "&:hover": {
                      backgroundColor: "#C8E6C9",
                      transform: "scale(1.05)"
                    },
                    transition: "all 0.2s ease"
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
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    border: "2px solid",
                    bgcolor: action.color === "info" 
                      ? "#E3F2FD"
                      : action.color === "success"
                      ? "#E8F5E8"
                      : action.color === "warning"
                      ? "#FFF3E0"
                      : action.color === "secondary"
                      ? "#F3E5F5"
                      : "#E8F5E8",
                    borderColor: action.color === "info" 
                      ? "#0D47A1"
                      : action.color === "success"
                      ? "#1B5E20"
                      : action.color === "warning"
                      ? "#E65100"
                      : action.color === "secondary"
                      ? "#4A148C"
                      : "#1B5E20",
                    color: action.color === "info" 
                      ? "#0D47A1"
                      : action.color === "success"
                      ? "#1B5E20"
                      : action.color === "warning"
                      ? "#E65100"
                      : action.color === "secondary"
                      ? "#4A148C"
                      : "#1B5E20",
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "1.5rem", md: "1.75rem" }
                    },
                    "&:hover": {
                      transform: "scale(1.1)",
                      bgcolor: action.color === "info" 
                        ? "#BBDEFB"
                        : action.color === "success"
                        ? "#C8E6C9"
                        : action.color === "warning"
                        ? "#FFCC02"
                        : action.color === "secondary"
                        ? "#E1BEE7"
                        : "#C8E6C9",
                      boxShadow: action.color === "info" 
                        ? "0 4px 12px rgba(33,150,243,0.3)"
                        : action.color === "success"
                        ? "0 4px 12px rgba(76,175,80,0.3)"
                        : action.color === "warning"
                        ? "0 4px 12px rgba(255,152,0,0.3)"
                        : action.color === "secondary"
                        ? "0 4px 12px rgba(156,39,176,0.3)"
                        : "0 4px 12px rgba(76,175,80,0.3)",
                    },
                    transition: "all 0.2s ease"
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
