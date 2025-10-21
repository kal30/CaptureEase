# Twilio SMS/WhatsApp Ingest Setup

This document explains how to deploy and configure the `ingestMessage` Cloud Function for handling Twilio SMS/WhatsApp webhooks.

## Overview

The `ingestMessage` function:
- ✅ Accepts Twilio webhooks for SMS/WhatsApp messages
- ✅ Verifies Twilio request signatures for security
- ✅ Maps phone numbers to users via `/phone_index/{E164Phone}`
- ✅ Resolves child context using `#childname` tags or `defaultChildId`
- ✅ Downloads and stores media attachments to Firebase Storage
- ✅ Creates log entries in `/logs` collection with automatic classification
- ✅ Prevents duplicate processing using `/ingest_dedupe/{MessageSid}`

## Deployment Steps

### 1. Set Twilio Auth Token Secret

```bash
# Set the Twilio auth token as a secret
firebase functions:secrets:set TWILIO_AUTH_TOKEN
# Enter your Twilio auth token when prompted (find in Twilio Console > Account > API Keys & Tokens)
```

**Note**: The function uses the hardcoded `PUBLIC_INGEST_URL` for signature validation. If you deploy to a different region or project, update the constant in `functions/index.js:23`.

### 2. Deploy the Function

```bash
# Deploy all functions (includes ingestMessage)
firebase deploy --only functions

# Or deploy just the ingest function
firebase deploy --only functions:ingestMessage
```

### 3. Get the Function URL

After deployment, you'll see output like:
```
✔ functions[ingestMessage(us-central1)] Successful create operation.
Function URL: https://us-central1-captureease-ef82f.cloudfunctions.net/ingestMessage
```

## Twilio Configuration

### 1. Configure SMS Webhook

1. Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your Twilio phone number
3. In the "Messaging" section:
   - **Webhook URL**: `https://ingestmessage-rj2mc3r72a-uc.a.run.app`
   - **HTTP Method**: `POST`
4. Save configuration

### 2. Configure WhatsApp Webhook (if using WhatsApp)

1. Go to [Twilio Console > Messaging > WhatsApp](https://console.twilio.com/us1/develop/sms/whatsapp/sandbox)
2. In the WhatsApp Sandbox or approved sender:
   - **Webhook URL**: `https://ingestmessage-rj2mc3r72a-uc.a.run.app`
   - **HTTP Method**: `POST`
3. Save configuration

## Required Firestore Collections

### 1. Phone Index Collection

Create documents in `/phone_index/{E164Phone}`:

```javascript
// Example: /phone_index/+15551234567
{
  "uid": "user123",
  "createdAt": serverTimestamp(),
  "verified": true
}
```

### 2. User Default Child

Update user documents with `defaultChildId`:

```javascript
// Example: /users/user123
{
  "email": "parent@example.com",
  "defaultChildId": "child456",
  // ... other user fields
}
```

### 3. App Configuration (Optional)

Create `/app_config/ingest` for custom settings:

```javascript
{
  "smsEnabled": true,
  "whatsappEnabled": true,
  "maxMedia": 3,
  "allowedMime": [
    "image/jpeg",
    "image/png", 
    "video/mp4",
    "audio/mpeg"
  ],
  "verifySignatures": true  // Set to false for testing with sandbox
}
```

**Signature Validation Notes:**
- SMS messages: Always validated when `verifySignatures: true`
- WhatsApp messages: Signature validation automatically skipped (sandbox compatibility)
- For initial testing, set `verifySignatures: false` to disable all validation
- Production: Always use `verifySignatures: true` for security

## Testing

### 1. Test SMS

Send an SMS to your Twilio number:
```
Had lunch with applesauce #emma
```

Expected result:
- Creates log entry with `source: "sms"`
- Automatically classified as `type: "feeding", subType: "meal"`
- Associated with child named "emma" or falls back to default child

### 2. Test WhatsApp

Send a WhatsApp message to your Twilio sandbox:
```
whatsapp:+14155238886
```

Message:
```
Took a 2 hour nap #jacob
```

Expected result:
- Creates log entry with `source: "whatsapp"`
- Automatically classified as `type: "sleep", subType: "nap"`

### 3. Test Media Attachments

Send an SMS/WhatsApp with photo attachment and text:
```
Emma fell at playground but she's okay
```

Expected result:
- Media uploaded to Firebase Storage at `media/{childId}/{YYYY}/{MM}/{MessageSid}/`
- Log entry includes `attachments[]` array
- Classified as `type: "incident", subType: "fall"`

## Error Handling

### Common Response Messages

- **"Thanks, logged."** ✅ Success
- **"Welcome! Please register your phone number..."** ❌ Phone not in `/phone_index`
- **"Please set a default child..."** ❌ No `defaultChildId` and no valid `#childname`
- **"Service temporarily unavailable."** ❌ SMS/WhatsApp disabled in config
- **"Error processing message."** ❌ Server error (check logs)

### Debugging

Check Firebase Functions logs:
```bash
firebase functions:log --only ingestMessage
```

**Signature Validation Diagnostics:**
When signature validation fails, check logs for:
- `sigPrefix`: First 8 chars of received signature
- `tokenLen`: Length of auth token (should be > 0)
- `rawLen`: Length of raw request body (should be > 0)  
- `url`: Public URL used for validation

**Common Issues:**
- **Invalid signature**: Wrong `TWILIO_AUTH_TOKEN` or `PUBLIC_INGEST_URL` mismatch
- **Missing phone index entry**: Phone not registered in `/phone_index`
- **No default child**: User has no `defaultChildId` and no valid `#childname`
- **Media failures**: Network issues or unsupported MIME types

**Testing Signature Validation:**
1. Set `verifySignatures: false` → should work
2. Set `verifySignatures: true` → should still work  
3. Change `PUBLIC_INGEST_URL` to wrong value → should fail with 403

## Security Features

- ✅ **Signature Verification**: All requests verified against Twilio auth token
- ✅ **Idempotency**: Duplicate `MessageSid` ignored 
- ✅ **User Authentication**: Phone must be registered in `/phone_index`
- ✅ **Child Access Control**: Uses existing Firestore security rules
- ✅ **Media Validation**: MIME type and size restrictions

## Integration Notes

- Messages automatically trigger the `classifyNoteLog` function for categorization
- Logs follow the same security rules as manually created logs
- Media attachments are stored with organized paths for easy retrieval
- Works with both Twilio trial (verified numbers) and production accounts

## Development Testing

For local testing, use the Firebase Functions emulator:

```bash
# Start emulator
firebase emulators:start --only functions

# Test endpoint will be:
# http://localhost:5001/captureease-ef82f/us-central1/ingestMessage
```

Use tools like Postman or curl to simulate Twilio webhooks with proper signature generation.