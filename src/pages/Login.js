import React from "react";
import GoogleAuth from "../components/AuthProviders/GoogleAuth"; // Import the reusable component

const Login = () => {
  return (
    <GoogleAuth
      buttonText="Sign in with Google" // Custom button text for login
    />
  );
};

export default Login;
