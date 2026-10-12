# PROJECT_CONTEXT.md

## Overview
VITVerse — centralized web platform for VIT students (marketplace, canteen queue,
bus booking, hostel exchange, food sharing, notices). College Software
Engineering project. Progressive Web Application.

## Tech Stack
- Frontend: React + Vite (JavaScript), React Router, axios, @react-oauth/google
- Backend: Node.js + Express.js (JavaScript, monolithic)
- Database: MongoDB (Atlas free tier) + Mongoose
- Auth: Email/password (bcryptjs + JWT) and Google OAuth, both VIT-domain restricted
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
│   ├── pages/          Login, Register, Dashboard, Profile, Notices, AdminNotices, Canteen
│   ├── components/     Navbar, ProtectedRoute
│   ├── layouts/         AppLayout (navbar + content, for logged-in pages)
│   ├── context/         AuthContext (user/login/logout/google), ThemeContext (dark/light)
│   ├── services/        api.js (axios instance, auto-attaches JWT)
│   └── index.css        design tokens (CSS variables) + shared btn/input/card classes
├── backend/src/
│   ├── controllers/     authController, userController, noticeController, canteenController, queueController
│   ├── routes/          authRoutes (/api/auth), userRoutes (/api/users),
│   │                    noticeRoutes (/api/notices), canteenRoutes (/api/canteen)
│   ├── models/          User, Notice, Canteen, Queue
│   ├── middleware/      authMiddleware (protect), adminMiddleware (adminOnly)
│   ├── config/          db.js (Mongoose connection)
│   ├── app.js / server.js
├── PROJECT_CONTEXT.md
└── README.md
```

## Database Models
- **User**: `name`, `email` (unique, regex-restricted to `@vitstudent.ac.in`), `password` (bcrypt hash, optional if `googleId` set), `googleId` (sparse unique), `role` (`student`|`admin`, default `student`).
- **Notice**: `title`, `content`, `category` (enum), `createdBy` (ref User). Admin-only write.
- **Canteen**: `name`, `location`, `avgServingMinutes` (default 3), `isOpen`.
- **Queue**: `canteen` (ref), `user` (ref), `status` (`waiting`|`served`|`cancelled`), `servedAt`. Position/ETA computed on read, not stored.
- Planned later: MarketplaceItem, BusRoute, BusBooking, Notification, FoodShare, HostelItem.

## Authentication Architecture
- Register: `POST /api/auth/register` — hashes password (bcrypt, cost 10), creates User.
- Login: `POST /api/auth/login` — verifies via `bcrypt.compare`, issues JWT (`{id}`, 7d expiry, signed with `JWT_SECRET`).
- Google OAuth: `POST /api/auth/google` — frontend gets a Google ID token via `@react-oauth/google`'s `<GoogleLogin>`, backend verifies it with `google-auth-library` (`audience` = our Client ID), enforces `@vitstudent.ac.in` on the verified email, creates/links a User by `googleId`.
- Protected routes: `authMiddleware.protect` reads `Authorization: Bearer <token>`, verifies, sets `req.userId`.
- Admin routes: `adminMiddleware.adminOnly` (checks `User.role === "admin"`) — **note:** a near-identical check is inlined directly in `noticeRoutes.js` rather than importing the shared middleware, to avoid a cross-feature edit/merge conflict while multiple people built features in parallel. Worth unifying later.
- Frontend: `AuthContext` holds `user`; token + user cached in `localStorage`; axios interceptor attaches token to every request; `ProtectedRoute` redirects to `/login` if no user.

## UI / Design System
- CSS custom properties in `index.css` (`--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, etc.), redefined under `[data-theme="dark"]`.
- `ThemeContext` toggles `data-theme` on `<html>`, defaults to OS preference (`prefers-color-scheme`), persists choice in `localStorage`.
- Shared classes: `.btn`, `.btn-secondary`, `.input`, `.card` — reused across all pages/features going forward instead of ad-hoc styling.
- `AppLayout` (Navbar + content) wraps logged-in pages; Login/Register are standalone centered cards.

## API Conventions
Base path `/api/...`. Built so far:
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`
- `GET /api/users/me` (protected), `PUT /api/users/me` (protected)
- `GET/POST/PUT/DELETE /api/notices[/:id]` (read: any logged-in user; write: admin)
- `GET /api/canteen/canteens`, `POST /api/canteen/canteens` (admin)
- `GET /api/canteen/queues?canteenId=`, `GET /api/canteen/queues/me`,
  `POST /api/canteen/queues/join`, `DELETE /api/canteen/queues/:id`,
  `PUT /api/canteen/queues/:id/serve` (admin)

## Completed Tasks
- Repo scaffolding, MongoDB connection + User model
- Auth: register/login (bcrypt+JWT), Google OAuth, protected `/api/users/me`
- Frontend auth (Login/Register/Dashboard, AuthContext, ProtectedRoute)
- UI design system (dark/light theme, shared components, Navbar/AppLayout)
- Profile page (view + edit name)
- Notices module (Member 2): list/admin-manage notices
- Canteen Queue module: join/leave a canteen's virtual queue, live position + ETA (polled every 5s), admin create-canteen/serve-next

## Current Task
Canteen Queue module done. Teammates concurrently building Marketplace and Bus Booking on their own branches (not yet merged into this branch).

## Pending Tasks (high-level, see Gantt for full breakdown)
Marketplace, Bus Booking (in progress by teammates) -> Hostel Exchange / Food Sharing ->
Notifications -> Admin panel -> Integration -> Testing -> Deployment.

## Team Ownership
| Member | Owns |
|---|---|
| Member 1 (you) | Frontend foundation, Auth (email+Google), Profile, Canteen Queue |
| Member 2 | Marketplace, Hostel Exchange, Food Sharing, Notices |
| Member 3 | Backend infra, Bus Booking, Notifications, Admin |

## Git Workflow
Branches: `main`, `develop`, `feature/*` (teammates use `feature/notices`, etc., merged via PR).
Claude commits + pushes its own changes directly to the harness-assigned branch;
the user and teammates work from separate local/VS Code clones and push their own
commits — **pull before starting each session** to stay in sync and minimize
merge conflicts. When adding a new feature that touches shared files
(`app.js`, `App.jsx`, `Navbar.jsx`), make small additive edits near existing
similar lines rather than restructuring, to reduce conflict surface with
teammates editing the same files concurrently.

## Environment Variables
Backend `.env` (see `backend/.env.example`):
- `PORT`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`
Frontend `.env` (see `frontend/.env.example`):
- `VITE_GOOGLE_CLIENT_ID`

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
- Canteen Queue position/ETA computed on read (count of earlier `waiting`
  entries), never stored, so it self-corrects if someone ahead leaves.
- `adminMiddleware.js` duplicates `noticeRoutes.js`'s inline admin check
  rather than refactoring that file, to avoid a merge conflict while features
  were being built in parallel. Should be unified once everyone's merged.

## Known Issues
- `npm audit` flags a high-severity issue in `source-map-js` (a build-time
  transitive dependency, not runtime-exploitable) — not yet addressed.
