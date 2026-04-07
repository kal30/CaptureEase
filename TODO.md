# CaptureEz Todo

This file is the running cleanup / redesign checklist for the repo.
We can update it as we go so the plan survives if the chat window closes.

## Current Focus

- [x] Archive `DailyLogPage`
- [x] Archive `HealthInforPage`
- [x] Archive `DailyActivitiesPage`
- [ ] Audit remaining page files and mark keep / combine / archive candidates

## Page Cleanup Candidates

- [ ] `SensoryPage` - decide whether it should remain a separate page
- [ ] `TemplateLibraryPage` - decide whether it should remain a separate page
- [ ] Invite flow pages - evaluate whether to combine into one invite wizard
  - `InviteRoleSelectionPage`
  - `InviteCaregiverPage`
  - `InviteCarePartnerPage`
  - `InviteTherapistPage`
  - `InviteSuccessPage`
- [ ] `TherapyNotesPage` - decide whether it should stay separate or move into reports

## Design / Theme Cleanup

- [ ] Keep moving hardcoded colors into shared theme tokens
- [ ] Finalize the new teal / sage / lavender palette
- [ ] Test the refreshed palette on landing, dashboard, and timeline

## Environment / Release Safety

- [ ] Separate staging from production
- [ ] Map `lifelog.care` to staging
- [ ] Keep `captureez.com` for production
- [ ] Make sure staging and production do not share Firestore/Auth/Storage

## Messaging / Chat

- [ ] Confirm the child chat flow is landing directly in the correct child thread
- [ ] Decide whether chat tagging/filtering needs any simplification

## Notes

- `DailyLogPage` has been archived to `src/archive/pages/DailyLogPage.js`.
- `HealthInforPage` has been archived to `src/archive/pages/HealthInforPage.js`.
- `DailyActivitiesPage` has been archived to `src/archive/pages/DailyActivitiesPage.js`.
