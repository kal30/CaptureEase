import React from "react";
import Slider from "react-slick";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Rating,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import StarIcon from "@mui/icons-material/Star";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    quote:
      "This app has been a lifesaver for our family. It's so much easier to keep track of everything in one place.",
    author: "Priya",
    role: "Parent",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Priya", // Replace with actual image path
  },
  {
    quote:
      "As a therapist, I've seen how much this tool can help families. The ability to share information seamlessly is invaluable.",
    author: "Rakesh",
    role: "Therapist",
    image: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Rakesh", // Replace with actual image path
  },
  {
    quote:
      "I love how easy it is to use. I can quickly log a behavior or a mood, and I know that information will be there when I need it.",
    author: "Sarah Jones",
    role: "Caregiver",
    image: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Sarah", // Replace with actual image path
  },
  {
    quote:
      "The best part is the peace of mind it gives me. I know I'm not forgetting anything important.",
    author: "Emily White",
    role: "Parent",
    image: "https://via.placeholder.com/150/FFFF00/000000?text=Emily", // Replace with actual image path
  },
  {
    quote:
      "A must-have for any caregiver. It simplifies so many aspects of daily life.",
    author: "Michael Brown",
    role: "Caregiver",
    image: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Michael", // Replace with actual image path
  },
];

const TestimonialCarousel = () => {
  const theme = useTheme();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
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
        position: "relative",
        pt: { xs: 0, md: 0 },
        pb: { xs: 10, md: 12 },
        bgcolor: "background.default",
        // slick styles (dots + arrows)
        "& .slick-dots li button:before": {
          color: (theme) => theme.palette.primary.main,
          opacity: 0.3,
        },
        "& .slick-dots li.slick-active button:before": {
          color: (theme) => theme.palette.primary.main,
          opacity: 0.9,
        },
        "& .slick-prev:before, & .slick-next:before": {
          color: (theme) => theme.palette.primary.main,
          opacity: 0.6,
          fontSize: "24px",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            backgroundColor: "rgba(245,227,86,0.08)",
            borderRadius: "16px",
            px: { xs: 4, md: 6 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 4, md: 6 },
            boxShadow: "none",
            mt: 0,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 1.5,
              fontWeight: 900,
              letterSpacing: "-0.2px",
              color: (theme) => theme.palette.success.main,
              position: "relative",
              zIndex: 1,
              fontSize: { xs: "1.6rem", md: "2rem" },
            }}
          >
            What Users Say
          </Typography>
          <Box
            sx={{
              width: 56,
              height: 4,
              borderRadius: 9999,
              mx: "auto",
              mb: 2.5,
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.5),
            }}
          />
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mb: 3,
              color: "text.secondary",
              maxWidth: 720,
              mx: "auto",
            }}
          >
            Real notes from parents, caregivers, and therapists using tools like
            ours to stay organized and in sync.
          </Typography>
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <Box key={index} sx={{ px: 3, position: "relative", zIndex: 1 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: "center",
                    borderRadius: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 2,
                    m: "0 10px",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 1.5,
                      }}
                    >
                      <Rating
                        name="read-only"
                        value={5}
                        readOnly
                        emptyIcon={
                          <StarIcon
                            style={{ opacity: 0.55 }}
                            fontSize="inherit"
                          />
                        }
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: "italic",
                        flexGrow: 1,
                        maxWidth: 520,
                        mx: "auto",
                        fontSize: "1.05rem",
                        lineHeight: 1.6,
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 3, fontWeight: "bold" }}
                    >
                      - {testimonial.author}, {testimonial.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialCarousel;
