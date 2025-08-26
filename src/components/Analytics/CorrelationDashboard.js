import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";

// Mock correlation insights to show the vision
const CorrelationDashboard = ({ child }) => {
  // Get child's medical profile for contextual insights
  const medicalProfile = child?.medicalProfile || {};
  const {
    foodAllergies = [],
    dietaryRestrictions = [],
    sensoryIssues = [],
    behavioralTriggers = [],
  } = medicalProfile;

  const [insights] = useState([
    {
      type: "strong",
      correlation: 0.82,
      finding: "Better sleep strongly correlates with improved focus",
      details:
        "When ${child.name} sleeps 9+ hours, focus scores are 40% higher the next day",
      actionable: "Consider earlier bedtime on school nights",
      dataPoints: 45,
      confidence: "High",
    },
    {
      type: "moderate",
      correlation: 0.64,
      finding: foodAllergies.includes("Dairy/Milk")
        ? "Known dairy allergy correlates with behavior issues"
        : "Dairy intake may affect behavior",
      details: foodAllergies.includes("Dairy/Milk")
        ? `Challenging behaviors increase 60% on dairy days - consistent with known allergy`
        : "Challenging behaviors increase 60% on days with high dairy consumption",
      actionable: foodAllergies.includes("Dairy/Milk")
        ? "Continue dairy avoidance as planned"
        : "Track dairy more closely, consider elimination trial",
      dataPoints: 38,
      confidence: "Medium",
    },
    {
      type: "emerging",
      correlation: 0.51,
      finding: "Weather patterns and mood",
      details:
        "Mood dips on rainy days, especially when indoor activities are limited",
      actionable: "Prepare engaging indoor activities for rainy days",
      dataPoints: 22,
      confidence: "Low",
    },
  ]);

  const getCorrelationColor = (correlation) => {
    if (correlation > 0.7) return "success";
    if (correlation > 0.5) return "warning";
    return "info";
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📊 Correlation Insights for {child?.name}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          These insights are generated from {child?.name}'s daily data patterns.
          More data = better insights! Keep logging daily for stronger
          correlations.
        </Typography>
      </Alert>

      {/* Child's Baseline Medical Profile */}
      {(foodAllergies.length > 0 ||
        sensoryIssues.length > 0 ||
        behavioralTriggers.length > 0) && (
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🩺 {child?.name}'s Medical Profile Context
            </Typography>

            <Grid container spacing={2}>
              {foodAllergies.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "warning.main" }}
                  >
                    Food Allergies
                  </Typography>
                  {foodAllergies.map((allergy, index) => (
                    <Chip
                      key={index}
                      label={allergy}
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Grid>
              )}

              {sensoryIssues.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "secondary.main" }}
                  >
                    Sensory Sensitivities
                  </Typography>
                  {sensoryIssues.map((issue, index) => (
                    <Chip
                      key={index}
                      label={issue}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Grid>
              )}

              {behavioralTriggers.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "error.main" }}
                  >
                    Known Triggers
                  </Typography>
                  {behavioralTriggers.map((trigger, index) => (
                    <Chip
                      key={index}
                      label={trigger}
                      color="error"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {insights.map((insight, index) => (
          <Grid item xs={12} key={index}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {insight.type === "strong" && (
                      <TrendingUpIcon color="success" />
                    )}
                    {insight.type === "moderate" && (
                      <WarningIcon color="warning" />
                    )}
                    {insight.type === "emerging" && (
                      <LightbulbIcon color="info" />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {insight.finding}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {insight.details}
                    </Typography>

                    <Box
                      sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
                    >
                      <Chip
                        label={`${Math.round(insight.correlation * 100)}% correlation`}
                        color={getCorrelationColor(insight.correlation)}
                        size="small"
                      />
                      <Chip
                        label={`${insight.dataPoints} data points`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`${insight.confidence} confidence`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        💡 Suggested Action: {insight.actionable}
                      </Typography>
                    </Alert>

                    <LinearProgress
                      variant="determinate"
                      value={insight.correlation * 100}
                      color={getCorrelationColor(insight.correlation)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      color: "#5B8C51",
                      "&:hover": {
                        backgroundColor: "rgba(91, 140, 81, 0.1)",
                      },
                    }}
                  >
                    View Data
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      color: "#5B8C51",
                      "&:hover": {
                        backgroundColor: "rgba(91, 140, 81, 0.1)",
                      },
                    }}
                  >
                    Share with Therapist
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      color: "#5B8C51",
                      "&:hover": {
                        backgroundColor: "rgba(91, 140, 81, 0.1)",
                      },
                    }}
                  >
                    Set Reminder
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CorrelationDashboard;
