import React, { useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import colors from "../../../assets/theme/colors";

const ChildProfileFlowPageShell = ({
  title,
  stepLabel,
  progress = 0,
  activeStep = 1,
  onStepChange,
  stepItems = [
    { step: 1, label: "Basics" },
    { step: 2, label: "Health" },
    { step: 3, label: "Meds" },
    { step: 4, label: "Behavior" },
    { step: 5, label: "Review" },
  ],
  onBack,
  onClose,
  showClose = false,
  children,
  footer = null,
}) => {
  const stepButtonRefs = useRef({});
  const highlightedStep = Math.min(Math.max(activeStep || 1, 1), stepItems.length || 4);

  useEffect(() => {
    const target = stepButtonRefs.current[highlightedStep];
    if (target?.scrollIntoView) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [highlightedStep]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: colors.landing.pageBackground,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.94)",
          color: colors.landing.heroText,
          backgroundImage: "none",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
          borderBottom: `1px solid ${colors.landing.borderSoft}`,
          pt: "env(safe-area-inset-top)",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: "calc(56px + env(safe-area-inset-top))",
            px: { xs: 1.25, sm: 2 },
            py: 0.5,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton
              onClick={onBack}
              aria-label="Go back"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.25,
                bgcolor: colors.landing.surfaceSoft,
                border: `1px solid ${colors.landing.borderLight}`,
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
                color: colors.landing.heroText,
                "&:hover": {
                  bgcolor: colors.landing.panelSoft,
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: colors.landing.heroText,
                }}
              >
                {title}
              </Typography>
              {stepLabel ? (
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    mt: 0.2,
                    fontWeight: 700,
                    color: colors.landing.midNavy,
                    fontSize: "0.8rem",
                  }}
                >
                  {stepLabel}
                </Typography>
              ) : null}
            </Box>

            {showClose ? (
              <IconButton
                onClick={onClose}
                aria-label="Close"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.25,
                  bgcolor: colors.landing.surfaceSoft,
                  border: `1px solid ${colors.landing.borderLight}`,
                  color: colors.landing.heroText,
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
              <Box sx={{ width: 40, height: 40 }} />
            )}
          </Box>
        </Toolbar>
        <Box sx={{ px: { xs: 1.25, sm: 2 }, pb: 1.25 }}>
          <LinearProgress
            variant="determinate"
            value={Math.max(0, Math.min(100, progress))}
            sx={{
              height: 5,
              borderRadius: 999,
              bgcolor: colors.landing.panelSoft,
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                bgcolor: colors.brand.navy,
              },
            }}
          />
        </Box>
      </AppBar>

      {stepItems.length ? (
        <Box
          sx={{
            position: "sticky",
            top: "calc(74px + env(safe-area-inset-top))",
            zIndex: 3,
            bgcolor: "rgba(248, 250, 252, 0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${colors.landing.borderSoft}`,
            px: { xs: 1.25, sm: 2 },
            py: 1,
          }}
        >
          <Box
            role="tablist"
            aria-label="Child profile sections"
            sx={{
              display: "flex",
              gap: 0.75,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollSnapType: "x proximity",
            }}
          >
            {stepItems.map((item) => {
              const isActive = highlightedStep === item.step;
              const isCompleted = highlightedStep > item.step;
              const isDisabled = Boolean(item.disabled);

              return (
                <Button
                  key={item.step}
                  ref={(node) => {
                    stepButtonRefs.current[item.step] = node;
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? "step" : undefined}
                  disabled={isDisabled}
                  onClick={() => onStepChange?.(item.step)}
                  variant="text"
                  disableElevation
                  sx={{
                    flex: "0 0 auto",
                    minWidth: { xs: 86, sm: 96 },
                    px: 1.1,
                    py: 0.9,
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: isActive
                      ? colors.brand.ink
                      : isCompleted
                        ? "rgba(29, 78, 216, 0.22)"
                        : isDisabled
                          ? "rgba(148, 163, 184, 0.38)"
                          : colors.landing.borderLight,
                    bgcolor: isActive
                      ? colors.brand.navy
                      : isCompleted
                        ? "rgba(59, 130, 246, 0.08)"
                        : isDisabled
                          ? "rgba(255,255,255,0.58)"
                          : colors.landing.surfaceSoft,
                    color: isActive
                      ? colors.landing.surface
                      : colors.brand.navy,
                    boxShadow: isActive
                      ? "0 6px 14px rgba(15, 23, 42, 0.12)"
                      : "0 2px 8px rgba(15, 23, 42, 0.04)",
                    opacity: isDisabled ? 0.6 : 1,
                    textTransform: "none",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    scrollSnapAlign: "center",
                    "&:hover": {
                      bgcolor: isActive
                        ? colors.brand.deep
                        : colors.landing.panelSoft,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.6,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: isActive
                          ? colors.landing.surface
                          : isCompleted
                            ? colors.brand.ink
                            : colors.landing.borderLight,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Box>
      ) : null}

      <Box
        component="main"
        sx={{
          flex: 1,
          px: { xs: 1.25, sm: 2.5, md: 3 },
          py: { xs: 1.75, sm: 2.5 },
          pb: footer
            ? {
                xs: "calc(88px + env(safe-area-inset-bottom))",
                sm: "calc(84px + env(safe-area-inset-bottom))",
              }
            : { xs: 3, sm: 4 },
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 960,
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>

      {footer ? (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.96)",
            borderTop: `1px solid ${colors.landing.borderSoft}`,
            boxShadow: "0 -10px 24px rgba(15, 23, 42, 0.05)",
            px: { xs: 1.25, sm: 2.5, md: 3 },
            pb: "calc(env(safe-area-inset-bottom) + 10px)",
            pt: 0.9,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 960, mx: "auto" }}>
            {footer}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default ChildProfileFlowPageShell;
