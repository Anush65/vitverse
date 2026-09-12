# PROJECT_CONTEXT.md

## Overview
VITVerse — centralized web platform for VIT students (marketplace, canteen queue,
bus booking, hostel exchange, food sharing, notices). College Software
Engineering project. Progressive Web Application.

## Tech Stack
- Frontend: React + Vite (JavaScript), React Router, axios
- Backend: Node.js + Express.js (JavaScript, monolithic)
- Database: MongoDB (Atlas free tier) + Mongoose
- Auth: Email/password (bcryptjs + JWT) done; Google OAuth pending, both
  VIT-domain restricted
- No TypeScript, Redux, Docker, or microservices — kept intentionally simple.

## Architecture
```
Browser -> React Frontend -> REST API (HTTP) -> Express Backend -> Mongoose -> MongoDB
```
Frontend and backend are separate apps (separate package.json, separate dev servers),
communicating only over HTTP. JWT sent as `Authorization: Bearer <token>` header
(not cookies), stored in the frontend's `localStorage`.

## Folder Structure
```
VITVerse/
├── frontend/src/
│   ├── pages/          Login, Register, Dashboard, Profile
│   ├── components/     Navbar, ProtectedRoute
│   ├── layouts/         AppLayout (navbar + content, for logged-in pages)
│   ├── context/         AuthContext (user/login/logout), ThemeContext (dark/light)
│   ├── services/        api.js (axios instance, auto-attaches JWT)
│   └── index.css        design tokens (CSS variables) + shared btn/input/card classes
├── backend/src/
│   ├── controllers/     authController (register/login), userController (getMe/updateMe)
│   ├── routes/          authRoutes (/api/auth), userRoutes (/api/users)
│   ├── models/          User
│   ├── middleware/      authMiddleware (protect: verifies JWT, sets req.userId)
│   ├── config/          db.js (Mongoose connection)
│   ├── app.js / server.js
├── PROJECT_CONTEXT.md
└── README.md
```

## Database Models
- **User**: `name`, `email` (unique, regex-restricted to `@vitstudent.ac.in`), `password` (bcrypt hash), timestamps.
- Planned later: MarketplaceItem, Queue, Canteen, BusRoute, BusBooking, Notification, Notice, FoodShare, HostelItem.

## Authentication Architecture
- Register: `POST /api/auth/register` — hashes password (bcrypt, cost 10), creates User.
- Login: `POST /api/auth/login` — verifies via `bcrypt.compare`, issues JWT (`{id}`, 7d expiry, signed with `JWT_SECRET`).
- Protected routes: `authMiddleware.protect` reads `Authorization: Bearer <token>`, verifies, sets `req.userId`.
- Frontend: `AuthContext` holds `user`; token + user cached in `localStorage`; axios interceptor attaches token to every request; `ProtectedRoute` redirects to `/login` if no user.
- Google OAuth: not yet implemented (next task) — will need Google Cloud Console credentials, backend token verification, VIT-domain check on the verified email.

## UI / Design System
- CSS custom properties in `index.css` (`--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, etc.), redefined under `[data-theme="dark"]`.
- `ThemeContext` toggles `data-theme` on `<html>`, defaults to OS preference (`prefers-color-scheme`), persists choice in `localStorage`.
- Shared classes: `.btn`, `.btn-secondary`, `.input`, `.card` — reused across all pages/features going forward instead of ad-hoc styling.
- `AppLayout` (Navbar + content) wraps logged-in pages (Dashboard, Profile); Login/Register are standalone centered cards.

## API Conventions
Base path `/api/...`. Built so far:
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/users/me` (protected), `PUT /api/users/me` (protected)

## Completed Tasks
- Repo scaffolding (frontend + backend skeletons)
- MongoDB connection + User model
- Register/Login endpoints (bcrypt + JWT)
- Auth middleware + protected `/api/users/me`
- Frontend auth (Login/Register pages, AuthContext, ProtectedRoute)
- UI design system (dark/light theme, shared components, Navbar/AppLayout)
- Profile page (view + edit name)

## Current Task
UI design system and Profile page done. Next: Google OAuth.

## Pending Tasks (high-level, see Gantt for full breakdown)
Google OAuth -> Marketplace -> Canteen Queue -> Bus Booking ->
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
Claude commits + pushes its own changes to the harness branch; the user
commits separately from a local VS Code clone — pull before starting each
session to stay in sync.

## Environment Variables
Backend `.env` (see `backend/.env.example`):
- `PORT` — backend server port (default 5000)
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — signing secret for JWTs (any long random string)

## Run Commands
- Frontend: `cd frontend && npm install && npm run dev` (serves on :5173)
- Backend: `cd backend && npm install && npm run dev` (serves on :5000, needs `.env`)
- After every `git pull`, re-run `npm install` in any folder whose `package.json` changed.

## Testing
Manual testing via Postman (collection not yet exported to repo) at feature
checkpoints, not after every file change. Formal automated unit/integration
tests are deferred to the dedicated Testing phase later in the plan.

## Important Decisions
- No root-level workspace/monorepo tooling — frontend/backend are independent
  npm projects for simplicity.
- Express 5.x installed (current default via `npm install express`).
- JWT via `Authorization` header + `localStorage` (not cookies) — simpler
  CORS/config for a separate frontend/backend setup.
- Node's DNS resolver needed `dns.setServers(["8.8.8.8","8.8.4.4"])` in
  `config/db.js` to work around a Windows issue with `mongodb+srv://` lookups.

## Known Issues
None currently open.
