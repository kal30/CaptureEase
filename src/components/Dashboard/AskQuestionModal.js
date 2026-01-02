import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import { askQuestion } from "../../services/askQuestionService";

const AskQuestionModal = ({ open, onClose, child }) => {
  const [question, setQuestion] = useState("");
  const [range, setRange] = useState("6m");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setRange("6m");
      setResult(null);
      setError("");
    }
  }, [open]);

  const dateRange = useMemo(() => {
    if (range === "all") return { startDate: null, endDate: null };
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 183 * 24 * 60 * 60 * 1000);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }, [range]);

  const handleAsk = async () => {
    if (!child?.id || !question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await askQuestion({
        childId: child.id,
        question: question.trim(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setResult(data);
    } catch (err) {
      setError("Unable to fetch insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ask about {child?.name || "this child"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Ask a question"
            placeholder='e.g. "When was he aggressive?"'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            fullWidth
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Time range
            </Typography>
            <ToggleButtonGroup
              value={range}
              exclusive
              onChange={(e, value) => value && setRange(value)}
              size="small"
            >
              <ToggleButton value="6m">Last 6 months</ToggleButton>
              <ToggleButton value="all">All time</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Summarizing logs...</Typography>
            </Box>
          )}

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {result?.summary && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Summary
              </Typography>
              <Typography variant="body2">{result.summary}</Typography>
            </Box>
          )}

          {Array.isArray(result?.evidence) && result.evidence.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Evidence
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {result.evidence.map((item, index) => (
                  <Box key={`${item.date}-${index}`}>
                    <Typography variant="caption" color="text.secondary">
                      {item.date}
                    </Typography>
                    <Typography variant="body2">{item.snippet}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
        <Button onClick={handleAsk} variant="contained" disabled={loading || !question.trim()}>
          Ask
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AskQuestionModal;
