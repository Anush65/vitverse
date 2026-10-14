# VITVerse Dashboard Feature Package

Suggested branch: `feature/dashboard`

## Contents
- `frontend/src/pages/Dashboard.jsx` — dashboard page with live time/date, navigation menu, student summary, notification area and service cards.
- `frontend/src/pages/DashboardProfile.css` — styling used by the dashboard page.
- `frontend/src/components/ServiceCard.jsx` — reusable campus-service card.
- `frontend/src/services/dashboardProfileApi.js` — API helper shared with the Profile package; see notes below.

## Integration
Copy the files into the matching paths in the existing VITVerse frontend. Do not replace the whole `src` folder. Add a route for `Dashboard` using the project's existing router and pass `user` and `onNavigate` props if available.

The API helper uses proposed endpoints `/api/dashboard`, `/api/profile/me`, and `/api/profile/history`. Update the paths and authentication handling to match the existing backend. Until the backend endpoints exist, the UI may show an API connection message; this package does not claim those endpoints already exist.

This is a feature package, not a complete standalone Vite project; integrate it into the existing app before running it.
