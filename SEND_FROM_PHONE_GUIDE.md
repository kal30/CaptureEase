# Send WhatsApp Messages FROM Your Phone

This guide shows you how to send WhatsApp messages **from your phone** to log activities in CaptureEase.

## 🎯 Overview

Once set up, you can text your CaptureEase WhatsApp number like:

```
Arjun: had a great day at school
```

And it will automatically log that entry for Arjun in your app!

## 🚀 Quick Setup (4 Steps)

### Step 1: Deploy the webhook function

```bash
firebase deploy --only functions:smsWebhook
```

### Step 2: Configure Twilio webhook

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Scroll to **Webhook Configuration**
4. Set webhook URL to:
   ```
   https://us-central1-captureease-ef82f.cloudfunctions.net/smsWebhook
   ```
5. Make sure method is **POST**

### Step 3: Join WhatsApp Sandbox (for testing)

1. In the Twilio Console, you'll see instructions like:
   ```
   Send "join [your-code]" to +1 415 523 8886
   ```
2. Open WhatsApp on your phone
3. Send that exact message to join the sandbox

### Step 4: Link your phone number

Run this script with your info:

```bash
node scripts/setupPhoneForWhatsApp.js "+YOUR_PHONE" "YOUR_USER_ID" "YOUR_CHILD_ID"
```

**How to find these IDs:**

1. **Your phone**: Your phone number in E.164 format (e.g., `+14155551234`)

2. **Your user ID**:
   - Log into your CaptureEase app
   - Open browser console (F12)
   - Run: `firebase.auth().currentUser.uid`
   - Copy the ID

3. **Your child ID**:
   - Go to Firebase Console
   - Open Firestore Database
   - Find your child in the `children` collection
   - Copy the document ID

**Example:**
```bash
node scripts/setupPhoneForWhatsApp.js "+14155551234" "abc123xyz" "child456def"
```

## 📱 How to Use

### Send a basic log

```
Arjun: had a great day at school
```

### Log for multiple children

```
Arjun: had lunch; Maya: took a nap
```

### Use short codes

After setup, you can use the first 3 letters:

```
arj: feeling happy today
```

### See your children list

```
children?
```

This shows all children you can log for.

## 📝 Message Format

**Required format:** `ChildName: your message here`

- **Child name** (or short code) followed by **colon**
- Then your message
- For multiple children, separate with **semicolon**

**Examples:**
- ✅ `Arjun: had breakfast`
- ✅ `arj: feeling great`
- ✅ `Arjun: ate lunch; Maya: took nap`
- ❌ `Had breakfast` (missing child name)
- ❌ `Arjun had breakfast` (missing colon)

## 🔍 Fuzzy Matching

If you misspell a name slightly, the system will ask for confirmation:

```
You: Arjn: had lunch
Bot: Did you mean Arjun? Reply YES to confirm or resend with the correct name.
You: YES
Bot: Logged for Arjun ✅
```

## 🖼️ Sending Photos

Just attach a photo to your WhatsApp message along with the text:

```
Arjun: great artwork today!
[attached photo]
```

The photo will be saved with the log entry.

## 🛠️ Troubleshooting

### "This number is not linked to any account"

Run the setup script from Step 4:
```bash
node scripts/setupPhoneForWhatsApp.js "+YOUR_PHONE" "YOUR_USER_ID" "YOUR_CHILD_ID"
```

### "I couldn't find a child name at the start"

Make sure you use the format: `ChildName: message`
- Include the colon after the name
- Use the exact child name or short code

To see valid names, send: `children?`

### "I can't log for [name] from this number"

That child is not linked to your phone number. Add them by:
1. Going to Firebase Console
2. Finding your `phoneLinks` document (your phone number)
3. Adding the child ID to `allowedChildIds` array

### Not receiving messages from the bot

1. Make sure you joined the WhatsApp sandbox
2. Check Twilio logs: https://console.twilio.com/us1/monitor/logs/sms
3. Verify webhook URL is correct in Twilio settings

## 🔐 Security Notes

- Only phone numbers in the `phoneLinks` collection can send messages
- Each phone can only log for authorized children
- All messages are logged with timestamp and sender info

## 🎯 Advanced: Add Multiple Children

To allow logging for multiple children from your phone:

```bash
# Option 1: Run the script multiple times with different child IDs
node scripts/setupPhoneForWhatsApp.js "+14155551234" "userId" "childId1"
node scripts/setupPhoneForWhatsApp.js "+14155551234" "userId" "childId2"

# Option 2: Manually edit in Firebase Console
# Go to Firestore → phoneLinks → [your phone]
# Edit allowedChildIds array: ["childId1", "childId2"]
# Edit aliasCodes object: { "childId1": "arj", "childId2": "may" }
```

## 📊 Data Structure

The `phoneLinks` collection stores:

```javascript
{
  phoneE164: "+14155551234",
  ownerUserId: "abc123",
  verified: true,
  allowedChildIds: ["child1", "child2"],
  aliasCodes: {
    "child1": "arj",  // Short code for Arjun
    "child2": "may"   // Short code for Maya
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🚀 Production Setup

For production (not sandbox):

1. Get a **WhatsApp Business Account** verified
2. Update webhook URL to production function
3. Set up proper rate limiting
4. Add phone number verification flow in your app
5. Implement opt-in/opt-out functionality

## 📚 Related Docs

- Main WhatsApp guide: [WHATSAPP_SUMMARY.md](WHATSAPP_SUMMARY.md)
- Sending messages TO users: [docs/whatsapp-quick-start.md](docs/whatsapp-quick-start.md)
- Function reference: [functions/README.md](functions/README.md)

## 🆘 Need Help?

- Check webhook code: [functions/ingestion/smsWebhook.js](functions/ingestion/smsWebhook.js)
- Twilio docs: https://www.twilio.com/docs/whatsapp
- View Twilio logs: https://console.twilio.com/us1/monitor/logs/sms

---

**Ready to test?** Follow the 4 steps above and start sending messages! 📱✨
