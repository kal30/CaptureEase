import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import image1 from "../image/landingImage1.webp";
import image2 from "../image/landingImage2.webp";
import image3 from "../image/landingImage3.webp";
import image4 from "../image/landingImage4.webp";
import image5 from "../image/landingImage5.webp";

const LandingPage = () => {
  return (
    <>
      {/* Top section with beige background and rounded bottom corners */}
      <Box
        sx={{
          backgroundColor: "background.default", // Use background color from the theme
          minHeight: "60vh",
          //borderRadius: "70px 10px 50px 90px", // Asymmetric border radii for a fun, organic shape
          boxShadow:
            "0px 10px 20px rgba(0, 0, 0, 0.2), 0px 5px 15px rgba(0, 0, 0, 0.1)", // Funky multi-layer shadow
          position: "relative", // Required for the pseudo-elements
          pt: 10,
          pb: 10,
          overflow: "hidden", // Ensures content stays within borders if they are curved
          clipPath: "polygon(0 0, 100% 10%, 100% 100%, 0% 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", position: "relative", pt: 10 }}>
            {/* Left Side - Text */}
            <Box sx={{ width: "50%", pr: 2 }}>
              <Typography
                variant="h1"
                sx={{ color: "primary.main" }} // Use the primary color from the theme
              >
                Caregiving, simplified for{" "}
                <span style={{ color: "#1673bc" }}>caregivers</span>
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 4, color: "text.primary" }} // Use secondary text color from theme
              >
                Empower caregivers with tools to track, manage, and support
                loved ones with ease. Capture moments, behaviors, and
                insights—all in one place, whenever it’s needed.
              </Typography>

              <Box sx={{ mt: 5 }}>
                <Button
                  variant="contained"
                  color="primary" // Use the primary button from the theme
                  size="large"
                >
                  Join now
                </Button>
                <Button
                  variant="outlined"
                  color="secondary" // Use the secondary button from the theme
                  size="large"
                  sx={{ ml: 2 }}
                >
                  Login
                </Button>
              </Box>
            </Box>

            {/* Right Side - Images */}
            <Box sx={{ width: "50%", position: "relative" }}>
              {/* Image 2 */}
              <Box sx={{ position: "absolute", top: "90px", right: "300px" }}>
                <img
                  src={image2}
                  alt="Person 2"
                  style={{ width: "200px", borderRadius: "50%" }}
                />
              </Box>

              {/* Image 3 */}
              <Box sx={{ position: "absolute", top: "300px", right: "220px" }}>
                <img
                  src={image3}
                  alt="Person 3"
                  style={{ width: "180px", borderRadius: "20%" }}
                />
              </Box>

              {/* Image 4 */}
              <Box sx={{ position: "absolute", top: "220px", right: "50px" }}>
                <img
                  src={image4}
                  alt="Person 4"
                  style={{ width: "170px", borderRadius: "10%" }}
                />
              </Box>

              {/* Image 5 */}
              <Box sx={{ position: "absolute", right: "100px" }}>
                <img
                  src={image5}
                  alt="Person 5"
                  style={{ width: "200px", borderRadius: "10%" }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Bottom section with white background */}
      <Box
        sx={{ backgroundColor: "background.paper", minHeight: "50vh", pt: 5 }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ color: "text.primary" }} // Use primary text color from theme
          >
            More Details
          </Typography>

          <Typography
            variant="body1"
            sx={{ mt: 3, color: "text.primary" }} // Use secondary text color from theme
          >
            Here you can add more content or additional sections for your
            landing page. This section is set against a clean white background
            to contrast with the top.
          </Typography>

          <Box sx={{ mt: 5 }}>
            <Button
              variant="contained"
              color="primary" // Use primary button color from the theme
              size="large"
            >
              Learn More
            </Button>
            <Button
              variant="outlined"
              color="secondary" // Use secondary button color from the theme
              size="large"
              sx={{ ml: 2 }}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
