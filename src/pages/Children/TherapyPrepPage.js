import React, { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import { useChildContext } from "../../contexts/ChildContext";
import { useRole } from "../../contexts/RoleContext";
import useChildName from "../../hooks/useChildName";
import DailyCareReport from "../../components/Reports/DailyCareReport";

const TherapyPrepPage = () => {
  const { childId } = useParams();
  const { currentChildId, setCurrentChildId } = useChildContext();
  const { childrenWithAccess, loading: roleLoading } = useRole();
  const child = childrenWithAccess?.find((item) => item.id === childId) || null;
  const { childName, loading: childNameLoading, error } = useChildName(childId || currentChildId);

  useEffect(() => {
    if (childId && childId !== currentChildId) {
      setCurrentChildId(childId);
    }
  }, [childId, currentChildId, setCurrentChildId]);

  if (roleLoading && !child) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roleLoading && !child && childId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (childNameLoading) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DailyCareReport
      child={child}
      childId={childId || currentChildId}
      childName={childName || child?.name || "Therapy Prep"}
    />
  );
};

export default TherapyPrepPage;
