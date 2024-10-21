import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import SensoryInputForm from "../components/SensoryLog/SensoryInputForm"; // Import the refactored component
import { useParams } from "react-router-dom";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import SensoryInput from "../components/SensoryLog/SensoryInput";

const SensoryPage = () => {
  const { childId } = useParams();
  const { childName, loading, error } = useChildName(childId); // Use the custom hook

  if (loading) return <p>Loading...</p>; // Show a loading state if needed
  if (error) return <p>Error: {error.message}</p>; // Handle any error state

  return (
    <div>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#333",
          fontWeight: "bold",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Sensory Input Log for {childName}
      </Typography>
      {/* Use the fetched child name */}
      {/* <SensoryInput childId={childId} /> */}
      <SensoryInputForm childId={childId} />
    </div>
  );
};
export default SensoryPage;
