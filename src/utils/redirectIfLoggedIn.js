import { getAuth } from "firebase/auth";

export const redirectIfLoggedIn = (navigate) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    navigate("/dashboard"); // Redirect to dashboard if logged in
  }
};
