import React from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const ChildCardDetails = ({
  expanded,
  teamMembers,
  userRole,
  onInviteTeamMember,
  handleUnassign,
  allActions,
  child,
}) => {
  console.log('ChildCardDetails rendered for', child?.name, 'with userRole:', userRole);
  
  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Box sx={{ px: 3, pb: 3 }}>
        <Divider sx={{ mb: 2 }} />

        {/* Team Members */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
            }}
          >
            Care Team
          </Typography>
          {teamMembers.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
              {teamMembers.map((member) => (
                <Chip
                  key={member.id}
                  label={member.name}
                  size="small"
                  icon={<GroupIcon fontSize="small" />}
                  onDelete={() => handleUnassign(member)}
                  sx={{
                    bgcolor: alpha("#5B8C51", 0.08),
                    color: "#2F5E27",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "text.disabled", mb: 2 }}
            >
              No team members yet
            </Typography>
          )}
          {(userRole === "primary_parent" || userRole === "co_parent") && (
            <Button
              size="small"
              variant="text"
              startIcon={<PersonAddAlt1Icon />}
              onClick={(e) => {
                e.stopPropagation();
                onInviteTeamMember(child);
              }}
              sx={{
                backgroundColor: "background.paper",
                color: "info.main",
                borderColor: "info.main",
                fontSize: "0.8rem",
                "&:hover": {
                  backgroundColor: alpha("#5B8C51", 0.05),
                  borderColor: "info.main",
                },
              }}
            >
              Add Team Member
            </Button>
          )}
        </Box>

        {/* All Actions */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              mb: 2,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
            }}
          >
            Quick Actions
          </Typography>
          <List dense sx={{ p: 0 }}>
            {allActions.map((action, index) => (
              <ListItem
                key={index}
                button
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  px: 2,
                  py: 1,
                  "&:hover": {
                    bgcolor: alpha("#5B8C51", 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {React.cloneElement(action.icon, {
                    sx: { color: action.color || "#5B8C51", fontSize: 20 },
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                    color: "text.primary",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Collapse>
  );
};

export default ChildCardDetails;
