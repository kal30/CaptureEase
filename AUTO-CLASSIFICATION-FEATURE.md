# Quick Notes Auto-Classification Feature

## Overview

The CaptureEase app now automatically classifies every Quick Note as either a **Daily Log** (routine activities) or an **Important Moment** (significant events) based on content analysis. Users no longer need to manually choose between these categories.

## What Changed

### 1. Enhanced Classification Algorithm
**File**: [`functions/logs/classify.js`](functions/logs/classify.js)

Added intelligent importance detection that analyzes:
- **Important Moments** - Flagged for:
  - Milestones & achievements (first time, milestone, new skill)
  - Medical & health issues (fever, sick, vomit, doctor, allergic reaction)
  - Incidents & safety concerns (fell, injury, accident, bleeding)
  - Behavioral concerns (tantrum, meltdown, aggressive, hitting)
  - Therapy progress & breakthroughs
  - Longer, detailed notes (>150 characters)

- **Daily Log** - Flagged for:
  - Routine meals (breakfast, lunch, dinner, snack)
  - Normal sleep activities (nap, bedtime, sleep)
  - Regular activities (played, watched, went to park, bath time)
  - Positive routine behavior (happy, smiling, good day)

### 2. New Database Field
**Field**: `noteType` (string)
- Values: `'important'` or `'routine'`
- Automatically set by Cloud Function after classification
- Stored in Firestore `logs` collection

### 3. Updated Firestore Rules
**File**: [`firestore.rules`](firestore.rules:654)

Added `noteType` to allowed fields in logs collection:
- Line 654: Added to CREATE rule
- Line 673: Added to UPDATE rule

### 4. Enhanced UI Feedback
**File**: [`src/components/Dashboard/QuickNoteLog.js`](src/components/Dashboard/QuickNoteLog.js)

Updated Quick Note dialog to inform users about auto-classification:
- Success message mentions automatic classification
- Help text explains Daily Log vs Important Moment distinction
- Clear visual indicators of the feature

### 5. Visual Badge Component
**File**: [`src/components/UI/NoteTypeBadge.js`](src/components/UI/NoteTypeBadge.js)

Created reusable badge component for displaying classification:
- **Important Moment**: Gold/amber badge with star icon
- **Daily Log**: Blue/indigo badge with document icon
- Responsive sizing (small/medium)
- Ready for Timeline integration

## How It Works

### User Flow
1. User clicks 📝 Quick Note button on child card
2. Types note (e.g., "Fell at playground but okay" or "Had lunch with applesauce")
3. Clicks "Log Note"
4. Note is saved to Firestore `logs` collection with `type: 'note'`
5. Cloud Function automatically triggers and:
   - Classifies activity type (feeding, incident, sleep, etc.)
   - Determines importance level (important or routine)
   - Updates document with `noteType` field
6. Note appears in timeline with appropriate badge

### Classification Logic
```javascript
// Example classifications:
"Fell at playground but okay"
  → type: incident, subType: fall, noteType: important

"Had lunch with applesauce"
  → type: feeding, subType: meal, noteType: routine

"First time walking independently!"
  → type: milestone, subType: walking, noteType: important

"Took a 2-hour nap"
  → type: sleep, subType: nap, noteType: routine
```

## Implementation Details

### Cloud Function Changes
The `classifyNoteLog` function now:
1. Classifies the activity type (existing logic)
2. Calls new `determineImportance()` function
3. Saves `noteType` alongside `type` and `subType`

```javascript
// Example update data
{
  type: "incident",
  subType: "fall",
  noteType: "important",  // NEW FIELD
  classified: true,
  classifiedAt: serverTimestamp()
}
```

### Firebase Rules Update
Both CREATE and UPDATE operations now allow the `noteType` field:
```javascript
request.resource.data.keys().hasOnly([
  'childId', 'type', 'subType', 'noteType', // noteType added
  'note', 'timeStart', 'timeEnd', 'tags', // ... other fields
])
```

## Integration Guide

### Using the NoteTypeBadge Component

```javascript
import NoteTypeBadge from '../UI/NoteTypeBadge';

// In your component
<NoteTypeBadge
  noteType={entry.noteType}  // 'important' or 'routine'
  size="small"               // 'small' or 'medium'
  showIcon={true}            // show/hide icon
/>
```

