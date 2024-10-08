import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import image1 from "../../image/LandingPageRealistic1.jpg";

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
      <Box
        sx={{
          flex: 1,
          paddingRight: { md: 4 },
          marginBottom: { xs: 4, md: 0 },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", marginBottom: "20px", color: "#000" }}
        >
          Expert-Designed Solutions for Enhanced Autism Care
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: "10px", color: "#000" }}
        >
          <strong>Personalized, Data-Driven Support:</strong> Autism Spectrum
          Disorder (ASD) affects each individual uniquely, requiring
          personalized care. With early intervention, lifetime care costs can be
          reduced by up to two-thirds.
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: "10px", color: "#000" }}
        >
          <strong>Seamless Data Collection for Caregivers:</strong> CaptureEase
          simplifies data gathering, making it easy for parents to log
          information via text or voice. This comprehensive system includes
          video and biometric data to give behavior analysts a full picture of
          each child's progress.
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: "30px", color: "#000" }}
        >
          <strong>Relief for Parents, Better Outcomes for Children:</strong> By
          providing a modular system that reduces the burden on parents,
          CaptureEase ensures improved treatment outcomes while lowering
          long-term costs.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#027a79",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#025f5b",
            },
          }}
        >
          Learn More
        </Button>
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
