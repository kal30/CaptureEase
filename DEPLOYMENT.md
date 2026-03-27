# Deployment Notes

## Production Domain

- Public production domain: `https://www.captureez.com/`
- Apex domain: `https://captureez.com/`

## Hosting Setup

- Firebase project ID: `captureease-ef82f`
- Firebase Hosting site ID used by this repo: `carelog`
- Deploy command:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Domain Registrar

- Domain registrar / DNS account: `Namecheap`
- Domain currently found in the Namecheap account under: `captureez.com`
- Current expiration shown by registrar: `August 12, 2026`

## Important

- Public product name / brand: `CaptureEz`
- This repo deploys to the Firebase Hosting site `carelog`.
- That Hosting site is what serves `captureez.com`.
- Firebase project ID `captureease-ef82f` and Hosting site ID `carelog` are internal identifiers.
- Do not rename the Firebase project or Hosting site casually. The names are internal identifiers and do not need to match the public brand.

## Files To Check

- Firebase project: [/Users/kalyani/projects/CaptureEase/.firebaserc](/Users/kalyani/projects/CaptureEase/.firebaserc)
- Hosting target: [/Users/kalyani/projects/CaptureEase/firebase.json](/Users/kalyani/projects/CaptureEase/firebase.json)
- Team notes: [/Users/kalyani/projects/CaptureEase/CLAUDE.md](/Users/kalyani/projects/CaptureEase/CLAUDE.md)
