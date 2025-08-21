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
        pt: { xs: 5, md: 6, lg: 7 },
        pb: { xs: 4, md: 6, lg: 8 },
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            gap: { xs: 3, md: 4, lg: 5 },
            padding: { xs: 1, md: 2, lg: 3 },
          }}
        >
          {/* Left Side - Text */}
          <Box sx={{ width: { xs: "100%", md: "50%", lg: "45%" }, pr: { md: 2, lg: 4 } }}>
            <Typography
              variant="h1"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem", xl: "4rem" },
                fontFamily: `"Montserrat", sans-serif`,
                lineHeight: { xs: 1.2, md: 1.1, lg: 1.15 },
                mb: { xs: 2, md: 3, lg: 4 },
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
                mt: { xs: 3, md: 4, lg: 5 },
                color: "text.primary",
                fontWeight: 300,
                lineHeight: 1.6,
                fontFamily: `"Poppins", sans-serif`,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem", lg: "1.35rem", xl: "1.5rem" },
                maxWidth: { xs: "100%", md: "90%", lg: "85%" },
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

            <Box sx={{ mt: { xs: 4, md: 5, lg: 6 } }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  px: { xs: 4, md: 5, lg: 6 },
                  py: { xs: 1.5, md: 2, lg: 2.5 },
                  fontSize: { xs: "1rem", md: "1.1rem", lg: "1.25rem" },
                  borderRadius: { xs: "8px", md: "12px" },
                  textTransform: "none",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.25)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
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
              width: { xs: "100%", md: "50%", lg: "55%" },
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: { xs: 300, md: 400, lg: 500, xl: 600 },
              mt: { xs: 4, md: 0 },
            }}
          >
            {/* Floating Circle Shape */}
            <Box
              sx={{
                position: "absolute",
                width: { xs: 180, md: 260, lg: 320, xl: 380 },
                height: { xs: 180, md: 260, lg: 320, xl: 380 },
                backgroundColor: "secondary.main",
                borderRadius: "50%",
                zIndex: 0,
                opacity: 0.08,
                top: { xs: "-10%", md: "-15%", lg: "-12%" },
                right: { xs: "-8%", md: "-10%", lg: "-8%" },
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                pointerEvents: "none",
              }}
            />

            {/* Image */}
            <Box
              component="img"
              src={image2}
              alt="Caregiving Illustration"
              sx={{
                width: { xs: 280, md: 400, lg: 500, xl: 600 },
                height: { xs: 210, md: 300, lg: 375, xl: 450 },
                borderRadius: { xs: "16px", md: "20px", lg: "24px" },
                objectFit: "cover",
                boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 1,
                transform: { xs: "none", md: "translateY(-20px)", lg: "translateY(-30px)" },
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-25px)", lg: "translateY(-35px)" },
                },
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
