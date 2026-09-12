# PROJECT_CONTEXT.md

## Overview
VITVerse — centralized web platform for VIT students (marketplace, canteen queue,
bus booking, hostel exchange, food sharing, notices). College Software
Engineering project. Progressive Web Application.

## Tech Stack
- Frontend: React + Vite (JavaScript), React Router
- Backend: Node.js + Express.js (JavaScript, monolithic)
- Database: MongoDB (Atlas free tier) + Mongoose
- Auth: Email/password (bcryptjs) + Google OAuth, VIT-domain restricted
- No TypeScript, Redux, Docker, or microservices — kept intentionally simple.

## Architecture
```
Browser -> React Frontend -> REST API (HTTP) -> Express Backend -> Mongoose -> MongoDB
```
Frontend and backend are separate apps (separate package.json, separate dev servers),
communicating only over HTTP.

## Folder Structure
```
VITVerse/
├── frontend/          React + Vite app (npm create vite, template: react)
├── backend/
│   └── src/
│       ├── controllers/   request handling logic (per feature)
│       ├── routes/        Express route definitions
│       ├── models/        Mongoose schemas
│       ├── middleware/    auth checks, error handling, etc.
│       ├── services/      business logic reused across controllers
│       ├── config/        e.g. DB connection setup
│       ├── utils/         small helpers
│       ├── app.js         Express app setup (middleware + routes)
│       └── server.js      entry point, starts the HTTP server
├── PROJECT_CONTEXT.md
└── README.md
```

## Database Models
None yet. Planned (created only when their feature is built):
User, MarketplaceItem, Queue, Canteen, BusRoute, BusBooking, Notification,
Notice, FoodShare, HostelItem.

## Authentication Architecture
Not yet implemented. Planned: bcryptjs password hashing + JWT (or session) for
email/password; Google OAuth restricted to VIT domain, backend-verified.

## API Conventions
Base path: `/api/...` (e.g. `/api/auth/register`, `/api/marketplace`).
Not yet built beyond a health check.

## Completed Tasks
- Repo scaffolding: frontend (Vite+React) and backend (Express) skeletons created.
- Backend: `GET /api/health` returns `{status: "ok"}` — verified working.
- Frontend: default Vite React app — verified `npm run dev` serves on :5173.

## Current Task
Scaffolding complete. Next: Authentication module (backend user model + register/login).

## Pending Tasks (high-level, see Gantt for full breakdown)
Auth -> Marketplace -> Canteen Queue -> Bus Booking -> Profile ->
Hostel/Food/Notices -> Notifications -> Admin -> Integration -> Testing -> Deployment.

## Team Ownership
| Member | Owns |
|---|---|
| Member 1 (frontend lead) | Frontend foundation, Auth (email+Google), Profile |
| Member 2 | Marketplace, Hostel Exchange, Food Sharing, Notices |
| Member 3 | Backend infra, Canteen, Bus, Notifications, Admin |

## Git Workflow
Branches: `main`, `develop`, `feature/*`. (Current dev session works on a
harness-assigned branch; real feature branches to be cut from `develop` per
the plan above once the team starts working in parallel.)

## Environment Variables
Backend `.env` (see `backend/.env.example`):
- `PORT` — backend server port (default 5000)

## Run Commands
- Frontend: `cd frontend && npm install && npm run dev` (serves on :5173)
- Backend: `cd backend && npm install && npm run dev` (serves on :5000, needs `.env`)

## Important Decisions
- No root-level workspace/monorepo tooling — frontend/backend are independent
  npm projects for simplicity.
- Express 5.x installed (current default via `npm install express`).

## Known Issues
None yet.
