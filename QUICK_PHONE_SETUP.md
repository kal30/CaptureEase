# Quick Phone Setup (No Scripts Needed!)

## 🎯 Set Up Your Phone to Send WhatsApp Messages

### **Method 1: Using Firebase Console (Easiest)**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: captureease-ef82f
3. **Go to Firestore Database**
4. **Click "Start collection"**
5. **Collection ID**: `phoneLinks`
6. **Document ID**: Your phone number in E.164 format (e.g., `+14155551234`)
7. **Add fields**:

```javascript
{
  phoneE164: "+14155551234",              // Your phone
  ownerUserId: "YOUR_USER_ID",            // See below
  verified: true,
  allowedChildIds: ["YOUR_CHILD_ID"],     // See below
  aliasCodes: {
    "YOUR_CHILD_ID": "arj"                // Short code
  },
  createdAt: [Click "timestamp"]
  updatedAt: [Click "timestamp"]
}
```

8. **Click Save**

### **How to Find Your IDs**

#### **Your User ID:**
1. Log into CaptureEase
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `firebase.auth().currentUser.uid`
5. Press Enter
6. Copy the ID (looks like: `abc123xyz...`)

#### **Your Child ID:**
1. Still in Firebase Console
2. Go to Firestore
3. Open `children` collection
4. Find your child's document
5. Copy the document ID

#### **Your Phone Number:**
- Must be E.164 format: `+[country code][number]`
- US example: `+14155551234`
- UK example: `+447911123456`

### **Method 2: Using Firestore Rules (If Collection Exists)**

If `phoneLinks` collection already exists:

1. Go to Firestore
2. Find `phoneLinks` collection
3. Click "Add document"
4. Use your phone number as Document ID
5. Add the fields above

---

## 🧪 **Test It**

### **1. Deploy the webhook:**
```bash
firebase deploy --only functions:smsWebhook
```

### **2. Configure Twilio:**
1. Go to https://console.twilio.com/
2. **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Under "Sandbox Configuration":
   - Webhook URL: `https://us-central1-captureease-ef82f.cloudfunctions.net/smsWebhook`
   - Method: `POST`
4. Click Save

### **3. Join Sandbox:**
- Send the join message shown in Twilio (e.g., "join [code]")

### **4. Test it!**
Send from your phone:
```
children?
```

You should get back:
```
You can log for:
1. [Child Name] (use "[name]:" or "arj:")

Example: "arj: had a great day"
```

Then try:
```
arj: testing from my phone!
```

---

## 📋 **Complete Example**

Here's a real example of what to put in Firestore:

**Collection:** `phoneLinks`
**Document ID:** `+14155551234`

**Fields:**
```
phoneE164: "+14155551234"
ownerUserId: "xYz789AbC123"
verified: true
allowedChildIds: ["child_abc123"]
aliasCodes: {
  "child_abc123": "arj"
}
createdAt: December 22, 2025 at 9:00:00 AM UTC-8
updatedAt: December 22, 2025 at 9:00:00 AM UTC-8
```

---

## ❓ **Troubleshooting**

### **"This number is not linked to any account"**
- Check that your phoneLinks document exists
- Verify the document ID matches your phone exactly
- Make sure `verified: true`

### **"No children authorized"**
- Check `allowedChildIds` array has child IDs
- Verify child IDs are correct (check children collection)

### **Not receiving bot responses**
- Make sure you joined the WhatsApp sandbox
- Check webhook URL in Twilio is correct
- View Twilio logs: https://console.twilio.com/us1/monitor/logs/sms

---

## 🎯 **What You Can Do**

Once set up, send messages like:

```
children?              → List all children
Arjun: had lunch       → Log for Arjun
arj: feeling happy     → Use short code
Arjun: ate; Maya: nap  → Multiple children
```

Attach photos with your messages and they'll be saved too!

---

**Need help?** See [SEND_FROM_PHONE_GUIDE.md](SEND_FROM_PHONE_GUIDE.md) for full details.
