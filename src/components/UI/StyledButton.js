import React from "react";
import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme, alpha } from "@mui/material/styles";

/**
 * StyledButton - A standardized button component that follows the application's theme
 * and provides consistent styling across all pages.
 */
const StyledButton = ({
  children,
  variant = "contained",
  color = "primary",
  fullWidth = false,
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  type = "button",
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const baseStyles = {
    borderRadius: "14px",
    padding: "12px 24px",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none",
    transition: "background-color 120ms ease, transform 120ms ease",
    ...(variant === "contained" && {
      backgroundColor: theme.palette[color].main,
      color: theme.palette[color].contrastText || "#FFFFFF",
      "&:hover": {
        backgroundColor: theme.palette[color].dark,
      },
    }),
    ...(variant === "outlined" && {
      borderColor: theme.palette[color].main,
      color: theme.palette[color].main,
      "&:hover": {
        backgroundColor: alpha(theme.palette[color].main, 0.1),
        borderColor: theme.palette[color].main,
      },
    }),
    ...(variant === "text" && {
      color: theme.palette[color].main,
      "&:hover": {
        backgroundColor: alpha(theme.palette[color].main, 0.1),
      },
    }),
    "&.Mui-disabled": {
      opacity: 0.6,
    },
    ...sx,
  };

  return (
    <Button
      variant={variant}
      color={color}
      disabled={disabled}
      onClick={onClick}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      type={type}
      sx={baseStyles}
      {...props}
    >
      {children}
    </Button>
  );
};

StyledButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "error",
    "warning",
    "info",
    "success",
  ]),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  sx: PropTypes.object,
};

export default StyledButton;
