# VITVerse

A centralized web platform for VIT students — marketplace, canteen ordering, bus booking, and campus notices, all in one place instead of scattered across WhatsApp groups and physical queues.

Built as a Software Engineering college project, with a working PWA, a REST API backend, and a MongoDB database behind it.

## Features

- **Authentication** — Email/password (VIT-domain restricted) and Google OAuth, JWT-based sessions, admin roles.
- **Marketplace** — Buy, sell, and rent items with fellow students. Search, filter by category/price/type, image uploads.
- **Canteen** — Order food ahead from campus canteens (menu, cart, checkout, order tracking), or join a live virtual queue instead of standing in line.
- **Bus Booking** — Reserve a seat on the campus shuttle with a live seat map, time-windowed booking to mirror real boarding procedure.
- **Notices** — A single feed for academic announcements, placement drives, and campus events, with admin-managed publishing.
- **Profile** — Student details (branch, year, hostel block, bio) and at-a-glance activity stats.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Framer Motion, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcrypt, Google OAuth (`google-auth-library`) |
| File uploads | Multer |

No TypeScript, Redux, or Docker — kept deliberately simple for a monolithic college project.

## Architecture

```
Browser → React Frontend → REST API (HTTP) → Express Backend → Mongoose → MongoDB
```

Frontend and backend are independent apps with separate `package.json` files and dev servers, communicating only over HTTP. Auth tokens are sent as `Authorization: Bearer <token>` headers.

## Project Structure

```
VITVerse/
├── frontend/           React + Vite app
│   └── src/
│       ├── pages/       Route-level views (Landing, Login, Dashboard, Marketplace, Canteen, ...)
│       ├── components/  Reusable UI (Navbar, ProtectedRoute, ...)
│       ├── context/     Auth, Theme, Toast providers
│       ├── layouts/     Shared page chrome
│       └── services/    API client
├── backend/             Express API
│   └── src/
│       ├── controllers/ Route handlers
│       ├── routes/      Express routers
│       ├── models/      Mongoose schemas
│       ├── middleware/  Auth/admin guards
│       ├── config/      DB connection
│       └── seed.js      Demo data seeder
├── docs/                 Supplementary docs
└── PROJECT_CONTEXT.md    Architecture/decision log for contributors
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A Google OAuth Client ID (optional, only needed for "Sign in with Google")

### 1. Clone and install

```bash
git clone https://github.com/Anush65/vitverse.git
cd vitverse

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**`frontend/.env`**
```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 3. Run it

```bash
# terminal 1
cd backend && npm run dev     # http://localhost:5000

# terminal 2
cd frontend && npm run dev    # http://localhost:5173
```

The backend automatically seeds realistic demo data (users, canteens, menus, marketplace listings, notices, bus bookings) on first boot if the database is empty — no manual step required. To re-seed at any time:

```bash
cd backend && npm run seed
```

### 4. Log in

Every seeded account uses the password `password123`:

| Role | Email |
|---|---|
| Admin | `admin@vitstudent.ac.in` |
| Student | `aarav.sharma2024@vitstudent.ac.in` (and 4 more seeded students) |

## API Overview

Base path: `/api`

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/google` |
| Users | `GET /users/me`, `PUT /users/me` |
| Notices | `GET/POST/PUT/DELETE /notices[/:id]` |
| Marketplace | `GET/POST/PUT/DELETE /listings[/:id]`, `POST /uploads` |
| Canteen | `GET /canteen/canteens`, `GET /canteen/canteens/:id/menu`, queue + order endpoints under `/canteen/queues` and `/canteen/orders` |
| Bus Booking | `GET /bus-booking/availability`, `GET/POST/PATCH/DELETE /bus-booking` |

See `PROJECT_CONTEXT.md` for the full endpoint list, data models, and architectural decisions.

## Team

| Area | Owner |
|---|---|
| Frontend foundation, Auth, Profile, Canteen | Member 1 |
| Marketplace, Notices | Member 2 |
| Backend infra, Bus Booking | Member 3 |

---

A Software Engineering project built by and for VIT students.
