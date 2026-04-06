import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { sendContactEmail } from "../services/contactService";
import colors from "../assets/theme/colors";

const CONTACT_EMAIL = "captureezhq@gmail.com";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const trimmedData = {
      senderName: formData.senderName.trim(),
      senderEmail: formData.senderEmail.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (!trimmedData.senderName || !trimmedData.senderEmail || !trimmedData.subject || !trimmedData.message) {
      setSubmitError("Please fill out all fields before sending.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await sendContactEmail(trimmedData);
      setSubmitSuccess(
        response?.emailSent === false
          ? "Your message was saved successfully. Our team will still review it even if email delivery is delayed."
          : "Your message has been sent. We'll get back to you by email."
      );
      setFormData({
        senderName: "",
        senderEmail: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitError(error.message || "We couldn't send your message right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: `linear-gradient(180deg, ${colors.marketing.contact.backgroundStart} 0%, ${colors.marketing.contact.backgroundEnd} 100%)`,
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            border: `1px solid ${colors.marketing.contact.border}`,
            backgroundColor: colors.marketing.contact.paperBg,
          }}
        >
          <Stack spacing={2.5}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 800,
                color: colors.marketing.contact.title,
                lineHeight: 1.1,
              }}
            >
              Contact Us
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.8,
                color: colors.marketing.contact.text,
                maxWidth: "58ch",
              }}
            >
              Questions, feedback, or support requests can be sent directly to our team using the form below.
            </Typography>

            <Box
              sx={{
                borderRadius: 3,
                backgroundColor: colors.marketing.contact.supportBg,
                border: `1px solid ${colors.marketing.contact.supportBorder}`,
                px: 2,
                py: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: colors.marketing.contact.textMuted,
                  mb: 0.75,
                }}
              >
                Support Email
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1.05rem", md: "1.15rem" },
                  fontWeight: 700,
                  color: colors.marketing.contact.title,
                  wordBreak: "break-word",
                }}
              >
                {CONTACT_EMAIL}
              </Typography>
            </Box>

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Your Name"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Your Email"
                  name="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  minRows={6}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<EmailOutlinedIcon />}
                    disabled={submitting}
                    sx={{
                    px: 3,
                    py: 1.3,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: colors.marketing.contact.buttonBg,
                    "&:hover": {
                      backgroundColor: colors.marketing.contact.buttonHoverBg,
                    },
                  }}
                >
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
