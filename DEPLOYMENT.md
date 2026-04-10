# Deployment Notes

## Production Domain

- Public production domain: `https://lifelog.care/`
- Recommended test domain: `https://test.lifelog.care/`

## Hosting Setup

- Production Firebase project ID: `lifelog-tracker`
- Firebase alias used by this repo for production: `prod`
- Current default Firebase project in this repo: `lifelog-tracker`
- Deploy command:

```bash
npm run deploy:prod
```

## Test Setup

- Test should use a separate Firebase project from production.
- Do not point test builds at `lifelog-tracker`.
- Current test Firebase project ID: `lifelog-test-aa7d6`
- Firebase alias used by this repo for test: `test`
- Use `REACT_APP_APP_ENV=test` plus explicit Firebase env vars for that project.
- Test deploy command:

```bash
npm run deploy:test
```

## Domain Registrar

- Domain registrar / DNS account: `Namecheap`
- Domain currently in use for production: `lifelog.care`

## Important

- Public product name / brand: `Lifelog`
- Production Firestore lives in Firebase project `lifelog-tracker`.
- The app should not choose a database based on hostname anymore.
- Production should be selected explicitly by environment config.
- Test should be a separate Firebase project and separate domain.

## Files To Check

- Firebase project: [/Users/kalyani/projects/CaptureEase/.firebaserc](/Users/kalyani/projects/CaptureEase/.firebaserc)
- Hosting target: [/Users/kalyani/projects/CaptureEase/firebase.json](/Users/kalyani/projects/CaptureEase/firebase.json)
- Firebase app config: [/Users/kalyani/projects/CaptureEase/src/services/firebase.js](/Users/kalyani/projects/CaptureEase/src/services/firebase.js)
- Team notes: [/Users/kalyani/projects/CaptureEase/CLAUDE.md](/Users/kalyani/projects/CaptureEase/CLAUDE.md)
