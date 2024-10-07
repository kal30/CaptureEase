import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import image2 from "../../image/landingimageRealisitic4.jpg";

const HeaderSection = () => {
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "60vh",
        boxShadow:
          "0px 10px 20px rgba(0, 0, 0, 0.2), 0px 5px 15px rgba(0, 0, 0, 0.1)",
        position: "relative",
        pt: 10,
        pb: 10,
        clipPath: "polygon(0 0, 100% 0, 100% 90%, 0% 100%)", // Curved bottom
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: 2, md: 4 },
          }}
        >
          {/* Left Side - Text */}
          <Box sx={{ width: { xs: "100%", md: "50%" }, pr: 2 }}>
            <Typography
              variant="h1"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Caregiving, simplified for{" "}
              <span style={{ color: "#1673bc" }}>caregivers</span>
            </Typography>

            <Typography variant="h6" sx={{ mt: 4, color: "text.primary" }}>
              Empower caregivers with tools to track, manage, and support loved
              ones with ease. Capture moments, behaviors, and insights— all in
              one place, whenever it’s needed.
            </Typography>

            <Box sx={{ mt: 5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  backgroundColor: "#00CFFF", // Initial color
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#027a79", // Change color on hover
                  },
                  fontWeight: "bold",
                }}
              >
                Join now
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                sx={{ ml: 2 }}
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
            </Box>
          </Box>

          {/* Right Side - Image and Floating Circle */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Floating Circle Shape */}
            <Box
              sx={{
                position: "absolute",
                width: "300px", // Increase the size
                height: "300px",
                backgroundColor: "#B3E5FC",
                borderRadius: "50%",
                zIndex: -1,
                opacity: 0.6, // Slightly increase opacity for better visibility
                top: "30%",
                right: "-10%",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* Image 2 */}
            <img
              src={image2}
              alt="Caregiving Illustration"
              style={{
                position: "absolute", // Position the image absolutely
                bottom: "-170px", // Move it to the bottom of the circle
                width: "400px",
                height: "300px",
                borderRadius: "20px",
                objectFit: "cover",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Subtle shadow
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
