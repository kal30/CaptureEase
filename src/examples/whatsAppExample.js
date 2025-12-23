/**
 * WhatsApp Messaging Example Component
 *
 * This component demonstrates how to send WhatsApp messages
 * from your React app using Firebase Functions.
 */

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button, TextField, Alert, CircularProgress, Box, Typography } from '@mui/material';

const WhatsAppExample = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sendWhatsAppMessage = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const functions = getFunctions();
      const sendMessage = httpsCallable(functions, 'sendMessage');

      const response = await sendMessage({
        to: phoneNumber,
        message: message,
        type: 'whatsapp'
      });

      setResult(response.data);
      setMessage(''); // Clear message after successful send
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate phone number format
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      setError('Phone number must be in E.164 format (e.g., +1234567890)');
      return;
    }

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    sendWhatsAppMessage();
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Send WhatsApp Message
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Phone Number"
          fullWidth
          margin="normal"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          helperText="E.164 format: +[country code][number]"
          disabled={loading}
        />

        <TextField
          label="Message"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message..."
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Sending...
            </>
          ) : (
            'Send WhatsApp Message'
          )}
        </Button>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Message sent successfully! Message SID: {result.messageSid}
        </Alert>
      )}
    </Box>
  );
};

export default WhatsAppExample;


/**
 * Example: Send a daily summary notification
 */
export async function sendDailySummary(parentPhone, childName, summaryData) {
  const functions = getFunctions();
  const sendMessage = httpsCallable(functions, 'sendMessage');

  const summaryText = `
📊 Daily Summary for ${childName}

🎭 Mood: ${summaryData.mood}
😴 Sleep: ${summaryData.sleepHours} hours
⚡ Energy: ${summaryData.energy}
🍽️ Meals: ${summaryData.meals}

${summaryData.notes ? `📝 Notes: ${summaryData.notes}` : ''}

View full details: https://www.captureez.com
  `.trim();

  try {
    const result = await sendMessage({
      to: parentPhone,
      message: summaryText,
      type: 'whatsapp'
    });

    return result.data;
  } catch (error) {
    console.error('Failed to send daily summary:', error);
    throw error;
  }
}


/**
 * Example: Send a milestone notification
 */
export async function sendMilestoneNotification(parentPhone, childName, milestone) {
  const functions = getFunctions();
  const sendMessage = httpsCallable(functions, 'sendMessage');

  const messageText = `
🎉 Exciting news about ${childName}!

${milestone.title}

${milestone.description}

Logged at: ${new Date(milestone.timestamp).toLocaleString()}

View details: https://www.captureez.com
  `.trim();

  try {
    const result = await sendMessage({
      to: parentPhone,
      message: messageText,
      type: 'whatsapp'
    });

    return result.data;
  } catch (error) {
    console.error('Failed to send milestone notification:', error);
    throw error;
  }
}


/**
 * Example: Send a behavior alert
 */
export async function sendBehaviorAlert(parentPhone, childName, alert) {
  const functions = getFunctions();
  const sendMessage = httpsCallable(functions, 'sendMessage');

  const messageText = `
⚠️ Alert for ${childName}

${alert.type}: ${alert.description}

Time: ${new Date(alert.timestamp).toLocaleString()}
${alert.severity ? `Severity: ${alert.severity}` : ''}

${alert.action ? `Action taken: ${alert.action}` : ''}

View details: https://www.captureez.com
  `.trim();

  try {
    const result = await sendMessage({
      to: parentPhone,
      message: messageText,
      type: 'whatsapp'
    });

    return result.data;
  } catch (error) {
    console.error('Failed to send behavior alert:', error);
    throw error;
  }
}


/**
 * Example: Send bulk messages (use with caution!)
 */
export async function sendBulkMessages(recipients, message) {
  const functions = getFunctions();
  const sendMessage = httpsCallable(functions, 'sendMessage');

  const results = [];
  const errors = [];

  // Send messages one by one (Twilio doesn't support bulk)
  for (const recipient of recipients) {
    try {
      const result = await sendMessage({
        to: recipient.phone,
        message: message.replace('{name}', recipient.name),
        type: 'whatsapp'
      });

      results.push({
        phone: recipient.phone,
        success: true,
        messageSid: result.data.messageSid
      });

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      errors.push({
        phone: recipient.phone,
        success: false,
        error: error.message
      });
    }
  }

  return { results, errors };
}
