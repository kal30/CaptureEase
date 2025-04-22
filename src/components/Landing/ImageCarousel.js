import React from "react";
import Slider from "react-slick";
import image1 from "../../assets/image/landing/LandingPageRealistic1.jpg";
import image2 from "../../assets/image/landing/LandingPageRealistic2.jpg";
import image3 from "../../assets/image/landing/landingPageRalistic3.jpg";

const ImageCarousel = () => {
  const settings = {
    dots: true, // Show navigation dots
    infinite: true, // Infinite loop sliding
    speed: 500, // Animation speed in ms
    slidesToShow: 1, // Number of slides to show at once
    slidesToScroll: 1, // Number of slides to scroll on navigation
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Autoplay interval in ms
    arrows: true, // Enable navigation arrows
  };

  return (
    <Slider {...settings}>
      {/* Image 1 */}
      <div>
        <img
          src={image1}
          alt="Slide 1"
          style={{
            width: "100%",
            height: "400px", // Adjust height as needed
            objectFit: "cover",
            borderRadius: "10px", // Optional: Rounded corners
          }}
        />
      </div>

      {/* Image 2 */}
      <div>
        <img
          src={image2}
          alt="Slide 2"
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      </div>

      {/* Image 3 */}
      <div>
        <img
          src={image3}
          alt="Slide 3"
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      </div>
    </Slider>
  );
};

export default ImageCarousel;
