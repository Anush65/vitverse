// Populates the database with realistic demo data for presentations/review.
// Safe to re-run: it upserts users (never deletes any existing account) and
// fully replaces only the feature data (canteens, menu, orders, queue,
// notices, listings, bus bookings) so every run leaves a clean, consistent
// demo state. Also auto-run once by server.js if the database is empty, so
// a fresh clone never shows a blank app.
require("dotenv").config();
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Canteen = require("./models/Canteen");
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");
const Queue = require("./models/Queue");
const Notice = require("./models/Notice");
const Listing = require("./models/Listing");
const BusBooking = require("./models/BusBooking");
const BusNotice = require("./models/BusNotice");

const DEMO_PASSWORD = "password123";

function img(id) {
  return `https://picsum.photos/id/${id}/600/400`;
}

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
  return User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email, password: hashedPassword, role } },
    { upsert: true, new: true }
  );
}

async function runSeed() {
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

  console.log("\nClearing old feature data...");
  await Promise.all([
    Canteen.deleteMany({}),
    MenuItem.deleteMany({}),
    Order.deleteMany({}),
    Queue.deleteMany({}),
    Notice.deleteMany({}),
    Listing.deleteMany({}),
    BusBooking.deleteMany({}),
    BusNotice.deleteMany({}),
  ]);

  console.log("\nSeeding canteens...");
  const [gymkhana, dominos] = await Canteen.insertMany([
    { name: "Gymkhana", location: "Gymkhana Ground, VIT Vellore", avgServingMinutes: 5, isOpen: true },
    { name: "Domino's", location: "G1 Block, VIT Vellore", avgServingMinutes: 8, isOpen: true },
  ]);
  console.log(`  Gymkhana + Domino's created`);

  console.log("\nSeeding menu items...");
  const gymkhanaMenu = await MenuItem.insertMany([
    { canteen: gymkhana._id, name: "Veg Thali", description: "Rice, dal, sabzi, roti, curd, pickle", price: 90, category: "Meals", isVeg: true, image: img(292) },
    { canteen: gymkhana._id, name: "Chicken Biryani", description: "Fragrant basmati rice with spiced chicken", price: 140, category: "Meals", isVeg: false, image: img(365) },
    { canteen: gymkhana._id, name: "Masala Dosa", description: "Crispy dosa with spiced potato filling", price: 60, category: "Snacks", isVeg: true, image: img(431) },
    { canteen: gymkhana._id, name: "Paneer Butter Masala with Rice", description: "Creamy paneer curry served with steamed rice", price: 120, category: "Meals", isVeg: true, image: img(493) },
    { canteen: gymkhana._id, name: "Chicken 65", description: "Spicy deep-fried chicken bites", price: 110, category: "Fast Food", isVeg: false, image: img(488) },
    { canteen: gymkhana._id, name: "Cold Coffee", description: "Chilled coffee blended with ice cream", price: 50, category: "Beverages", isVeg: true, image: img(30) },
    { canteen: gymkhana._id, name: "Masala Chai", description: "Classic Indian spiced tea", price: 20, category: "Beverages", isVeg: true, image: img(225) },
    { canteen: gymkhana._id, name: "Gulab Jamun (2 pcs)", description: "Soft milk dumplings in sugar syrup", price: 40, category: "Desserts", isVeg: true, image: img(312) },
  ]);
  const dominosMenu = await MenuItem.insertMany([
    { canteen: dominos._id, name: "Margherita Pizza (Regular)", description: "Classic cheese and tomato pizza", price: 199, category: "Fast Food", isVeg: true, image: img(1080) },
    { canteen: dominos._id, name: "Farmhouse Pizza (Medium)", description: "Loaded with fresh veggies", price: 349, category: "Fast Food", isVeg: true, image: img(1059) },
    { canteen: dominos._id, name: "Pepperoni Pizza (Medium)", description: "Topped with spicy pepperoni", price: 399, category: "Fast Food", isVeg: false, image: img(1062) },
    { canteen: dominos._id, name: "Chicken Dominator Pizza", description: "Loaded with double chicken toppings", price: 429, category: "Fast Food", isVeg: false, image: img(1063) },
    { canteen: dominos._id, name: "Garlic Breadsticks", description: "Baked breadsticks with garlic butter", price: 99, category: "Snacks", isVeg: true, image: img(1074) },
    { canteen: dominos._id, name: "Choco Lava Cake", description: "Warm chocolate cake with a molten center", price: 89, category: "Desserts", isVeg: true, image: img(1080) },
    { canteen: dominos._id, name: "Pepsi (500ml)", description: "Chilled soft drink", price: 60, category: "Beverages", isVeg: true, image: img(425) },
  ]);
  console.log(`  ${gymkhanaMenu.length + dominosMenu.length} menu items created`);

  console.log("\nSeeding canteen queue entries...");
  for (const student of students.slice(0, 3)) {
    await Queue.create({ canteen: gymkhana._id, user: student._id, status: "waiting" });
  }
  await Queue.create({ canteen: dominos._id, user: students[3]._id, status: "waiting" });
  console.log("  4 students waiting across Gymkhana and Domino's");

  console.log("\nSeeding sample orders...");
  await Order.create({
    user: students[0]._id,
    canteen: gymkhana._id,
    items: [{ menuItem: gymkhanaMenu[0]._id, name: gymkhanaMenu[0].name, price: gymkhanaMenu[0].price, quantity: 2 }],
    totalAmount: gymkhanaMenu[0].price * 2,
    status: "preparing",
  });
  await Order.create({
    user: students[1]._id,
    canteen: dominos._id,
    items: [
      { menuItem: dominosMenu[1]._id, name: dominosMenu[1].name, price: dominosMenu[1].price, quantity: 1 },
      { menuItem: dominosMenu[5]._id, name: dominosMenu[5].name, price: dominosMenu[5].price, quantity: 1 },
    ],
    totalAmount: dominosMenu[1].price + dominosMenu[5].price,
    status: "placed",
  });
  await Order.create({
    user: students[2]._id,
    canteen: gymkhana._id,
    items: [{ menuItem: gymkhanaMenu[1]._id, name: gymkhanaMenu[1].name, price: gymkhanaMenu[1].price, quantity: 1 }],
    totalAmount: gymkhanaMenu[1].price,
    status: "completed",
  });
  console.log("  3 sample orders created (placed / preparing / completed)");

  console.log("\nSeeding notices...");
  const notices = await Notice.insertMany([
    { title: "Riviera 2026 — VIT's Annual Cultural Fest", content: "VIT's biggest cultural extravaganza, Riviera, returns with four days of pro-shows, sports competitions, and cultural events. Mark your calendars!", category: "Events", createdBy: admin._id },
    { title: "Yantra 2026: 48-Hour Central Hack Begins", content: "Yantra, VIT's annual techno-management fest, kicks off with Central Hack — a 48-hour hackathon with a prize pool of ₹10 lakh — alongside 65+ technical events through the week.", category: "Events", createdBy: admin._id },
    { title: "GraVITas — Technology & Design Carnival", content: "GraVITas, VIT's annual technology and design carnival, returns for three days packed with workshops, competitions, and talks from industry leaders.", category: "Events", createdBy: admin._id },
    { title: "Pongal Cultural Competitions", content: "A week of cultural, literary, fun, and recreational competitions celebrating Pongal — 23 events across all categories, open to all students.", category: "Events", createdBy: admin._id },
    { title: "RoboVITics Wins Robotics Championship", content: "Congratulations to Team RoboVITics for placing second in the national robotics competition! Club recruitment for interested students opens next week.", category: "Events", createdBy: admin._id },
    { title: "Mid-Semester Exam Schedule Released", content: "The mid-semester examination schedule for all schools has been published on the academic portal. Check your slot and report 15 minutes early.", category: "Academic", createdBy: admin._id },
    { title: "End-Semester Exam Hall Ticket Download", content: "Hall tickets for the end semester examinations are now available on the student portal. Download and carry a printed copy along with your ID card.", category: "Academic", createdBy: admin._id },
    { title: "Credit Registration for Next Semester Opens Monday", content: "Course registration for the upcoming semester opens Monday at 9 AM. Consult your faculty advisor before finalizing your credits.", category: "Academic", createdBy: admin._id },
    { title: "Guest Lecture: AI in Healthcare", content: "The School of Computer Science is hosting a guest lecture on AI applications in healthcare diagnostics this Friday at 4 PM in the auditorium.", category: "Academic", createdBy: admin._id },
    { title: "Google Summer Internship Drive", content: "Google is conducting an on-campus internship drive for pre-final year students. Eligible students will receive an email with registration details shortly.", category: "Placements", createdBy: admin._id },
    { title: "Microsoft On-Campus Placement Drive — Pre-Placement Talk", content: "Microsoft will be conducting a pre-placement talk for final year students this Thursday. Attendance is mandatory for interested applicants.", category: "Placements", createdBy: admin._id },
    { title: "Resume Building Workshop by Career Development Centre", content: "A hands-on resume building and LinkedIn optimization workshop will be held this weekend. Limited seats, register on the CDC portal.", category: "Placements", createdBy: admin._id },
    { title: "Library Timings Extended During Exams", content: "The central library will remain open until 2 AM during the examination period to support student preparation.", category: "General", createdBy: admin._id },
    { title: "Hostel Wi-Fi Maintenance This Saturday", content: "Wi-Fi services in all hostel blocks will be temporarily unavailable on Saturday from 10 AM to 2 PM for scheduled maintenance.", category: "General", createdBy: admin._id },
    { title: "Mess Menu Updated for This Week", content: "The weekly mess menu has been updated with new rotation items based on student feedback. Check the notice board outside your mess hall.", category: "General", createdBy: admin._id },
    { title: "Lost and Found: Items Collected at Security Office", content: "Several items including ID cards, water bottles, and umbrellas found across campus are available for collection at the main gate security office.", category: "General", createdBy: admin._id },
  ]);
  console.log(`  ${notices.length} notices created`);

  console.log("\nSeeding marketplace listings...");
  const listingSeeds = [
    { title: "Scientific Calculator - Casio fx-991EX", description: "Barely used, all functions working perfectly. Great for engineering courses.", category: "Academic", type: "sell", price: 650, condition: "Good", images: [img(60)] },
    { title: "Data Structures Textbook (CLRS)", description: "Introduction to Algorithms, 3rd edition. Minor highlighting, otherwise great condition.", category: "Academic", type: "sell", price: 550, condition: "Good", images: [img(24)] },
    { title: "Engineering Graphics Drafter Kit", description: "Complete drafter kit with compass, scales, and set squares. Unused, still in box.", category: "Academic", type: "sell", price: 450, condition: "New", images: [img(180)] },
    { title: "Previous Year Question Papers Bundle", description: "Compiled PYQs for core engineering subjects, last 5 years. Printed and spiral bound.", category: "Academic", type: "sell", price: 150, condition: "Good", images: [img(48)] },
    { title: "Study Table LED Lamp", description: "Adjustable brightness, USB powered. Perfect for late-night study sessions.", category: "Essentials", type: "sell", price: 300, condition: "Like New", images: [img(21)] },
    { title: "Hot Water Kettle", description: "1L electric kettle, auto shut-off. Great for hostel rooms.", category: "Essentials", type: "sell", price: 400, condition: "Good", images: [img(225)] },
    { title: "Laundry Bag (Large)", description: "Durable, foldable laundry bag with drawstring closure.", category: "Essentials", type: "sell", price: 200, condition: "New", images: [img(119)] },
    { title: "JBL Go Bluetooth Speaker", description: "Compact and loud, great battery life. Selling because I upgraded.", category: "Electronics", type: "sell", price: 1200, condition: "Good", images: [img(367)] },
    { title: "Mini Fridge for Hostel Room", description: "Compact fridge, perfect for hostel rooms. Available for weekly rent.", category: "Electronics", type: "rent", price: 500, rentalPeriod: "week", condition: "Good", images: [img(292)] },
    { title: "Noise Cancelling Headphones", description: "Over-ear ANC headphones, 20hr battery life, barely used.", category: "Electronics", type: "sell", price: 2200, condition: "Good", images: [img(250)] },
    { title: "Portable Printer", description: "Compact wireless printer, available for short-term rent during assignment season.", category: "Electronics", type: "rent", price: 150, rentalPeriod: "day", condition: "Fair", images: [img(96)] },
    { title: "Winter Jacket (Size M)", description: "Warm winter jacket, worn only a few times. No damage or stains.", category: "Clothing", type: "sell", price: 800, condition: "Like New", images: [img(1011)] },
    { title: "Formal Shirt Set (3 pcs)", description: "Formal shirts, perfect for interviews and presentations. Size M.", category: "Clothing", type: "sell", price: 600, condition: "Good", images: [img(91)] },
    { title: "Ethnic Wear for Cultural Night", description: "Traditional outfit available for rent for cultural fest nights.", category: "Clothing", type: "rent", price: 300, rentalPeriod: "day", condition: "Good", images: [img(177)] },
    { title: "Yonex Badminton Racket", description: "Lightweight racket, available for short-term rent. Great grip, recently restrung.", category: "Sports", type: "rent", price: 50, rentalPeriod: "day", condition: "Good", images: [img(433)] },
    { title: "Cricket Kit (Full Set)", description: "Bat, pads, gloves, and helmet included. Great for weekend matches.", category: "Sports", type: "rent", price: 200, rentalPeriod: "day", condition: "Good", images: [img(466)] },
    { title: "Yoga Mat", description: "Anti-slip yoga mat, brand new, unused.", category: "Sports", type: "sell", price: 250, condition: "New", images: [img(206)] },
    { title: "Bicycle for Rent", description: "Well-maintained bicycle available for hourly rent around campus.", category: "Other", type: "rent", price: 30, rentalPeriod: "hour", condition: "Fair", images: [img(111)] },
    { title: "Acoustic Guitar", description: "Great condition acoustic guitar, available for daily rent. New strings fitted.", category: "Other", type: "rent", price: 100, rentalPeriod: "day", condition: "Good", images: [img(1025)] },
    { title: "Hostel Room Decor Lights", description: "Warm white LED string lights, unused, still in packaging.", category: "Other", type: "sell", price: 180, condition: "New", images: [img(20)] },
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
}

module.exports = runSeed;

// Run directly via `npm run seed` (not when imported by server.js)
if (require.main === module) {
  const connectDB = require("./config/db");
  connectDB()
    .then(runSeed)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
