import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import image1 from "../../assets/image/landing/LandingPageRealistic1.jpg";
import { PRODUCT_NAME } from "../../constants/config";

const ExpertProgram = () => {
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "background.default",
        px: { xs: 2, md: 5 },
        pt: { xs: 1, md: 3 },
        pb: { xs: 8, md: 10 },
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: { xs: "10%", md: "-5%" },
          right: { xs: "-10%", md: "-4%" },
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg width='500' height='500' viewBox='0 0 500 500' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill='%23F4DECB' fill-opacity='0.15' d='M421.5 322.5Q380 405 292 428Q204 451 168.5 374.5Q133 298 106 241.5Q79 185 140 124Q201 63 272.5 98Q344 133 398 171Q452 209 421.5 322.5Z'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#F8EEE7", // soft shell tone for warmth
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "relative",
          p: { xs: 3, md: 5 },
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 3, md: 6 },
          borderLeft: "6px solid #49274A",
        }}
      >
        {/* Left Side: Text */}
        <Box
          sx={{
            flex: 1,
            pr: { md: 5 },
            marginBottom: { xs: 4, md: 0 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              lineHeight: 1.2,
              mb: "20px",
              color: "text.primary",
              fontSize: { xs: "2rem", md: "2.75rem" },
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Real-World Results with Personalized Digital Care
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          >
            Healthcare professionals and families report that digital care tools
            improve coordination; a 2022 AMA survey found <strong>78%</strong>{" "}
            of clinicians saw better care outcomes.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          >
            Multimedia logging (voice, photo, video) improves communication
            between caregivers, families, and clinicians. Research in JMIR
            reports up to a <strong>65%</strong> improvement in care
            effectiveness.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "12px",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          >
            Reducing administrative burden by <strong>20%+</strong> improves
            both care quality and caregiver well-being, according to a 2023 WHO
            report.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "10px",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          >
            Tools like <strong>{PRODUCT_NAME}</strong> can help achieve these
            benefits by making it easy to log, share, and review important
            updates in one place—streamlining communication and improving care
            coordination.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "primary.main",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              px: 3,
              py: 1.25,
              borderRadius: 1.5,
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            See How CaptureEase Works
          </Button>
        </Box>

        {/* Right Side: Image and Tags */}

        <Box sx={{ flex: 1, position: "relative", zIndex: 1 }}>
          <Avatar
            alt="Therapist"
            src={image1} // Replace with your image path
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              maxHeight: 420,
              objectFit: "cover",
            }}
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
    </Box>
  );
};

export default ExpertProgram;
