import React from "react";
import { PersonAdd as PersonAddIcon, Add as AddIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import PageHeader from "../UI/PageHeader";
import GradientButton from "../UI/GradientButton";

/**
 * The specific header for the main dashboard.
 * It uses the generic PageHeader and provides dashboard-specific titles and actions.
 */
const DashboardHeader = ({
  user,
  children,
  isReadOnlyForChild,
  getUserRoleForChild,
  USER_ROLES,
  onInviteClick,
  onAddChildClick,
}) => {
  // Notification badges moved to individual child cards for better UX

  const title = `${user?.displayName || user?.email?.split("@")[0] || "Your"} Dashboard`;

  const subtitle = `Welcome back, ${user?.displayName || user?.email?.split("@")[0] || "there"}. Here's what's happening today.`;

  // IRON-CLAD: Only Care Owners can invite
  const canInvite = children?.some((child) => {
    const userRole = getUserRoleForChild?.(child.id);
    return userRole === USER_ROLES.CARE_OWNER;
  });

  const actions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {canInvite && (
        <GradientButton
          variant="outlined"
          color="success"
          size="large"
          startIcon={<PersonAddIcon />}
          onClick={() => onInviteClick(null)}
          elevated
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          + Build Your Care Team
        </GradientButton>
      )}
      <GradientButton
        variant="gradient"
        size="large"
        startIcon={<AddIcon />}
        onClick={onAddChildClick}
        elevated
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        Add Child
      </GradientButton>
    </Box>
  );

  return <PageHeader title={title} subtitle={subtitle} actions={actions} />;
};

export default DashboardHeader;
