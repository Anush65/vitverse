const mongoose = require('mongoose');

const BusBookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  studentName: { type: String, default: '' },
  registerNumber: { type: String, default: '' },
  serviceDate: { type: String, required: true, index: true }, // YYYY-MM-DD, IST
  route: { type: String, required: true, enum: ['Alandur Metro', 'Sholinganallur', 'Velachery'] },
  busNumber: { type: Number, required: true, min: 1 },
  seatId: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', index: true },
  bookingCode: { type: String, required: true, unique: true },
  biometricVerified: { type: Boolean, default: false },
  boardedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

BusBookingSchema.index({ studentId: 1, serviceDate: 1 }, {
  unique: true, partialFilterExpression: { status: 'confirmed' }, name: 'one_active_booking_per_student_per_day'
});
BusBookingSchema.index({ serviceDate: 1, route: 1, busNumber: 1, seatId: 1 }, {
  unique: true, partialFilterExpression: { status: 'confirmed' }, name: 'one_active_booking_per_bus_seat'
});

module.exports = mongoose.models.BusBooking || mongoose.model('BusBooking', BusBookingSchema);
