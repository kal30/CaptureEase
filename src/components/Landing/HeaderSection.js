import React from "react";
import { Box, Container, Typography, useTheme, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import image2 from "../../assets/image/landing/landingimageRealisitic4.jpg";
import { PRODUCT_NAME } from "../../constants/config";

const HeaderSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    try {
      const isLoggedIn =
        typeof window !== "undefined" &&
        (localStorage.getItem("ce_user") ||
          localStorage.getItem("authUser") ||
          localStorage.getItem("token"));
      if (isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (e) {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        position: "relative",
        pt: { xs: 6, md: 6 },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
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
                fontFamily: `"Montserrat", sans-serif`,
              }}
            >
              Simplifying Care for{" "}
              <Box
                component="span"
                sx={{
                  fontFamily: '"Dancing Script", cursive',
                  fontWeight: 600,
                  color: "success.main",
                }}
              >
                Caregivers
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 4,
                color: "text.primary",
                fontWeight: 300,
                lineHeight: 1.6,
                fontFamily: `"Poppins", sans-serif`,
              }}
            >
              Caring for someone shouldn’t mean juggling notebooks, sticky
              notes, and endless text threads. With{" "}
              <Box
                component="span"
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                {PRODUCT_NAME}
              </Box>
              , everything—updates, notes, and reminders—is organized in one
              place. No more frantic searching or relying on memory. Just clear,
              accessible information whenever you need it, so you can focus on
              caring, not scrambling.
            </Typography>

            <Box sx={{ mt: 5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.25)",
                  },
                  fontFamily: `"Poppins", sans-serif`,
                  fontWeight: 500,
                }}
                onClick={handleGetStarted}
              >
                Get Started
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
                width: { xs: 180, md: 260 },
                height: { xs: 180, md: 260 },
                backgroundColor: "secondary.main",
                borderRadius: "50%",
                zIndex: 0,
                opacity: 0.12,
                top: { xs: "-18%", md: "-22%" },
                right: { xs: "-12%", md: "-15%" },
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                pointerEvents: "none",
              }}
            />

            {/* Image */}
            <img
              src={image2}
              alt="Caregiving Illustration"
              style={{
                position: "absolute",
                bottom: window.innerWidth < 900 ? "-80px" : "-100px",
                width: window.innerWidth < 900 ? 280 : 400,
                height: window.innerWidth < 900 ? 210 : 300,
                borderRadius: "20px",
                objectFit: "cover",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                zIndex: 1,
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
