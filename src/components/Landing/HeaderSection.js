import React, { useState } from "react";
import {
  Alert,
  Box,
  Container,
  Divider,
  TextField,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { saveFoundingFamilyEmail } from "../../services/foundingFamilyService";
import {
  landingLayout,
  landingTypography,
  landingColors,
} from "../../assets/theme/landingTheme";

const landingPrimaryButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 230 },
  px: { xs: 3.5, md: 4.5 },
  py: { xs: 1.35, md: 1.45 },
  textTransform: "none",
  borderRadius: "9999px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  color: landingColors.deepNavy,
  backgroundColor: landingColors.cyanPop,
  boxShadow: `0 10px 22px ${landingColors.shadowHero}`,
  border: `1px solid ${landingColors.cyanPop}`,
  "&:hover": {
    backgroundColor: "#9DD4CD",
    boxShadow: `0 12px 26px ${landingColors.shadowHeroStrong}`,
  },
};

const landingSecondaryButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 210 },
  px: { xs: 3.5, md: 4.5 },
  py: { xs: 1.35, md: 1.45 },
  textTransform: "none",
  borderRadius: "9999px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  color: landingColors.deepNavy,
  borderColor: landingColors.borderMedium,
  backgroundColor: landingColors.surface,
  boxShadow: `0 6px 16px ${landingColors.shadowSoft}`,
  "&:hover": {
    borderColor: landingColors.borderFocus,
    backgroundColor: landingColors.surfaceSoft,
    boxShadow: `0 8px 20px ${landingColors.shadowMedium}`,
  },
};

const landingFormButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  whiteSpace: "nowrap",
  minWidth: { sm: 180 },
  height: 48,
  minHeight: 48,
  px: 3,
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "1rem",
  color: landingColors.deepNavy,
  backgroundColor: landingColors.cyanPop,
  border: `1px solid ${landingColors.cyanPop}`,
  boxShadow: `0 8px 18px ${landingColors.shadowHero}`,
  "&:hover": {
    backgroundColor: "#9DD4CD",
    boxShadow: `0 10px 22px ${landingColors.shadowHeroStrong}`,
  },
};

