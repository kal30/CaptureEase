# WhatsApp Quick Start

Use this when you just want logging to work fast.

1) Deploy webhook:

```bash
firebase deploy --only functions:smsWebhook
```

2) Set Twilio webhook:

```
https://us-central1-captureease-ef82f.cloudfunctions.net/smsWebhook
```

3) Link phone in the app:
- /settings/messaging
- Verify phone -> pick Default Child -> Save & Link

4) Test:

```
children?
```

```
arj: had a great day
```

Full guide: docs/whatsapp-setup.md
