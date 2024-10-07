import React from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";

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
        marginRight: "20%",
        marginLeft: "20%",
      }}
    >
      {/* Left Side: Text */}
      <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
        {" "}
        {/* Adjust margin for mobile responsiveness */}
        <Typography variant="h4" gutterBottom>
          A proprietary program, built by expert therapists who understand
          students.
        </Typography>
        <Typography variant="body1" gutterBottom>
          All tbh groups are facilitated by licensed, culturally-competent
          therapists who have experience working with youth, adolescents, and
          college-aged students. Our proprietary program, rooted in the latest
          evidence-based therapeutic practices, provides students with a safe
          space to deal with life’s challenges.
        </Typography>
      </Box>

      {/* Right Side: Image and Tags */}
      <Box sx={{ flex: 1, position: "relative" }}>
        <Avatar
          alt="Therapist"
          src="/path_to_your_image" // Replace with your image path
          sx={{ width: "100%", height: "auto", borderRadius: 2 }}
        />

        {/* Tags positioned around the image */}
        <Chip
          label="BIPOC Experience"
          sx={{
            position: "absolute",
            top: "10%",
            left: "-10%",
            transform: "rotate(-5deg)",
            backgroundColor: "#000",
            color: "#fff",
          }}
        />
        <Chip
          label="Trauma & PTSD"
          sx={{
            position: "absolute",
            top: "5%",
            right: "0%",
            transform: "rotate(10deg)",
            backgroundColor: "#000",
            color: "#fff",
          }}
        />
        <Chip
          label="Life Transitions"
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "20%",
            transform: "rotate(-5deg)",
            backgroundColor: "#000",
            color: "#fff",
          }}
        />
        <Chip
          label="Women Empowerment"
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "-15%",
            transform: "rotate(0deg)",
            backgroundColor: "#000",
            color: "#fff",
          }}
        />
      </Box>

      {/* Bottom right name */}
      <Typography
        variant="subtitle2"
        color="textSecondary"
        align="right"
        sx={{ position: "absolute", bottom: "10px", right: "10px" }}
      >
        Kaela, LMFT
      </Typography>
    </Box>
  );
};

export default ExpertProgram;
