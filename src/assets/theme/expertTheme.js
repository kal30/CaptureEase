import colors from "./colors";

const expert = colors.landing;

export const expertSectionStyles = {
  position: "relative",
  bgcolor: "transparent",
  px: { xs: 2, md: 3 },
  pt: { xs: 2, md: 3 },
  pb: { xs: 8, md: 10 },
  overflow: "visible",
};

export const expertCardStyles = {
  bgcolor: expert.surfaceTint,
  borderRadius: "28px",
  boxShadow: expert.shadowMedium,
  border: `1px solid ${expert.borderSoft}`,
  position: "relative",
  p: { xs: 3, md: 5 },
  maxWidth: 1120,
  mx: "auto",
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: "center",
  justifyContent: "space-between",
  gap: { xs: 3, md: 6 },
};

export const expertLeftColumnStyles = {
  flex: 1,
  pr: { md: 5 },
  position: "relative",
  zIndex: 1,
};

export const expertTitleStyles = {
  fontWeight: 700,
  lineHeight: 1.18,
  mb: { xs: 1.5, md: 2 },
  color: expert.heroText,
  fontSize: { xs: "1.65rem", md: "2.1rem", lg: "2.45rem" },
  letterSpacing: "-0.03em",
  maxWidth: "22ch",
  fontFamily: '"Inter", sans-serif',
};

export const expertSubTitleStyles = {
  marginTop: 2,
  fontSize: "0.92rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: expert.textMuted,
};

export const expertBodyTextStyles = {
  marginBottom: "12px",
  color: expert.bodyText,
  lineHeight: 1.75,
  fontWeight: 400,
  fontSize: { xs: "1rem", md: "1.05rem", lg: "1.08rem" },
  fontFamily: '"Inter", sans-serif',
};

export const expertCtaButtonStyles = {
  px: 3,
  py: 1.25,
  borderRadius: 1.5,
};

export const expertImageStyles = {
  width: "100%",
  height: "auto",
  borderRadius: 2,
  maxHeight: 420,
  objectFit: "cover",
};
