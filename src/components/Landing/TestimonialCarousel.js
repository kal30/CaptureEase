import React from 'react';
import Slider from 'react-slick';
import { Box, Typography, Card, CardContent, Container, Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    quote: "This app has been a lifesaver for our family. It's so much easier to keep track of everything in one place.",
    author: "Priya",
    role: "Parent",
    image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Priya" // Replace with actual image path
  },
  {
    quote: "As a therapist, I've seen how much this tool can help families. The ability to share information seamlessly is invaluable.",
    author: "Rakesh",
    role: "Therapist",
    image: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Rakesh" // Replace with actual image path
  },
  {
    quote: "I love how easy it is to use. I can quickly log a behavior or a mood, and I know that information will be there when I need it.",
    author: "Sarah Jones",
    role: "Caregiver",
    image: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Sarah" // Replace with actual image path
  },
  {
    quote: "The best part is the peace of mind it gives me. I know I'm not forgetting anything important.",
    author: "Emily White",
    role: "Parent",
    image: "https://via.placeholder.com/150/FFFF00/000000?text=Emily" // Replace with actual image path
  },
  {
    quote: "A must-have for any caregiver. It simplifies so many aspects of daily life.",
    author: "Michael Brown",
    role: "Caregiver",
    image: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Michael" // Replace with actual image path
  },
];

const TestimonialCarousel = () => {
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
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold', color: 'primary.main' }}>
          What Our Users Say
        </Typography>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <Box key={index} sx={{ px: 3 }}>
              <Card elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '0 10px' }}>
                <CardContent>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Rating name="read-only" value={5} readOnly emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                  </Box>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', flexGrow: 1 }}>
                    "{testimonial.quote}"
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 3, fontWeight: 'bold' }}>
                    - {testimonial.author}, {testimonial.role}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
};

export default TestimonialCarousel;