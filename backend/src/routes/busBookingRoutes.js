const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const BusBooking = require('../models/BusBooking');
const BusNotice = require('../models/BusNotice');
const User = require('../models/User');

// VITVerse's protect middleware verifies the JWT and sets req.userId (a string),
// not req.user — the rest of this file reads req.userId accordingly.
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);
const ROUTES = { 'Alandur Metro': 5, Sholinganallur: 4, Velachery: 4 };
const TZ = 'Asia/Kolkata';

function istParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}
function todayIST() { const p = istParts(); return `${p.year}-${p.month}-${p.day}`; }
function minutesNowIST() { const p = istParts(); return Number(p.hour) * 60 + Number(p.minute); }
function fail(message, status = 400) { const e = new Error(message); e.status = status; throw e; }
function assertServiceDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) fail('serviceDate must be YYYY-MM-DD.');
  if (date !== todayIST()) fail("Bookings are available for today's 1:45 PM service only.");
}
function requireBookingWindow() {
  const m = minutesNowIST();
  if (m < 780 || m >= 810) fail('Booking is open daily from 1:00 PM until 1:30 PM IST.', 403);
}
function requireEditWindow() {
  const m = minutesNowIST();
  if (m < 780 || m >= 800) fail('Route edits and cancellations are allowed from 1:00 PM until 1:20 PM IST.', 403);
}
function getStudentId(req) {
  const id = req.userId;
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) fail('Your login session did not contain a valid student ID.', 401);
  return new mongoose.Types.ObjectId(String(id));
}
async function studentInfo(req) {
  const user = await User.findById(req.userId).select('name');
  return { studentName: user?.name || '', registerNumber: '' };
}
function seatIds() {
  const ids = [];
  for (let row = 1; row <= 12; row++) ids.push(`L${row}-1`, `L${row}-2`, `R${row}-1`, `R${row}-2`, `R${row}-3`);
  return ids;
}
function publicBooking(b) {
  return { id: b._id, serviceDate: b.serviceDate, route: b.route, busNumber: b.busNumber, seatId: b.seatId,
    status: b.status, bookingCode: b.bookingCode, biometricVerified: b.biometricVerified, boardedAt: b.boardedAt, createdAt: b.createdAt };
}
async function createNotice({ studentId, title, message, type, bookingId }) {
  await BusNotice.create({ studentId, title, message, type, bookingId });
}
function sendError(res, error) {
  const status = error.status || (error.code === 11000 ? 409 : 500);
  const message = error.code === 11000
    ? 'That seat or your daily booking was just taken. Refresh the seat map and try again.'
    : (error.message || 'Unexpected bus booking error.');
  res.status(status).json({ message });
}

router.get('/availability', async (req, res) => {
  try {
    const serviceDate = req.query.date || todayIST();
    assertServiceDate(serviceDate);
    const bookings = await BusBooking.find({ serviceDate, status: 'confirmed' }).select('route busNumber seatId').lean();
    const routes = Object.entries(ROUTES).map(([route, busCount]) => ({
      route, busCount, departureTime: '1:45 PM', capacityPerBus: 60,
      buses: Array.from({ length: busCount }, (_, i) => {
        const busNumber = i + 1;
        const occupiedSeats = bookings.filter(b => b.route === route && b.busNumber === busNumber).map(b => b.seatId);
        return { busNumber, bookedSeats: occupiedSeats.length, availableSeats: 60 - occupiedSeats.length, occupiedSeats };
      })
    }));
    const m = minutesNowIST();
    res.json({ serviceDate, bookingOpens: '1:00 PM', bookingCloses: '1:30 PM', editCancelCloses: '1:20 PM', departureTime: '1:45 PM',
      bookingOpenNow: m >= 780 && m < 810, editOpenNow: m >= 780 && m < 800, seatIds: seatIds(), routes });
  } catch (e) { sendError(res, e); }
});

router.get('/mine', async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const booking = await BusBooking.findOne({ studentId, serviceDate: todayIST(), status: 'confirmed' }).lean();
    res.json({ booking: booking ? publicBooking(booking) : null });
  } catch (e) { sendError(res, e); }
});

