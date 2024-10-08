import React from "react";
import GoogleAuth from "../components/Register/GoogleAuth"; // Import the reusable component

const Register = () => {
  return (
    <GoogleAuth
      buttonText="Register with Google" // Custom button text for register
    />
  );
};

export default Register;
