# Messaging Routing Documentation

This document describes how CaptureEase routes incoming SMS/WhatsApp messages to the correct child profiles using hashtag-based resolution.

## Overview

Users can send messages to their linked phone number and have them automatically logged as care entries. The system supports routing messages to specific children using hashtags while maintaining a default child fallback.

## Child Resolution Logic

Messages are processed using a multi-step resolution system:

### 1. Explicit Child ID
- **Pattern**: `#<24+ character Firestore ID>`
- **Example**: `#tfVn2r0SbU6mtfu7n2ui`
- **Priority**: Highest
- **Result**: Direct match to child document

### 2. Name/Alias Matching
- **Pattern**: `#<name_or_alias>`
- **Examples**: `#Emma`, `#emma`, `#emma_doe`, `#EmmaDoe`
- **Normalization**: All tokens and child names are normalized using:
  - Lowercase conversion
  - Diacritics removal (é → e)
  - Punctuation removal
  - Whitespace/underscore/hyphen collapse
- **Matching**: Exact match against:
  - `child.name` (normalized)
  - `child.settings.alias` (normalized, if present)

### 3. Default Child
- **Fallback**: Uses `users/{uid}.defaultChildId`
- **When**: No explicit child tag found or ambiguous matches

### 4. No Resolution
- **Result**: Message queued for manual routing
- **User Response**: "Please include a child tag like #Emma or #childId"

## Reserved Tags

The following hashtags are reserved and won't be treated as child identifiers:

```javascript
["sleep", "mood", "meal", "mealtime", "note", "journal", 
 "therapy", "progress", "medical", "incident", "care"]
```

These tags are parsed as content tags instead of child routing.

## Token Normalization Examples

| Input | Normalized | Matches |
|-------|------------|---------|
| `#Emma` | `emma` | Child named "Emma" |
| `#emma-doe` | `emmadoe` | Child named "Emma Doe" |
| `#José María` | `josemaria` | Child named "José María" |
| `#Emma_Kate` | `emmakate` | Child named "Emma Kate" |

## Message Processing Flow

1. **Authentication**: Verify phone number is linked and verified
2. **Dedupe**: Check for duplicate messages (SHA256 hash, 30s window)
3. **Child Resolution**: Apply resolution logic above
4. **Permissions**: Verify user has access to resolved child
5. **SMS Settings**: Check child has SMS notifications enabled
6. **Tag Parsing**: Extract non-child, non-reserved hashtags as content tags
7. **Log Creation**: Create log entry with metadata
8. **Response**: Send confirmation to user

## Error Handling

### Phone Not Verified
- **Response**: "Please verify your phone number in CaptureEZ settings first."

### Child Not Found/No Tag
- **Action**: Queue message with status `needs_child`
- **Response**: "Please include a child tag like #Emma or #childId. Your message wasn't logged."

### SMS Disabled for Child
- **Response**: "SMS is disabled for {childName}. Enable it in Settings."

### No Access to Child
- **Action**: Queue message with status `not_allowed`
- **Response**: "You don't have access to {childName}. Ask the care owner."

### Ambiguous Name Match
- **Action**: Fall back to default child
- **Metadata**: `reason: "ambiguousName"` for debugging

## Example Messages

### Success Cases
```
"Great session today #Emma #progress"
→ Logs to Emma, tags: ["progress"]

"Had lunch with applesauce"
→ Logs to default child, tags: []

"Nap time #sleep #emma"
→ Logs to Emma, tags: ["sleep"]

"Doctor visit #tfVn2r0SbU6mtfu7n2ui #medical"
→ Logs to child by ID, tags: ["medical"]
```

### Edge Cases
```
"Fun day #sleep"
→ Logs to default child (sleep is reserved), tags: []

"Playing with #Emma #Lucy #toys"
→ Uses last child token (Lucy), tags: ["toys"]

"Great day #invalidchild"
→ Falls back to default child, tags: []
```

## Metadata Structure

Each log entry includes telemetry for debugging:

```javascript
{
  source: "whatsapp" | "sms",
  receivedAt: serverTimestamp(),
  meta: {
    childResolution: {
      reason: "explicitId" | "explicitName" | "default" | "ambiguousName" | "multipleChildTokens",
      tokenMatched: "emma",  // actual token used
      matchedBy: "id" | "name" | "alias" | "default" | "ambiguous"
    }
  },
  tags: ["progress", "therapy"]  // parsed hashtags
}
```

## Future Enhancements

### Short Code Aliases
Support for user-defined shortcuts:
```javascript
users/{uid}.childAliases = {
  "e": "childId1",     // #e → Emma
  "m": "childId2"      // #m → Mindy  
}
```

### Multiple Child Tags
Currently uses the last child-like token found. Could be enhanced to support multiple children per message.