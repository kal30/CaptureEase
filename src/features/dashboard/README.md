# Dashboard Feature

This folder is the home for dashboard-specific behavior.

## Structure

- `DashboardPage.js`
  - route-level orchestration
  - decides mobile vs desktop presentation
  - wires dashboard actions to modals and navigation
- `mobile/`
  - mobile-specific dashboard views and interactions
- `desktop/`
  - desktop-specific dashboard views and interactions
- `shared/`
  - state/context and UI used by both layouts

## Refactor rule

Keep the same dashboard features available on mobile and desktop, but let each layout own its presentation details. Shared data access, permissions, and business rules should stay outside the view layer.
