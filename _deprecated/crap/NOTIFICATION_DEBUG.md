# Notification Permission Debugging Guide

If you see "Notification permission not granted, skipping notification scheduling" in the console, here's how to fix it:

## Quick Fix Options:

### Option 1: Use the UI Prompt (Recommended)
1. **Look for the blue notification prompt** at the top of the dashboard
2. **Click "Enable Notifications"** button
3. **Allow** when browser asks for permission

### Option 2: Manual Browser Settings
1. **Look for the 🔒 or ⓘ icon** in your address bar (next to the URL)
2. **Click it** and find "Notifications" 
3. **Change it to "Allow"**
4. **Refresh the page**

### Option 3: Browser Settings Menu
- **Chrome**: Settings → Privacy and security → Site Settings → Notifications
- **Firefox**: Settings → Privacy & Security → Permissions → Notifications  
- **Safari**: Preferences → Websites → Notifications

## Testing Notifications:

### Test in Browser Console:
```javascript
// Test permission request
import { requestPermissionManually } from './services/followUpService';
requestPermissionManually();

// Test notification with buttons
import { testNotification } from './services/followUpService';
testNotification();
```

### Test with Real Follow-up:
1. Create an incident with a remedy (e.g., "ice pack for headache")
2. Enable the "Smart Follow-up" toggle  
3. Save the incident
4. Wait for the scheduled notification time

## Troubleshooting:

### Permission Status Meanings:
- **"default"** = Not asked yet (shows blue prompt)
- **"granted"** = Allowed ✅ (notifications will work)
- **"denied"** = Blocked ❌ (shows yellow warning prompt)

### If Permission is "denied":
1. Use **Option 2 or 3** above to manually enable
2. The yellow prompt will show with "Enable in Browser Settings" button

### If Notifications Still Don't Work:
1. Check if browser supports notifications: `'Notification' in window`
2. Check if Service Worker registered: Look for "Service Worker registered successfully" in console
3. Try incognito/private browsing mode to test fresh permissions

## How the System Works:

1. **App loads** → Checks permission status
2. **Permission "default"** → Shows blue prompt to request
3. **Permission "granted"** → Schedules smart notifications based on incident type
4. **Follow-up time arrives** → Shows notification with 😊😐😞 action buttons
5. **User clicks button** → Stores response, shows confirmation
6. **App reopens** → Processes stored responses automatically

## Expected Console Output:

**Working correctly:**
```
🔔 Current notification permission: granted
🔔 Initializing notifications for pending follow-ups...
Service Worker registered successfully: /sw.js
📅 Follow-up notification scheduled for Emma in 30 minutes
```

**Permission needed:**
```
🔔 Current notification permission: default  
❌ Notification permission not granted. Current status: default
💡 To enable notifications: Click the notification icon in your browser address bar
```