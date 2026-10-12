# VITVerse Bus Booking module

Drop-in React + Express + Mongoose module for the existing VITVerse project.

## Rules
- Routes: Alandur Metro (5 buses), Sholinganallur (4), Velachery (4).
- Each bus: 60 seats, 12 rows; left side has 2 seats, aisle, right side has 3.
- Daily departure: 1:45 PM IST.
- Booking: 1:00 PM to before 1:30 PM IST.
- Route edit/cancellation: 1:00 PM to before 1:20 PM IST.
- One active booking per student per day; one active booking per seat/bus/date.
- Successful booking, edit, and cancellation create notices.

## Integrate backend
1. Copy `backend/models/BusBooking.js` and `BusNotice.js` into your backend models folder.
2. Copy `backend/routes/busBooking.routes.js` into your backend routes folder.
3. In your Express entry file, after JSON middleware, add:
   ```js
   const busBookingRoutes = require('./routes/busBooking.routes');
   app.use('/api/bus-booking', busBookingRoutes);
   ```
4. Update the auth middleware import near the top of `busBooking.routes.js` to match your project. It must validate the user's token and set `req.user` with `_id` or `id`.
5. Ensure your `User` object exposes a Mongo ObjectId. Token storage on frontend defaults to `localStorage.token` or `localStorage.authToken`.

## Integrate frontend
Copy `frontend/src/pages/BusBooking.jsx` and `.css` into your frontend. Add a route in your existing router, e.g.:
```jsx
import BusBooking from './pages/BusBooking';
<Route path="/bus-booking" element={<BusBooking />} />
```
Add a navigation link labelled **Bus Booking**. The component uses `VITE_API_URL` if configured, otherwise `http://localhost:5000`.

## Notices page
The module stores notices in `BusNotice`. GET `/api/bus-booking/notices/mine` returns the signed-in student's bus notices. Merge these into the existing Notices UI, or replace `BusNotice` with your app's existing shared notification model.

## Biometrics
The module does NOT pretend that a booking code is biometric verification. Actual entry verification requires your campus biometric hardware/vendor API. Integrate that system before setting `biometricVerified` to true. The booking code is only a reference.

## Production notes
- Time-window checks are enforced on the server in Asia/Kolkata, not just by disabled UI controls.
- MongoDB partial unique indexes prevent two active bookings for one student/day and two active reservations for the same seat. Use a replica set for transactions if you later add transactional booking+notice writes.
- If old duplicate booking data exists, clean it before the unique indexes build.