router.post('/', async (req, res) => {
  try {
    requireBookingWindow();
    const studentId = getStudentId(req);
    const serviceDate = req.body.serviceDate || todayIST();
    assertServiceDate(serviceDate);
    const { route, seatId } = req.body;
    const busNumber = Number(req.body.busNumber);
    if (!Object.prototype.hasOwnProperty.call(ROUTES, route)) fail('Select a valid bus route.');
    if (!Number.isInteger(busNumber) || busNumber < 1 || busNumber > ROUTES[route]) fail('Invalid bus number for this route.');
    if (!seatIds().includes(seatId)) fail('Select a valid seat.');
    if (await BusBooking.exists({ studentId, serviceDate, status: 'confirmed' })) fail('You can book only one seat per day. Edit your existing booking before 1:20 PM.', 409);
    const booking = await BusBooking.create({ studentId, ...(await studentInfo(req)), serviceDate, route, busNumber, seatId,
      bookingCode: crypto.randomBytes(5).toString('hex').toUpperCase() });
    await createNotice({ studentId, title: 'Bus booking confirmed',
      message: `Your ${route} bus booking is confirmed for today at 1:45 PM. Bus ${busNumber}, seat ${seatId}. Boarding is subject to campus biometric verification.`,
      type: 'bus-booking-confirmed', bookingId: booking._id });
    res.status(201).json({ message: 'Bus seat booked successfully.', booking: publicBooking(booking) });
  } catch (e) { sendError(res, e); }
});

router.patch('/:id', async (req, res) => {
  try {
    requireEditWindow();
    const studentId = getStudentId(req);
    const booking = await BusBooking.findOne({ _id: req.params.id, studentId, serviceDate: todayIST(), status: 'confirmed' });
    if (!booking) return res.status(404).json({ message: 'Active booking not found.' });
    const route = req.body.route ?? booking.route;
    const busNumber = Number(req.body.busNumber ?? booking.busNumber);
    const seatId = req.body.seatId ?? booking.seatId;
    if (!Object.prototype.hasOwnProperty.call(ROUTES, route)) fail('Select a valid bus route.');
    if (!Number.isInteger(busNumber) || busNumber < 1 || busNumber > ROUTES[route]) fail('Invalid bus number for this route.');
    if (!seatIds().includes(seatId)) fail('Select a valid seat.');
    const conflict = await BusBooking.findOne({ _id: { $ne: booking._id }, serviceDate: booking.serviceDate, route, busNumber, seatId, status: 'confirmed' });
    if (conflict) fail('That seat is already booked. Choose another seat.', 409);
    const oldRoute = booking.route;
    booking.route = route; booking.busNumber = busNumber; booking.seatId = seatId;
    await booking.save();
    await createNotice({ studentId, title: 'Bus booking updated',
      message: `Your bus booking was updated from ${oldRoute} to ${route}. Bus ${busNumber}, seat ${seatId}. Departure is 1:45 PM.`,
      type: 'bus-booking-updated', bookingId: booking._id });
    res.json({ message: 'Booking updated.', booking: publicBooking(booking) });
  } catch (e) { sendError(res, e); }
});

router.delete('/:id', async (req, res) => {
  try {
    requireEditWindow();
    const studentId = getStudentId(req);
    const booking = await BusBooking.findOne({ _id: req.params.id, studentId, serviceDate: todayIST(), status: 'confirmed' });
    if (!booking) return res.status(404).json({ message: 'Active booking not found.' });
    booking.status = 'cancelled'; booking.cancelledAt = new Date();
    await booking.save();
    await createNotice({ studentId, title: 'Bus booking cancelled',
      message: `Your ${booking.route} bus booking (bus ${booking.busNumber}, seat ${booking.seatId}) has been cancelled.`,
      type: 'bus-booking-cancelled', bookingId: booking._id });
    res.json({ message: 'Booking cancelled.', booking: publicBooking(booking) });
  } catch (e) { sendError(res, e); }
});

router.get('/notices/mine', async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const notices = await BusNotice.find({ studentId }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ notices });
  } catch (e) { sendError(res, e); }
});

router.patch('/notices/:id/read', async (req, res) => {
  try {
    const studentId = getStudentId(req);
    const notice = await BusNotice.findOneAndUpdate({ _id: req.params.id, studentId }, { $set: { read: true } }, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json({ notice });
  } catch (e) { sendError(res, e); }
});

module.exports = router;
