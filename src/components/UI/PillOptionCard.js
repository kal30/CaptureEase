// src/components/common/PillOptionCard.js
import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

/** Pull visual tokens from theme instead of hardcoding */
const PillCardRoot = styled(Card)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius * 2, // replaces 20
  border: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  backgroundColor: "#eeede7", // Light beige background for habit cards
  boxShadow: theme.shadows[2], // use theme shadow
  transition:
    "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const Content = styled(CardContent)(({ theme }) => ({
  height: 80, // smaller, but centralize here
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  paddingInline: theme.spacing(2), // left/right padding
  minWidth: 0, // allows truncation
}));

const IconBubble = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontSize: 20,
  lineHeight: 1,
  flexShrink: 0,
}));

const LabelCol = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 0,
});

export default function PillOptionCard({
  onClick,
  icon, // string (emoji) or ReactNode
  label,
  subtitle, // optional smaller line under label
  color, // base color for icon bubble and hover border
  isCustom, // boolean to indicate if this is a custom category
  rightSlot, // optional node rendered at far right (e.g., chevron)
  sx = {},
}) {
  return (
    <PillCardRoot 
      elevation={0} 
      sx={{ 
        position: "relative", 
        backgroundColor: isCustom ? ((theme) => alpha(color || theme.palette.primary.main, 0.05)) : undefined,
        border: isCustom ? `2px solid ${color}` : undefined,
        ...sx 
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: "100%", display: "flex" }}
      >
        <Content>
          <IconBubble
            sx={(theme) => ({
              backgroundColor: alpha(color ?? theme.palette.primary.main, 0.12),
              color: color ?? theme.palette.primary.main,
            })}
          >
            {icon}
          </IconBubble>

          <LabelCol>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.2px",
                fontSize: "0.95rem", // centralized token
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={label}
            >
              {label}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </LabelCol>

          {rightSlot && <Box sx={{ marginLeft: "auto" }}>{rightSlot}</Box>}
        </Content>
      </CardActionArea>
    </PillCardRoot>
  );
}
