import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useRole } from "../../contexts/RoleContext";
import EditChildModal from "../../components/Dashboard/EditChildModal";

const EditChildPage = () => {
  const { childId } = useParams();
  const location = useLocation();
  const { childrenWithAccess, getUserRoleForChild, loading } = useRole();

  const child = childrenWithAccess?.find((item) => item.id === childId) || null;
  const initialStep = Number(location.state?.initialStep) || 1;

  if (loading && !child) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && !child) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <EditChildModal
      child={child}
      userRole={child ? getUserRoleForChild?.(child.id) : null}
      initialStep={initialStep}
    />
  );
};

export default EditChildPage;
