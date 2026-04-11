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

## Centralization Backlog

These are the shared UI pieces we should consolidate so desktop and mobile stop drifting apart.

### Priority 1

- [x] Brand wordmark
  - `life` / `log` split
  - Outfit font
  - no dot
  - use one shared `BrandWordmark` component
- [x] Brand copy strings
  - shared product title / tagline constants
  - login / register / footer / about copy
  - static SEO / PWA text aligned to the same brand
- [ ] Mobile and desktop header pieces
  - page title style
  - back button style
  - avatar style
  - sticky vs non-sticky behavior
- [x] Child switcher UI
  - desktop switcher
  - mobile switcher sheet
  - `Your role: ...` text
  - avatar + chevron layout
- [x] Child actions menu
  - add child
  - add careteam
  - prep for therapy
  - import
  - edit child
  - delete child
  - chat
  - allergy warning section

### Priority 2

- [x] Timeline header
  - date label
  - streak pill
  - calendar dropdown
  - search bar
  - filters rail
- [ ] Unified calendar wrapper
  - one shared calendar component for timeline and date picking
  - activity dots for days with entries
  - picker and timeline modes in one API
  - replace separate mobile / desktop calendar paths
- [ ] Timeline chip styles
  - entry-type chips
  - tag chips
  - active/inactive borders
  - filter badge logic
- [ ] Quick action buttons
  - meds
  - sleep
  - food
  - toilet
  - quick note
  - same sizing and palette rules
- [ ] Role labels
  - Care Owner
  - Care Partner
  - Caregiver
  - Therapist
  - shared formatting helper

### Priority 3

- [ ] Card styling
  - radius
  - shadow
  - white surface
  - border light
  - selected states
- [ ] Empty states
  - blank canvas message
  - no entries state
  - no streak yet state
  - no care team yet state

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
