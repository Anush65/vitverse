# VITVerse Student Profile + App History Feature Package

Suggested branch: `feature/profile`

## Contents
- `frontend/src/pages/Profile.jsx` — student profile and date-filterable activity history.
- `frontend/src/pages/DashboardProfile.css` — styling used by the Profile page.
- `frontend/src/services/dashboardProfileApi.js` — API helper for profile and history requests.

## Profile fields
Student photo, register number, VIT email, program, branch, school, frequent bus route, and hostel block only when the student is a hostel resident. No wallet feature is included.

## App History
Date range and service filters for bus bookings, canteen orders and marketplace activity. The backend should provide actual records and stable IDs to prevent duplicate entries.

## Integration
Copy the files into matching paths in the existing VITVerse frontend. Add a route for `Profile` using the project's existing router and pass `initialUser` / `onBack` props if applicable.

The API helper uses proposed endpoints `/api/profile/me` and `/api/profile/history`. Update endpoint paths and auth handling to match the real backend. Real history requires backend integration; this package does not claim those endpoints already exist.

This is a feature package, not a complete standalone Vite project; integrate it into the existing app before running it.