const HeaderSection = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFoundingFamilySubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setSubmitError("Enter an email address first.");
      setSubmitSuccess("");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await saveFoundingFamilyEmail(trimmedEmail);
      setSubmitSuccess("Thanks. You’re on the founding family list.");
      setEmail("");
    } catch (e) {
      setSubmitSuccess("");
      setSubmitError("Could not save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tryLifelogPath = auth.currentUser ? "/dashboard" : "/register";

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        position: "relative",
        mt: 0,
        ...landingLayout.heroSection.padding,
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      <Container maxWidth="xl" sx={{ maxWidth: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 4, md: 5 },
            ...landingLayout.heroSection.container,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              maxWidth: 1020,
              width: "100%",
              textAlign: "center",
              mx: "auto",
              px: { xs: 0.5, md: 0 },
            }}
          >
            <Box sx={{ ...landingLayout.heroHeading, justifyContent: "center" }}>
              <Typography
                sx={{
                  ...landingTypography.heroMain,
                  color: landingColors.heroText,
                  maxWidth: 900,
                  mx: "auto",
                }}
              >
                From notes to insights
              </Typography>
            </Box>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: 840,
                mx: "auto",
                mt: 2,
                fontSize: { xs: "1.02rem", md: "1.22rem" },
                lineHeight: { xs: 1.55, md: 1.65 },
              }}
            >
              The whole care team logs notes, all neatly organized in one shared timeline.
            </Typography>

            <Box
              sx={{
                mt: { xs: 3, md: 3.5 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "center",
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", md: 540 },
                mx: "auto",
              }}
            >
              <Button
                component={RouterLink}
                to={tryLifelogPath}
                variant="contained"
                sx={landingPrimaryButtonStyles}
              >
                Start Tracking Free
              </Button>
              <Button
                component={RouterLink}
                to="/#how-it-works"
                variant="outlined"
                sx={landingSecondaryButtonStyles}
              >
                See How It Works
              </Button>
            </Box>

            <Box
              sx={{
                mt: { xs: 3.5, md: 4 },
                mx: "auto",
                width: "100%",
                maxWidth: 1180,
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: { xs: "28px", md: "34px" },
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(243,247,245,0.9) 100%)",
                  border: `1px solid ${landingColors.borderSoft}`,
                  boxShadow: `0 18px 42px ${landingColors.shadowMedium}`,
                  overflow: "hidden",
                }}
                elevation={0}
              >
                <Stack
                  spacing={{ xs: 2.5, md: 3 }}
                  sx={{
                    alignItems: "center",
                    textAlign: "center",
                    py: { xs: 1, md: 1.5 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8rem", md: "0.85rem" },
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: landingColors.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    From notes → insights
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.05rem", md: "1.15rem" },
                      color: landingColors.bodyText,
                      maxWidth: 900,
                    }}
                  >
                    Caregivers and parents log notes, all neatly organized in one shared timeline.
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
                      alignItems: "center",
                      gap: { xs: 2.5, md: 3.5 },
                      mt: { xs: 0.5, md: 1 },
                    }}
                  >
                    <Paper
                      sx={{
                        position: "relative",
                        minHeight: { xs: 320, md: 440 },
                        borderRadius: "30px",
                        border: `1px solid rgba(199, 217, 196, 0.82)`,
                        background:
                          "linear-gradient(180deg, rgba(239, 245, 241, 0.98) 0%, rgba(248, 250, 248, 0.98) 100%)",
                        overflow: "hidden",
                        p: { xs: 2.5, md: 3.5 },
                        boxShadow: `0 14px 28px ${landingColors.shadowSoft}`,
                      }}
                      elevation={0}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.82rem", md: "0.86rem" },
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: landingColors.textMuted,
                            fontWeight: 700,
                          }}
                        >
                          Care Team Note
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1.2rem",
                            color: landingColors.supportMuted,
                            lineHeight: 1,
                          }}
                        >
                          ✦
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          borderRadius: "24px",
                          backgroundColor: "rgba(255,255,255,0.8)",
                          border: `1px solid rgba(226, 232, 240, 0.9)`,
                          p: { xs: 2.25, md: 2.75 },
                          boxShadow: `0 10px 22px ${landingColors.shadowSoft}`,
                          transform: "rotate(-1.8deg)",
                          maxWidth: 470,
                          mx: "auto",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.95rem", md: "1rem" },
                            fontWeight: 700,
                            color: landingColors.deepNavy,
                            mb: 1.5,
                            textAlign: "left",
                          }}
                        >
                          From notes to clarity
                        </Typography>
                        <Box
                          sx={{
                            textAlign: "left",
                            color: landingColors.bodyText,
                            fontSize: { xs: "0.98rem", md: "1.03rem" },
                            lineHeight: 1.9,
                            fontFamily:
                              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            pr: 1,
                          }}
                        >
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • 9 am: Gave meds
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • Breakfast: Ate well
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • Slept 2 hrs
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit" }}>
                            • Mood: Happy
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 72,
                      }}
                    >
                      <Box
                        sx={{
                          width: 92,
                          height: 92,
                          borderRadius: "50%",
                          border: `1px solid rgba(143, 201, 192, 0.28)`,
                          background:
                            "radial-gradient(circle at 35% 35%, rgba(143, 201, 192, 0.28), transparent 52%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: landingColors.supportMuted,
                          fontSize: "2.25rem",
                          transform: "rotate(-10deg)",
                        }}
                      >
                        →
                      </Box>
                    </Box>

                    <Paper
                      sx={{
                        position: "relative",
                        minHeight: { xs: 360, md: 440 },
                        borderRadius: "34px",
                        border: `1px solid rgba(226, 232, 240, 0.95)`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(243,247,245,0.98) 100%)",
                        overflow: "hidden",
                        p: { xs: 1.5, md: 2 },
                        boxShadow: `0 16px 34px ${landingColors.shadowMedium}`,
                      }}
                      elevation={0}
                    >
                      <Box
                        sx={{
                          borderRadius: "30px",
                          overflow: "hidden",
                          minHeight: { xs: 330, md: 400 },
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(243,247,245,0.98) 100%)",
                          border: `1px solid rgba(199, 217, 196, 0.68)`,
                        }}
                      >
                        <Box
                          sx={{
                            height: 44,
                            background:
                              "linear-gradient(180deg, rgba(143, 201, 192, 0.72) 0%, rgba(199, 217, 196, 0.92) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: landingColors.deepNavy,
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          lifelog
                        </Box>
                        <Box sx={{ px: 2, py: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: landingColors.textMuted,
                              fontWeight: 700,
                              mb: 0.75,
                            }}
                          >
                            Timeline
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.35,
                            }}
                          >
                            {[
                              {
                                title: "Med: Given at breakfast",
                                tone: "rgba(234, 244, 242, 0.98)",
                                accent: landingColors.brandTeal,
                                meta: "Caregiver • 9:00",
                              },
                              {
                                title: "Sleep: 2h",
                                tone: "rgba(244, 241, 248, 0.98)",
                                accent: landingColors.brandLavender,
                                meta: "Parent • 12:30",
                              },
                              {
                                title: "Lunch: Ate well",
                                tone: "rgba(247, 251, 249, 0.98)",
                                accent: landingColors.brandSage,
                                meta: "Caregiver • 3:00",
                              },
                            ].map((item) => (
                              <Box
                                key={item.title}
                                sx={{
                                  borderRadius: "18px",
                                  backgroundColor: item.tone,
                                  border: `1px solid rgba(226, 232, 240, 0.92)`,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    height: 6,
                                    backgroundColor: item.accent,
                                  }}
                                />
                                <Box sx={{ px: 1.75, py: 1.55 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: 2,
                                      mb: 0.65,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "0.82rem",
                                        fontWeight: 700,
                                        color: landingColors.textMuted,
                                      }}
                                    >
                                      {item.meta}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.9rem",
                                        color: landingColors.textMuted,
                                      }}
                                    >
                                      ◔
                                    </Typography>
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: 700,
                                      color: landingColors.deepNavy,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>

                  <Box
                    sx={{
                      mt: { xs: 0.5, md: 1 },
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "22px",
                        border: `1px solid rgba(199, 217, 196, 0.7)`,
                        backgroundColor: "rgba(247, 251, 249, 0.95)",
                        px: 2,
                        py: 1.5,
                        textAlign: "left",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.9rem", md: "0.95rem" },
                          fontWeight: 700,
                          color: landingColors.deepNavy,
                          mb: 0.35,
                        }}
                      >
                        Replace with screenshots later
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.86rem", md: "0.93rem" },
                          lineHeight: 1.6,
                          color: landingColors.textMuted,
                        }}
                      >
                        Keep this hero concept now. We can swap in real app screenshots once they are ready.
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        borderRadius: "22px",
                        border: `1px solid rgba(217, 209, 238, 0.74)`,
                        backgroundColor: "rgba(244, 241, 248, 0.88)",
                        px: 2,
                        py: 1.5,
                        textAlign: "left",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.9rem", md: "0.95rem" },
                          fontWeight: 700,
                          color: landingColors.deepNavy,
                          mb: 0.35,
                        }}
                      >
                        Shared timeline
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.86rem", md: "0.93rem" },
                          lineHeight: 1.6,
                          color: landingColors.textMuted,
                        }}
                      >
                        One calm view for caregivers, parents, and therapists to understand the day together.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            <Box
              component="form"
              onSubmit={handleFoundingFamilySubmit}
              sx={{
                mt: { xs: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
                maxWidth: { xs: "100%", md: 420 },
                mx: { xs: "auto", md: 0 },
              }}
            >
              {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <Divider
                sx={{
                  width: "100%",
                  color: landingColors.textSoft,
                  "&::before, &::after": {
                    borderColor: landingColors.borderMedium,
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.82rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: landingColors.textMuted,
                  }}
                >
                  Or join the founding family list
                </Typography>
              </Divider>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "stretch",
                  gap: 1,
                }}
              >
                <TextField
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    sx: {
                      backgroundColor: landingColors.surfaceTint,
                      borderRadius: 0,
                      height: 48,
                      minHeight: 48,
                      fontSize: "1rem",
                      "& fieldset": {
                        borderRadius: 0,
                        borderColor: landingColors.borderStrong,
                      },
                      "&:hover fieldset": {
                        borderColor: landingColors.borderFocus,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: landingColors.borderActive,
                        borderWidth: "1px",
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  sx={landingFormButtonStyles}
                >
                  {isSubmitting ? "Joining..." : "Add Email"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
