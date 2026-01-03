# WhatsApp & SMS Logging Setup

This guide covers two flows:
1) Logging entries from WhatsApp/SMS into CaptureEase (inbound)
2) Sending WhatsApp/SMS notifications from the app (outbound)

---

## Inbound: Log from WhatsApp/SMS

### 1) Deploy the webhook

```bash
firebase deploy --only functions:smsWebhook
```

### 2) Configure Twilio webhook

1. Open Twilio Console
2. Messaging -> Try it out -> Send a WhatsApp message
3. Set Webhook URL:
   ```
   https://us-central1-captureease-ef82f.cloudfunctions.net/smsWebhook
   ```
4. Method: POST

### 3) Join the WhatsApp sandbox (dev)

Twilio will show a join code like:

```
join <code>
```

Send that message to the sandbox number from your phone.

### 4) Verify and link your phone

In the app:

1. Go to /settings/messaging
2. Verify your phone
3. Choose a Default Child (used only when no child name is included)
4. Click Save & Link

### 5) Test from your phone

Send:

```
children?
```

Then log:

```
arj: had a great day
```

You can also log for multiple children:

```
Arjun: had lunch; Maya: took a nap
```

### Message format

- Preferred: `ChildName: your message`
- Alias works: `arj: your message`
- If you start with a child name but omit the colon, it still tries to match.
- If no name is present, it uses your Default Child.

---

## Outbound: Send WhatsApp/SMS from the app

### 1) Configure Twilio secrets

```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
firebase functions:secrets:set TWILIO_SMS_FROM
```

### 2) Deploy send functions

```bash
firebase deploy --only functions:sendMessage,functions:sendMessageHttp
```

### 3) Send from React

```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const sendMessage = httpsCallable(functions, "sendMessage");

await sendMessage({
  to: "+14155551234",
  message: "Hello from CaptureEase!",
  type: "whatsapp" // or "sms"
});
```

---

## Data Model Notes

- `logs` is the single source of truth for log entries (app + WhatsApp).
- `phone_index` stores verified phone info in the app.
- `phoneLinks` is used for inbound SMS/WhatsApp routing.
- Access is based on `children.users.members`.

---

## Troubleshooting

### No reply from WhatsApp
- Confirm webhook URL is correct and deployed
- Check Twilio logs
- Ensure you joined the sandbox

### "This number is not linked"
- Verify and link your phone in /settings/messaging
- Confirm `phoneLinks/<phone>` exists

### "I couldn't find a child name"
- Use `children?` to see valid names/aliases
- Try `name: message` or `alias: message`

---

## Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Firebase Functions: https://firebase.google.com/docs/functions
- Functions code: functions/ingestion/smsWebhook.js
