import React from "react";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import image1 from "../../assets/image/landing/DashboardSlideShow/LongProse.png";
import image2 from "../../assets/image/landing/DashboardSlideShow/Dashboard.png";
import image3 from "../../assets/image/landing/DashboardSlideShow/QuickCheckIn.png";

const defaultItems = [
  { src: image1, alt: "Daily Journal", caption: "Daily Journal" },
  { src: image2, alt: "Sensory Log", caption: "Sensory Log" },
  { src: image3, alt: "Caregiver Sharing", caption: "Caregiver Sharing" },
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
        // bgcolor: "grey.100",
        maxWidth: "fit-content",
        mx: "auto",
        borderRadius: 2,
        px: 2,
      }}
    >
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        See CaptureEz in Action
      </Typography>
      <Slider {...settings}>
        {(items || defaultItems).map(({ src, alt, caption }, index) => (
          <Box key={index} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 480,
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
            </Box>
            <Typography variant="subtitle1">{caption}</Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default AppScreenshots;
