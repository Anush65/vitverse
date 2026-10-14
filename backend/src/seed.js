// Populates the database with realistic demo data for presentations/review.
// Safe to re-run: it upserts users (never deletes any existing account) and
// fully replaces only the feature data (canteens, queue, notices, listings,
// bus bookings) so every run leaves a clean, consistent demo state.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Canteen = require("./models/Canteen");
const Queue = require("./models/Queue");
const Notice = require("./models/Notice");
const Listing = require("./models/Listing");
const BusBooking = require("./models/BusBooking");
const BusNotice = require("./models/BusNotice");

const DEMO_PASSWORD = "password123";

function todayIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function upsertUser({ name, email, role }) {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email, password: hashedPassword, role } },
    { upsert: true, new: true }
  );
  return user;
}

async function seed() {
  await connectDB();

  console.log("\nSeeding users...");
  const admin = await upsertUser({ name: "Admin User", email: "admin@vitstudent.ac.in", role: "admin" });
  const students = await Promise.all(
    [
      ["Aarav Sharma", "aarav.sharma2024@vitstudent.ac.in"],
      ["Priya Nair", "priya.nair2024@vitstudent.ac.in"],
      ["Rohan Mehta", "rohan.mehta2024@vitstudent.ac.in"],
      ["Sneha Iyer", "sneha.iyer2024@vitstudent.ac.in"],
      ["Karthik Reddy", "karthik.reddy2024@vitstudent.ac.in"],
    ].map(([name, email]) => upsertUser({ name, email, role: "student" }))
  );
  console.log(`  admin: ${admin.email}`);
  students.forEach((s) => console.log(`  student: ${s.email}`));

  console.log("\nClearing old feature data (canteens, queue, notices, listings, bus bookings)...");
  await Promise.all([
    Canteen.deleteMany({}),
    Queue.deleteMany({}),
    Notice.deleteMany({}),
    Listing.deleteMany({}),
    BusBooking.deleteMany({}),
    BusNotice.deleteMany({}),
  ]);

  console.log("\nSeeding canteens...");
  const canteens = await Canteen.insertMany([
    { name: "Food Court 1", location: "Ground Floor, SJT", avgServingMinutes: 3, isOpen: true },
    { name: "Food Court 2", location: "TT Block", avgServingMinutes: 4, isOpen: true },
    { name: "Dominos VIT", location: "Men's Hostel Block", avgServingMinutes: 6, isOpen: true },
    { name: "Juice Corner", location: "Near Library", avgServingMinutes: 2, isOpen: false },
  ]);
  console.log(`  ${canteens.length} canteens created`);

  console.log("\nSeeding canteen queue entries...");
  // Created sequentially so createdAt ordering gives a realistic queue (student 0 joined first).
  for (const student of students.slice(0, 3)) {
    await Queue.create({ canteen: canteens[0]._id, user: student._id, status: "waiting" });
  }
  await Queue.create({ canteen: canteens[1]._id, user: students[3]._id, status: "waiting" });
  console.log("  4 students waiting across 2 canteens");

  console.log("\nSeeding notices...");
  const notices = await Notice.insertMany([
    { title: "Mid-Sem Exam Schedule Released", content: "The mid-semester examination schedule for all schools has been published on the academic portal. Check your slot and report 15 minutes early.", category: "Academic", createdBy: admin._id },
    { title: "Tech Fest Gravitas 2026 Registrations Open", content: "Registrations for Gravitas 2026 are now open! Participate in hackathons, robotics, and cultural events. Register through the official fest website before slots fill up.", category: "Events", createdBy: admin._id },
    { title: "Google Summer Internship Drive", content: "Google is conducting an on-campus internship drive for pre-final year students. Eligible students will receive an email with registration details shortly.", category: "Placements", createdBy: admin._id },
    { title: "Library Timings Extended During Exams", content: "The central library will remain open until 2 AM during the examination period to support student preparation.", category: "General", createdBy: admin._id },
    { title: "Hostel Wi-Fi Maintenance on Saturday", content: "Wi-Fi services in all hostel blocks will be temporarily unavailable on Saturday from 10 AM to 2 PM for scheduled maintenance.", category: "General", createdBy: admin._id },
  ]);
  console.log(`  ${notices.length} notices created`);

  console.log("\nSeeding marketplace listings...");
  const listingSeeds = [
    { title: "Scientific Calculator - Casio fx-991EX", description: "Barely used, all functions working perfectly. Great for engineering courses.", category: "Academic", type: "sell", price: 650, condition: "Good", images: ["https://picsum.photos/id/60/600/400"] },
    { title: "Study Table LED Lamp", description: "Adjustable brightness, USB powered. Perfect for late-night study sessions.", category: "Essentials", type: "sell", price: 300, condition: "Like New", images: ["https://picsum.photos/id/21/600/400"] },
    { title: "Yonex Badminton Racket", description: "Lightweight racket, available for short-term rent. Great grip, recently restrung.", category: "Sports", type: "rent", price: 50, rentalPeriod: "day", condition: "Good", images: ["https://picsum.photos/id/431/600/400"] },
    { title: "Mini Fridge for Hostel Room", description: "Compact fridge, perfect for hostel rooms. Available for weekly rent.", category: "Electronics", type: "rent", price: 500, rentalPeriod: "week", condition: "Good", images: ["https://picsum.photos/id/292/600/400"] },
    { title: "Engineering Graphics Drafter Kit", description: "Complete drafter kit with compass, scales, and set squares. Unused, still in box.", category: "Academic", type: "sell", price: 450, condition: "New", images: ["https://picsum.photos/id/180/600/400"] },
    { title: "Winter Jacket (Size M)", description: "Warm winter jacket, worn only a few times. No damage or stains.", category: "Clothing", type: "sell", price: 800, condition: "Like New", images: ["https://picsum.photos/id/1011/600/400"] },
    { title: "JBL Go Bluetooth Speaker", description: "Compact and loud, great battery life. Selling because I upgraded.", category: "Electronics", type: "sell", price: 1200, condition: "Good", images: ["https://picsum.photos/id/367/600/400"] },
    { title: "Bicycle for Rent", description: "Well-maintained bicycle available for hourly rent around campus.", category: "Other", type: "rent", price: 30, rentalPeriod: "hour", condition: "Fair", images: ["https://picsum.photos/id/111/600/400"] },
  ];
  const listings = await Listing.insertMany(
    listingSeeds.map((item, i) => ({ ...item, seller: students[i % students.length]._id }))
  );
  console.log(`  ${listings.length} listings created`);

  console.log("\nSeeding bus bookings...");
  const serviceDate = todayIST();
  const busSeeds = [
    { student: students[0], route: "Alandur Metro", busNumber: 1, seatId: "L1-1" },
    { student: students[1], route: "Alandur Metro", busNumber: 1, seatId: "R2-2" },
    { student: students[2], route: "Velachery", busNumber: 2, seatId: "L3-1" },
  ];
  for (const b of busSeeds) {
    const bookingCode = Math.random().toString(16).slice(2, 12).toUpperCase();
    const booking = await BusBooking.create({
      studentId: b.student._id,
      studentName: b.student.name,
      serviceDate,
      route: b.route,
      busNumber: b.busNumber,
      seatId: b.seatId,
      bookingCode,
    });
    await BusNotice.create({
      studentId: b.student._id,
      title: "Bus booking confirmed",
      message: `Your ${b.route} bus booking is confirmed for today at 1:45 PM. Bus ${b.busNumber}, seat ${b.seatId}.`,
      type: "bus-booking-confirmed",
      bookingId: booking._id,
    });
  }
  console.log(`  ${busSeeds.length} bus bookings created for ${serviceDate}`);

  console.log("\n================================================");
  console.log("Seed complete! Demo login credentials (same password for all):");
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Admin:    ${admin.email}`);
  students.forEach((s) => console.log(`  Student:  ${s.email}`));
  console.log("================================================\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
