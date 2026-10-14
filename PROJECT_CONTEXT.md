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
│   ├── pages/      Login, Register, Dashboard, Profile, Notices, AdminNotices,
│   │               Canteen, Marketplace, BusBooking (ActivityHistory: built, not wired)
│   ├── components/ Navbar, ProtectedRoute
│   ├── layouts/     AppLayout (navbar + content, for logged-in pages)
│   ├── context/     AuthContext (user/login/logout/google), ThemeContext (dark/light)
│   ├── services/    api.js (axios instance, auto-attaches JWT), dashboardProfileApi.js (unused)
│   └── index.css    design tokens (CSS variables) + shared btn/input/card classes
├── backend/src/
│   ├── controllers/ authController, userController, noticeController,
│   │                canteenController, queueController, listingController
│   ├── routes/      authRoutes (/api/auth), userRoutes (/api/users),
│   │                noticeRoutes (/api/notices), canteenRoutes (/api/canteen),
│   │                listingRoutes (/api/listings), uploadRoutes (/api/uploads),
│   │                busBookingRoutes (/api/bus-booking)
│   ├── models/      User, Notice, Canteen, Queue, Listing, BusBooking, BusNotice
│   ├── middleware/  authMiddleware (protect), adminMiddleware (adminOnly)
│   ├── config/      db.js (Mongoose connection)
│   ├── seed.js      demo-data seed script (see Testing section)
│   ├── app.js / server.js
├── docs/            bus-booking-testing-checklist.md
├── PROJECT_CONTEXT.md
└── README.md
```
All backend code now lives under `backend/src/` consistently — an earlier
upload had put Bus Booking's models/routes directly under `backend/models`
and `backend/routes` (outside `src/`), and that route wasn't mounted in
`app.js` at all, so Bus Booking was completely unreachable until this pass.

## Database Models
- **User**: `name`, `email` (unique, regex-restricted to `@vitstudent.ac.in`), `password` (bcrypt hash, optional if `googleId` set), `googleId` (sparse unique), `role` (`student`|`admin`, default `student`).
- **Notice**: `title`, `content`, `category` (enum), `createdBy` (ref User). Admin-only write.
- **Canteen**: `name`, `location`, `avgServingMinutes` (default 3), `isOpen`.
- **Queue**: `canteen` (ref), `user` (ref), `status` (`waiting`|`served`|`cancelled`), `servedAt`. Position/ETA computed on read, not stored.
- **Listing** (Marketplace): `seller` (ref), `title`, `description`, `category` (enum), `type` (`sell`|`rent`), `price`, `rentalPeriod` (required if renting), `condition`, `images` (array of URLs), `status`.
- **MenuItem**: `canteen` (ref), `name`, `description`, `price`, `category` (enum: Meals/Snacks/Fast Food/Beverages/Desserts), `isVeg`, `image`, `available`.
- **Order**: `user` (ref), `canteen` (ref), `items` ([{menuItem ref, name, price, quantity} snapshot at order time]), `totalAmount`, `status` (`placed`|`preparing`|`ready`|`completed`|`cancelled`).
- **BusBooking**: `studentId` (ref), `studentName`, `serviceDate` (YYYY-MM-DD, IST), `route` (enum, 3 fixed routes), `busNumber`, `seatId`, `status`, `bookingCode` (unique), `biometricVerified`, timestamps. Unique compound indexes prevent double-booking (one active booking per student per day; one per bus/seat per day).
- **BusNotice**: `studentId` (ref), `title`, `message`, `type` (enum), `bookingId` (ref), `read`.
- Planned later: Notification, FoodShare, HostelItem.

## Authentication Architecture
- Register: `POST /api/auth/register` — hashes password (bcrypt, cost 10), creates User.
- Login: `POST /api/auth/login` — verifies via `bcrypt.compare`, issues JWT (`{id}`, 7d expiry, signed with `JWT_SECRET`).
- Google OAuth: `POST /api/auth/google` — frontend gets a Google ID token via `@react-oauth/google`'s `<GoogleLogin>`, backend verifies it with `google-auth-library` (`audience` = our Client ID), enforces `@vitstudent.ac.in` on the verified email, creates/links a User by `googleId`.
- Protected routes: `authMiddleware.protect` reads `Authorization: Bearer <token>`, verifies, sets `req.userId` (a string — NOT `req.user`; the Bus Booking module originally assumed `req.user` and was silently broken until fixed).
- Admin routes: `adminMiddleware.adminOnly` (checks `User.role === "admin"`) — **note:** a near-identical check is inlined directly in `noticeRoutes.js` rather than importing the shared middleware, to avoid a cross-feature edit/merge conflict while multiple people built features in parallel. Worth unifying later.
- Frontend: `AuthContext` holds `user`; token + user cached in `localStorage`; axios interceptor attaches token to every request; `ProtectedRoute` redirects to `/login` if no user.

## UI / Design System
- Font: Google Fonts "Plus Jakarta Sans", loaded via `<link>` in `index.html`.
- CSS custom properties in `index.css` (`--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, `--color-primary-soft`, `--gradient-brand`, `--shadow-card`/`--shadow-card-hover`, etc.), redefined under `[data-theme="dark"]`. Indigo/violet brand palette (`#6a5bf6`).
- `ThemeContext` toggles `data-theme` on `<html>`, defaults to OS preference (`prefers-color-scheme`), persists choice in `localStorage`.
- Shared classes: `.btn`, `.btn-secondary`, `.input`, `.card` — reused across all pages/features. Buttons lift + shadow on hover.
- `Navbar` is sticky, highlights the active route (`react-router`'s `NavLink`), and has an icon next to each link; collapses to icon-only on narrow screens.
- `AuthHero` component — the gradient brand panel on Login/Register (two-column layout, hidden below 860px, collapses to the plain centered card).
- `AppLayout` (Navbar + content, now 1100px max-width) wraps all logged-in pages, including Marketplace and Bus Booking; Login/Register use the two-column `AuthHero` + form layout.
- Dashboard has a gradient hero banner (time-of-day greeting) above the feature-card grid.
- Marketplace.css and BusBooking.css originally used their own disconnected CSS variable names (some tied to `prefers-color-scheme` only) and always rendered in light mode regardless of the in-app toggle — remapped to the shared tokens so the whole app now switches theme consistently.
- Verified by rendering actual pages with Playwright + screenshotting (not just build-checking) — dark/light both confirmed visually correct on Login, Register, and Dashboard.

## API Conventions
Base path `/api/...`:
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`
- `GET /api/users/me` (protected), `PUT /api/users/me` (protected)
- `GET/POST/PUT/DELETE /api/notices[/:id]` (read: any logged-in user; write: admin)
- `GET /api/canteen/canteens`, `POST /api/canteen/canteens` (admin)
- `GET /api/canteen/canteens/:id/menu`, `POST /api/canteen/canteens/:id/menu` (admin)
- `GET /api/canteen/queues?canteenId=`, `GET /api/canteen/queues/me`,
  `POST /api/canteen/queues/join`, `DELETE /api/canteen/queues/:id`,
  `PUT /api/canteen/queues/:id/serve` (admin)
- `POST /api/canteen/orders` (place order from cart), `GET /api/canteen/orders/mine`,
  `DELETE /api/canteen/orders/:id` (cancel own, only while status is `placed`),
  `PUT /api/canteen/orders/:id/status` (admin)
- `GET/POST/PUT/DELETE /api/listings[/:id]` (read: public to logged-in users; write: owner only)
- `POST /api/uploads` (multipart image upload, used by Marketplace's "list an item" form)
- `GET /api/bus-booking/availability`, `GET /api/bus-booking/mine`,
  `POST /api/bus-booking/`, `PATCH /api/bus-booking/:id`, `DELETE /api/bus-booking/:id`,
  `GET /api/bus-booking/notices/mine`, `PATCH /api/bus-booking/notices/:id/read`
  — booking/edit/cancel are time-windowed to 1:00–1:30 PM / 1:00–1:20 PM IST
  (see Known Issues).

## Completed Tasks
- Repo scaffolding, MongoDB connection + User model
- Auth: register/login (bcrypt+JWT), Google OAuth, protected `/api/users/me`
- Frontend auth (Login/Register/Dashboard, AuthContext, ProtectedRoute)
- UI design system (dark/light theme, shared components, Navbar/AppLayout)
- Profile page (view + edit name)
- Notices module: list/admin-manage notices
- Canteen Queue module: join/leave a canteen's virtual queue, live position + ETA
- Marketplace module: listings with image upload, search/filter
- Bus Booking module: seat-map booking with time windows, booking codes
- **Pre-review pass 1:** fixed a build-breaking JSX bug (malformed Marketplace
  route in `App.jsx` — the whole frontend failed to build before this),
  wired up Bus Booking end-to-end (it was never mounted in `app.js` and used
  a `req.user` field that doesn't exist in this project's auth middleware —
  completely dead until fixed), harmonized dark/light theme CSS across
  Marketplace and Bus Booking, rebuilt the Dashboard into a real feature hub,
  cleaned up stray root-level files, fixed a critical `npm audit` vulnerability,
  and wrote `backend/src/seed.js` to populate realistic demo data.
- **Pre-review pass 2:** Canteen Ordering (MenuItem + Order models, cart +
  checkout UI, order history/cancel, admin order-status update); canteens
  renamed to real references (Gymkhana, Domino's) with full menus; seed data
  greatly expanded (16 notices using real VIT event names — Riviera, Yantra/
  Central Hack, GraVITas, Pongal, RoboVITics — plus 20 marketplace listings
  and 3 sample canteen orders); major visual overhaul (Google Font, richer
  color/shadow tokens, sticky+active-state Navbar with icons, two-column
  gradient auth pages, gradient Dashboard hero).

## Current Task
Pre-review polish pass complete (2 rounds). See Known Issues for what still
needs a human — the sandbox this was done in has no network access to
MongoDB, so no DB-backed page was tested against live data. The UI itself
(Login/Register/Dashboard) was visually verified by rendering real pages
with Playwright and screenshotting both themes — not just build-checked.

## Pending Tasks (high-level, see Gantt for full breakdown)
Hostel Exchange / Food Sharing -> Notifications -> Admin panel ->
Integration -> Testing -> Deployment.

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
similar lines rather than restructuring.

## Environment Variables
Backend `.env` (see `backend/.env.example`):
- `PORT`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`
Frontend `.env` (see `frontend/.env.example`):
- `VITE_GOOGLE_CLIENT_ID`

## Run Commands
- Frontend: `cd frontend && npm install && npm run dev` (serves on :5173)
- Backend: `cd backend && npm install && npm run dev` (serves on :5000, needs `.env`)
- Seed demo data: `cd backend && npm run seed` (safe to re-run — upserts users,
  replaces feature data; prints demo login credentials when done)
- After every `git pull`, re-run `npm install` in any folder whose `package.json` changed.

## Testing
Manual testing via Postman/browser at feature checkpoints. Formal automated
unit/integration tests are deferred to the dedicated Testing phase later in
the plan. `backend/src/seed.js` exists specifically to make manual demo
testing fast and consistent — run it, then log in with any seeded account
(password `password123`) to see every module populated: 2 canteens with full
menus + live queue + sample orders, 16 notices, 20 marketplace listings,
3 bus bookings.

## Important Decisions
- No root-level workspace/monorepo tooling — frontend/backend are independent npm projects.
- Express 5.x installed (current default via `npm install express`).
- JWT via `Authorization` header + `localStorage` (not cookies) — simpler
  CORS/config for a separate frontend/backend setup.
- Node's DNS resolver needed `dns.setServers(["8.8.8.8","8.8.4.4"])` in
  `config/db.js` to work around a Windows issue with `mongodb+srv://` lookups.
- Canteen Queue position/ETA computed on read, never stored, so it self-corrects.
- `adminMiddleware.js` duplicates `noticeRoutes.js`'s inline admin check
  rather than refactoring that file, to avoid a merge conflict. Should be
  unified once everyone's merged.
- The orphaned "Profile + App History" feature (originally uploaded loose at
  repo root) was filed into `frontend/src/pages/ActivityHistory.jsx` +
  `frontend/src/services/dashboardProfileApi.js` for tidiness, but
  deliberately **not wired into any route** — it calls backend endpoints
  (`/api/profile/me`, `/api/profile/history`, `/api/dashboard`) that don't
  exist yet. Building those aggregator endpoints under review-day time
  pressure was judged riskier than leaving it as documented future work.

## Known Issues
- **Bus Booking's booking/edit/cancel actions only work 1:00–1:30 PM IST**
  (edit/cancel until 1:20 PM) — this is intentional, matching the activity
  diagram's time-windowed design, but means a live demo outside that window
  can only show the seeded bookings and seat map, not create a new one.
  Decide before presenting: demo live during that window, or explain the
  constraint and show seeded data instead. Not changed without asking, since
  it's deliberate business logic, not a bug.
- This whole pre-review effort was done in a sandboxed environment with no
  network access to MongoDB (DNS/raw TCP both blocked, only an HTTPS proxy
  available) — every backend/DB-dependent change was verified by full
  production builds, syntax checks, and manual schema/logic review only,
  **never against a live database**. The frontend's visual design (Login,
  Register, Dashboard) *was* rendered and screenshotted with a real headless
  browser in both themes, so that part is confirmed working — but nothing
  behind a login (Canteen ordering, Marketplace, Bus Booking, Notices) has
  been clicked through for real. Run `npm run seed` and click through every
  module before the review.
- Canteen now has two related-but-separate concepts: the original virtual
  **queue** (position/ETA, no food involved) and the new **ordering** system
  (menu + cart + Order). Both work independently per canteen; a queue entry
  does not create an order and vice versa. Worth explaining as a deliberate
  design choice if asked in the review, not merging them under time pressure.
- `ActivityHistory.jsx` / `dashboardProfileApi.js` exist but are unwired (see
  Important Decisions).
