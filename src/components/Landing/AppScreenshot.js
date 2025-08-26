import React from "react";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import image1 from "../../assets/image/landing/DashboardSlideShow/LongProse.png";
import image2 from "../../assets/image/landing/DashboardSlideShow/Dashboard.png";
import image3 from "../../assets/image/landing/DashboardSlideShow/QuickCheckIn.png";

const defaultItems = [
  { src: image1, alt: "Why CaptureEZ", caption: "Why CaptureEZ" },
  { src: image2, alt: "Dashboard", caption: "Dashboard" },
  { src: image3, alt: "Quick Data Capture", caption: "Quick Data Capture" },
];

const AppScreenshots = ({ items }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 1.5, md: 2 },
        mx: "auto",
        width: "100%",
        maxWidth: { xs: 300, sm: 360, md: 480, lg: 520 },
      }}
    >
      {/* <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 3,
          fontFamily: '"Dancing Script", cursive',
          fontWeight: 700,
          fontSize: { xs: "1.5rem", md: "2rem", lg: "2.25rem" },
          color: "#49274A",
        }}
      >
        See CaptureEz in Action
      </Typography> */}
      <Slider {...settings}>
        {(items || defaultItems).map(({ src, alt, caption }, index) => (
          <Box key={index} sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  bgcolor: "common.white",
                  borderRadius: 2,
                  p: { xs: 0.75, sm: 1 },
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* Aspect-ratio container to lock proportions (portrait 9:17) */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "9 / 17",
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={alt}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: 2,
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              {caption}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default AppScreenshots;
