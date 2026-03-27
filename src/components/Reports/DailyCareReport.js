import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Stack,
    Divider,
    Paper,
    CircularProgress,
    Chip,
    LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useTheme, alpha } from "@mui/material/styles";
import { generateChildReport, generateAINarrative } from "../../services/reportService";

const DailyCareReport = ({ open, onClose, childId, childName }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [aiNarrative, setAiNarrative] = useState("");

    useEffect(() => {
        if (open && childId) {
            loadReport();
        }
    }, [open, childId]);

    const loadReport = async () => {
        setLoading(true);
        try {
            // Default to last 7 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            const data = await generateChildReport(childId, startDate, endDate);
            setReportData(data);

            const narrative = await generateAINarrative(data);
            setAiNarrative(narrative);
        } catch (error) {
            console.error("Error loading report:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderHabitTrends = () => {
        if (!reportData?.habits?.averageLevels) return null;

        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Habit Averages (Scale 1-10)
                </Typography>
                <Stack spacing={2}>
                    {Object.entries(reportData.habits.averageLevels).map(([category, value]) => (
                        <Box key={category}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {category}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {value}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={value * 10}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                    }
                                }}
                            />
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ borderBottom: "1px solid #eee", py: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AssessmentIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Doctor's Summary: {childName}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={4}>
                        {/* AI Narrative Summary */}
                        <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                                AI Insight Summary
                            </Typography>
                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                                "{aiNarrative}"
                            </Typography>
                        </Paper>

                        <Divider />

                        {/* Quick Stats */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Period Overview
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                                <Chip label={`${reportData?.habits?.totalEntries || 0} Logs Tracked`} variant="outlined" />
                                <Chip label={`${reportData?.incidents?.length || 0} Important Moments`} variant="outlined" color="warning" />
                            </Stack>
                        </Box>

                        {/* Habit Trends */}
                        {renderHabitTrends()}

                        <Divider />

                        {/* Recent Incidents */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Recent Important Moments
                            </Typography>
                            {reportData?.incidents?.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No incidents reported in this period.</Typography>
                            ) : (
                                <Stack spacing={2}>
                                    {reportData.incidents.slice(0, 3).map((incident, idx) => (
                                        <Box key={idx} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {incident.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {incident.content}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DailyCareReport;
