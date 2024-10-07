import React from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import image1 from "../../image/landingPageRalistic3.jpg";

const ExpertProgram = () => {
  return (
    <Box
      sx={{
        // backgroundColor: "#fcfb00",
        backgroundColor: "#fea004",
        minHeight: "60vh",
        boxShadow:
          "0px 10px 20px rgba(0, 0, 0, 0.2), 0px 5px 15px rgba(0, 0, 0, 0.1)",
        position: "relative",
        pt: 10,
        pb: 10,
        px: 5, // Padding on the sides
        overflow: "hidden",
        clipPath: "polygon(0 0, 100% 10%, 100% 100%, 0% 100%)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on small screens, side-by-side on larger screens
        alignItems: "center",
        justifyContent: "space-between",
        marginRight: "3%",
        marginLeft: "3%",
        mt: "-20px",
      }}
    >
      {/* Left Side: Text */}
      <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
        {" "}
        {/* Adjust margin for mobile responsiveness */}
        <Typography variant="h4" gutterBottom>
          Expert-Designed Solutions for Enhanced Autism Care
        </Typography>
        <Typography variant="body1" gutterBottom>
          Autism Spectrum Disorder (ASD) affects each individual uniquely,
          requiring personalized care. Early intervention can reduce lifetime
          costs by up to two-thirds, but gathering complete data from parents
          remains a challenge. CaptureEase Technologies simplifies this process.
          Parents can easily log data via text or voice, which is combined with
          video and biometric inputs to give behavior analysts a full view of
          the child’s progress. This modular system reduces the burden on
          parents while improving treatment outcomes and lowering costs.
        </Typography>
      </Box>

      {/* Right Side: Image and Tags */}
      <Box sx={{ flex: 1, position: "relative" }}>
        <Avatar
          alt="Therapist"
          src={image1} // Replace with your image path
          sx={{ width: "100%", height: "auto", borderRadius: 2 }}
        />
      </Box>

      {/* Bottom right name */}
      {/* <Typography
        variant="Personalized Programs"
        color="textSecondary"
        align="right"
        sx={{ position: "absolute", bottom: "10px", right: "10px" }}
      >
        Kaela, LMFT
      </Typography> */}
    </Box>
  );
};

export default ExpertProgram;
