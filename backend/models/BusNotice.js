const mongoose = require('mongoose');

const BusNoticeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['bus-booking-confirmed', 'bus-booking-updated', 'bus-booking-cancelled'], required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusBooking', default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.BusNotice || mongoose.model('BusNotice', BusNoticeSchema);
