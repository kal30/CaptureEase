import React from "react";
import { Container, Grid, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import aboutImage from "../assets/image/imagesAbout/about.webp";

export default function About() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    try {
      const isLoggedIn = Boolean(
        typeof window !== "undefined" &&
          (localStorage.getItem("ce_user") ||
            localStorage.getItem("authUser") ||
            localStorage.getItem("token"))
      );
      navigate(isLoggedIn ? "/dashboard" : "/signup");
    } catch (e) {
      navigate("/signup");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          {/* Left: Text */}
          <Grid item xs={12} sm={7} md={7}>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Dancing Script", cursive',
                color: "success.main",
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem" },
                letterSpacing: "0.5px",
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              About Us
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.primary",
                lineHeight: 1.9,
                maxWidth: "62ch",
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 400,
                mb: 2,
              }}
            >
              At{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                CaptureEz
              </Box>
              , our mission is simple: make care communication effortless.
              Families and care teams should spend less time chasing updates and
              more time focused on well‑being.
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.primary",
                lineHeight: 1.9,
                maxWidth: "62ch",
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 400,
                mb: 2,
              }}
            >
              We started after seeing how easily important details get lost in
              texts, emails, or memory.{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                CaptureEz
              </Box>{" "}
              helps you quickly capture moments and share them securely so
              everyone stays in sync.
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.primary",
                lineHeight: 1.9,
                maxWidth: "62ch",
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 400,
                mb: 2,
              }}
            >
              While our journey is just beginning, our vision is big. We’re
              building with caregivers, educators, and health professionals to
              ensure the product solves real‑world problems and continues to
              evolve.
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 2,
                mb: 1,
                color: "success.main",
                fontWeight: 800,
                fontSize: { xs: "1.3rem", md: "1.4rem" },
                letterSpacing: 0.6,
                textTransform: "uppercase",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Our Vision
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.primary",
                lineHeight: 1.9,
                maxWidth: "62ch",
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 400,
                mb: 2,
              }}
            >
              Next, we aim to expand collaborations, add richer media logging,
              and bring more insights for care teams — all while keeping{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                CaptureEz
              </Box>{" "}
              simple and approachable.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  px: 4,
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.12)",
                  "&:hover": { boxShadow: "0px 6px 16px rgba(0,0,0,0.16)" },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Grid>

          {/* Right: Image */}
          <Grid
            item
            xs={12}
            sm={5}
            md={5}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box
              component="img"
              src={aboutImage}
              alt="Caregiving Illustration"
              sx={{
                width: "100%",
                maxWidth: { xs: 440, sm: 500, md: 600 },
                height: "auto",
                mt: 0,
                ml: { xs: 0, md: 4 },
                borderRadius: 3,
                objectFit: "cover",
                boxShadow: "0px 10px 24px rgba(0,0,0,0.12)",
                alignSelf: "center",
                display: "block",
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
