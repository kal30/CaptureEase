# Lifelog Environment Plan

## Current problem

This repo currently mixes three separate concerns:

1. Brand/domain
2. Git branch
3. Firebase project / database

That causes confusion because the app decides which Firebase project to use at runtime based on hostname in [`src/services/firebase.js`](/Users/kalyani/projects/CaptureEase/src/services/firebase.js), while local deploy defaults are controlled separately in [`.firebaserc`](/Users/kalyani/projects/CaptureEase/.firebaserc).

Today that means:

- `lifelog.care` is treated as "staging" in code.
- Firebase default deploy project is `lifelog-tracker`.
- Old production notes still point at `captureez.com` and `captureease-ef82f` in [`DEPLOYMENT.md`](/Users/kalyani/projects/CaptureEase/DEPLOYMENT.md).

## Recommended end state

Use **one product name**: `Lifelog`

Use **two environments only**:

- `prod`
- `test`

Use **one explicit environment selector at build/deploy time**, not hostname-based database switching in the browser.

Recommended mapping:

- `prod`
  - Domain: `lifelog.care`
  - Firebase project: your chosen production project
  - Real user data
- `test`
  - Domain: `test.lifelog.care` or `staging.lifelog.care`
  - Firebase project: your chosen test project
  - Safe test/demo data only

## Important decisions

### 1. Do not use branches as environments

Branches should represent code history, not data destinations.

Suggested git flow:

- `main` = code that is closest to shipping
- optional `develop` or `staging` branch = integration branch if you want one
- feature branches for work

The database used by the app should come from environment config, not from the branch name.

### 2. Pick one production database as the source of truth

Before changing code, decide which Firebase project will become the long-term production home:

- Option A: keep `lifelog-tracker` as production
- Option B: keep `captureease-ef82f` as production
- Option C: create a brand-new `lifelog-prod` project and migrate into it

Best practical choice:

- Keep the project that already contains the correct real customer data as production.
- Keep the other project as test only, or archive it after migration.

Do not try to have both acting as production.

### 3. Give test and prod separate domains

Recommended:

- `lifelog.care` -> production
- `test.lifelog.care` -> test

Avoid pointing the public domain at the test database.

## Cleanup plan

### Phase 1: Freeze and audit

1. Pause deploys until the mapping is confirmed.
2. Inventory both Firebase projects:
   - Auth users
   - Firestore collections
   - Storage files
   - Functions config / secrets
   - Hosting domains
3. Decide which project is prod and which is test.
4. Export both databases before any migration.

### Phase 2: Make environment selection explicit

Replace hardcoded dual-config hostname logic in [`src/services/firebase.js`](/Users/kalyani/projects/CaptureEase/src/services/firebase.js) with env-driven config.

Target shape:

- `.env.development`
- `.env.test`
- `.env.production`

Each file should define:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`
- `REACT_APP_APP_ENV`

Then the app should initialize exactly one Firebase project from env vars.

That removes hidden logic like:

- "if hostname is `lifelog.care`, use staging"
- "if local default firebase project is X, deploy there"

### Phase 3: Make deploy targets explicit

Update [`.firebaserc`](/Users/kalyani/projects/CaptureEase/.firebaserc) so aliases reflect the real environments, for example:

- `prod`
- `test`

Deploy commands should always specify the project alias explicitly, for example:

- `firebase deploy --project prod`
- `firebase deploy --project test`

Do not rely on `default` for important deploys.

### Phase 4: Point domains correctly

Set domain mapping so:

- `lifelog.care` serves the production Hosting site
- `test.lifelog.care` serves the test Hosting site

Once production is confirmed on `lifelog.care`, remove any logic that treats that domain as staging.

### Phase 5: Migrate data once

If the real data is split across projects:

1. Pick the final production project.
2. Migrate only the data that should live there permanently.
3. Validate auth and document references carefully.
4. Freeze writes to the old production source during cutover.
5. Cut traffic to the new production target.

If needed, do a one-time backfill into test later, but never keep bi-directional manual syncing.

### Phase 6: Clean brand leftovers

Update remaining `captureez` / `carelog` references where they are user-facing or operationally confusing.

Known files that still need review:

- [`src/services/firebase.js`](/Users/kalyani/projects/CaptureEase/src/services/firebase.js)
- [`DEPLOYMENT.md`](/Users/kalyani/projects/CaptureEase/DEPLOYMENT.md)
- [`public/index.html`](/Users/kalyani/projects/CaptureEase/public/index.html)
- [`functions/index.js`](/Users/kalyani/projects/CaptureEase/functions/index.js)
- [`package.json`](/Users/kalyani/projects/CaptureEase/package.json)

Not every internal identifier must be renamed immediately, but env names must be clear.

## Minimal safe rule set

If you want the shortest path with the least confusion:

- `lifelog.care` = production only
- `test.lifelog.care` = test only
- one Firebase project per environment
- one build config per environment
- deploy commands always specify `--project`
- no runtime hostname switching for database selection

## Suggested next implementation tasks

1. Convert Firebase config in the React app to env vars only.
2. Rename Firebase aliases in [`.firebaserc`](/Users/kalyani/projects/CaptureEase/.firebaserc) to `prod` and `test`.
3. Add explicit npm deploy scripts for test and prod.
4. Update docs to reflect `lifelog` as the only public product name.
5. Plan a one-time database migration after identifying the true production dataset.
