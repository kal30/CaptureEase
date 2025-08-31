# CLAUDE.md

> **Purpose**  
> This document tells you (Claude) how to write good, consistent code for the **CaptureEase** project.  
> Follow these rules unless a file explicitly documents an exception.

---

## 1) Project Snapshot

- **App**: CaptureEase — caregiver/parent PWA for logging mood, sleep, energy, notes, media, and messaging for each child.
- **Stack**
  - React (functional components, hooks, React Router)
  - Firebase: Hosting, Auth (Google only), Firestore, Storage, Functions (Node 18 when needed)
  - Styling: Material UI or Tailwind (centralized theme/colors)
  - Tooling: ESLint + Prettier, Jest + React Testing Library
- **Hosting**: Firebase Hosting (`www.captureez.com`)
- **Palette**
  - Grape `#94618E` (primary)
  - Eggplant `#49274A` (dark)
  - Sand `#F4DECB` (surface)
  - Shell `#F8EEE7` (background)

---

## 2) File/Folder Structure

/src
/components # Reusable presentational UI
/pages # Route-level pages
/features # Optional self-contained features
/hooks # Custom React hooks
/services # Firebase logic (Firestore/Storage/Auth wrappers)
/utils # Helpers, constants, formatters
/theme # Centralized color palette + theme
App.js
router.js
index.js

**Rule of thumb**:

- **Pages** fetch data and manage state.
- **Components** render UI.
- **Services** handle Firebase calls.
- **Hooks** orchestrate data fetching with React.

## 3. Technology Stack

- **Backend:** Firebase Cloud Functions running on Node.js
- **Platform**: Firebase Cloud Functions (firebase-functions v6.4.0)
- **Frontend:** Framework: React v18.3.1, Tailwind CSS 3.4, and minimal JavaScript with Alpine.js. We use React 18.2 on other projects.
- **Database:** Google Cloud Firestore.
- **Authentication:** Firebase Authentication using Google OAuth.
- **Storage**: Google Cloud Storage.
- **Testing**: Jest + React Testing Library.
- **UI Library**: Material-UI (MUI) v7.2.0
- **Build Tool**: Create React App (react-scripts v5.0.1)

## 4) Code Style

- **Language**: Plain JavaScript (`.js`) with JSDoc comments for clarity.
- **Components**: Functional only, small, reusable.
- **State**: Local with `useState`, data from Firestore via hooks.
- **Error handling**: Always wrap async Firebase calls in `try/catch`.
- **Loading/Error/Empty states**: Required in all UI lists/forms.
- **Accessibility**: Use semantic HTML, ARIA where needed.
- **Linting**: Must pass ESLint + Prettier before merge.

## 8. Coding Standards & Design Philosophy

- **Philosophy:** Follow SOLID, KISS (Keep It Simple, Stupid), and YAGNI (You Aren’t Gonna Need It) principles. Prefer clear, self-documenting code over excessive comments.
- **Naming:** Follow `CamelCase`, functions are `snake_case`.
- **Styling:** Use 2-space indentation (enforced by `mix format`).