### Displaying in Timeline
To integrate the badge into timeline entries:

```javascript
// In TimelineItem or LogEntry component
import NoteTypeBadge from '../UI/NoteTypeBadge';

// Add to entry header
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Typography>{entryLabel}</Typography>
  <NoteTypeBadge noteType={entry.noteType} size="small" />
</Box>
```

### Querying by Importance
Filter notes by importance in Firestore:

```javascript
// Get only Important Moments
const q = query(
  collection(db, 'logs'),
  where('childId', '==', childId),
  where('noteType', '==', 'important'),
  orderBy('createdAt', 'desc')
);

// Get only Daily Log entries
const q = query(
  collection(db, 'logs'),
  where('childId', '==', childId),
  where('noteType', '==', 'routine'),
  orderBy('createdAt', 'desc')
);
```

## Deployment Steps

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Cloud Functions
```bash
cd functions
npm install  # Ensure dependencies are up to date
cd ..
firebase deploy --only functions:classifyNoteLog
```

### 3. Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

### 4. Test the Feature
1. Create a Quick Note with incident keywords (e.g., "Fell down")
2. Check Firestore document has `noteType: 'important'`
3. Create a Quick Note with routine keywords (e.g., "Had lunch")
4. Check Firestore document has `noteType: 'routine'`

## Testing Examples

### Test Cases

| Note Text | Expected Type | Expected SubType | Expected NoteType |
|-----------|---------------|------------------|-------------------|
| "Fell at playground but okay" | incident | fall | important |
| "Had lunch with applesauce" | feeding | meal | routine |
| "First time walking!" | milestone | walking | important |
| "Took a 2-hour nap" | sleep | nap | routine |
| "High fever, took to doctor" | note (unclassified) | - | important |
| "Tantrum at bedtime" | behavior | tantrum | important |
| "Happy and smiling all day" | behavior | positive | routine |
| "Speech therapy session went well" | therapy | speech | important |

### Manual Testing Checklist
- [ ] Quick Note creates log with correct classification
- [ ] Cloud Function triggers and adds `noteType` field
- [ ] Important moments are flagged correctly
- [ ] Routine activities are flagged correctly
- [ ] Edge cases (no classification) default to important
- [ ] Firestore rules allow `noteType` field
- [ ] UI displays success message
- [ ] Badge component renders correctly

## Future Enhancements

### Potential Improvements
1. **Machine Learning**: Train ML model on user feedback to improve accuracy
2. **User Feedback Loop**: Allow users to correct misclassifications
3. **Filtering UI**: Add filter buttons for "Important Moments" vs "All Logs"
4. **Notifications**: Send push notifications for Important Moments
5. **Analytics Dashboard**: Show breakdown of important vs routine activities
6. **Custom Keywords**: Allow parents to define custom importance keywords
7. **Severity Levels**: Add sub-levels within important (low/medium/high)

### Integration Opportunities
- **Timeline View**: Show Important Moments with special highlighting
- **Summary Reports**: Generate weekly summaries emphasizing Important Moments
- **Sharing**: Make it easy to share Important Moments with care team
- **Calendar View**: Mark dates with Important Moments distinctly

## Backward Compatibility

- **Existing Notes**: Old notes without `noteType` field continue to work
- **Component Safety**: `NoteTypeBadge` returns `null` if `noteType` is missing
- **Query Compatibility**: Queries work with or without `noteType` field
- **Rules**: Firestore rules allow but don't require `noteType` field

## Support

For questions or issues related to auto-classification:
1. Check Cloud Function logs: `firebase functions:log`
2. Verify Firestore rules are deployed
3. Ensure Cloud Function is deployed and active
4. Check browser console for frontend errors

## Related Files

- [classify.js](functions/logs/classify.js) - Classification algorithm
- [QuickNoteLog.js](src/components/Dashboard/QuickNoteLog.js) - Quick Note UI
- [NoteTypeBadge.js](src/components/UI/NoteTypeBadge.js) - Badge component
- [firestore.rules](firestore.rules) - Security rules

---

**Last Updated**: 2025-10-24
**Feature Status**: ✅ Ready for Deployment
