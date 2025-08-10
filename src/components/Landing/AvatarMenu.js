import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase signOut

const AvatarMenu = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth(); // Firebase auth instance
  const theme = useTheme();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleGoToProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase signOut
      console.log("User logged out successfully");
      handleMenuClose();
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <Avatar
          alt={user.displayName || "User"}
          src={user.photoURL || undefined}
          sx={{
            bgcolor: theme.palette.grey[700],
            color: theme.palette.getContrastText(theme.palette.grey[700]),
          }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleGoToProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
