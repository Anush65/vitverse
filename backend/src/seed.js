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

function img(photoId) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;
}

const MENU_IMAGE_BY_NAME = {
  "Veg Thali": img("photo-1547592180-85f173990554"),
  "Chicken Biryani": img("photo-1589302168068-964664d93dc0"),
  "Masala Dosa": img("photo-1668236543090-82eba5ee5976"),
  "Paneer Butter Masala with Rice": img("photo-1603894584373-5ac82b2ae398"),
  "Chicken 65": img("photo-1604908177453-7462950a6a3b"),
  "Cold Coffee": img("photo-1461023058943-07fcbe16d735"),
  "Masala Chai": img("photo-1571934811356-5cc061b6821f"),
  "Gulab Jamun (2 pcs)": img("photo-1610192244261-3f33de3f55e4"),
  "Margherita Pizza (Regular)": img("photo-1571407970349-bc81e7e96d47"),
  "Farmhouse Pizza (Medium)": img("photo-1565299624946-b28f40a0ae38"),
  "Pepperoni Pizza (Medium)": img("photo-1628840042765-356cda07504e"),
  "Chicken Dominator Pizza": img("photo-1513104890138-7c749659a591"),
  "Garlic Breadsticks": img("photo-1573140401552-3fab0b24306f"),
  "Choco Lava Cake": img("photo-1578985545062-69928b1d9587"),
  "Pepsi (500ml)": img("photo-1629203851122-3726ecdf080e"),
};

const LISTING_IMAGE_BY_TITLE = {
  "Scientific Calculator - Casio fx-991EX": img("photo-1587145820266-a5951ee6f620"),
  "Data Structures Textbook (CLRS)": img("photo-1544947950-fa07a98d237f"),
  "Engineering Graphics Drafter Kit": img("photo-1513364776144-60967b0f800f"),
  "Previous Year Question Papers Bundle": img("photo-1532012197267-da84d127e765"),
  "Study Table LED Lamp": img("photo-1507473885765-e6ed057f782c"),
  "Hot Water Kettle": img("photo-1572119865084-43c285814d63"),
  "Laundry Bag (Large)": img("photo-1622560480654-d96214fdc887"),
  "JBL Go Bluetooth Speaker": img("photo-1608043152269-423dbba4e7e1"),
  "Mini Fridge for Hostel Room": img("photo-1571175443880-49e1d25b2bc5"),
  "Noise Cancelling Headphones": img("photo-1505740420928-5e560c06d30e"),
  "Portable Printer": img("photo-1612815154858-60aa4c59eaa6"),
  "Winter Jacket (Size M)": img("photo-1544022613-e87ca75a784a"),
  "Formal Shirt Set (3 pcs)": img("photo-1598033129183-c4f50c736f10"),
  "Ethnic Wear for Cultural Night": img("photo-1610030469983-98e550d6193c"),
  "Yonex Badminton Racket": img("photo-1622279457486-62dcc4a431d6"),
  "Cricket Kit (Full Set)": img("photo-1531415074968-036ba1b575da"),
  "Yoga Mat": img("photo-1592432678016-e910b452f9a2"),
  "Bicycle for Rent": img("photo-1485965120184-e220f721d03e"),
  "Acoustic Guitar": img("photo-1510915361894-db8b60106cb1"),
  "Hostel Room Decor Lights": img("photo-1513506003901-1e6a229e2d15"),
};

async function refreshDemoImages() {
  const legacyImage = /^https:\/\/picsum\.photos\//;
  const updates = await Promise.all([
    ...Object.entries(MENU_IMAGE_BY_NAME).map(([name, image]) =>
      MenuItem.updateOne({ name, image: legacyImage }, { $set: { image } })
    ),
    ...Object.entries(LISTING_IMAGE_BY_TITLE).map(([title, image]) =>
      Listing.updateOne(
        { title, "images.0": legacyImage },
        { $set: { "images.0": image } }
      )
    ),
  ]);
  const refreshed = updates.reduce((count, result) => count + result.modifiedCount, 0);
  if (refreshed > 0) {
    console.log(`  Refreshed ${refreshed} legacy demo images`);
  }
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
    { canteen: gymkhana._id, name: "Veg Thali", description: "Rice, dal, sabzi, roti, curd, pickle", price: 90, category: "Meals", isVeg: true, image: MENU_IMAGE_BY_NAME["Veg Thali"] },
    { canteen: gymkhana._id, name: "Chicken Biryani", description: "Fragrant basmati rice with spiced chicken", price: 140, category: "Meals", isVeg: false, image: MENU_IMAGE_BY_NAME["Chicken Biryani"] },
    { canteen: gymkhana._id, name: "Masala Dosa", description: "Crispy dosa with spiced potato filling", price: 60, category: "Snacks", isVeg: true, image: MENU_IMAGE_BY_NAME["Masala Dosa"] },
    { canteen: gymkhana._id, name: "Paneer Butter Masala with Rice", description: "Creamy paneer curry served with steamed rice", price: 120, category: "Meals", isVeg: true, image: MENU_IMAGE_BY_NAME["Paneer Butter Masala with Rice"] },
    { canteen: gymkhana._id, name: "Chicken 65", description: "Spicy deep-fried chicken bites", price: 110, category: "Fast Food", isVeg: false, image: MENU_IMAGE_BY_NAME["Chicken 65"] },
    { canteen: gymkhana._id, name: "Cold Coffee", description: "Chilled coffee blended with ice cream", price: 50, category: "Beverages", isVeg: true, image: MENU_IMAGE_BY_NAME["Cold Coffee"] },
    { canteen: gymkhana._id, name: "Masala Chai", description: "Classic Indian spiced tea", price: 20, category: "Beverages", isVeg: true, image: MENU_IMAGE_BY_NAME["Masala Chai"] },
    { canteen: gymkhana._id, name: "Gulab Jamun (2 pcs)", description: "Soft milk dumplings in sugar syrup", price: 40, category: "Desserts", isVeg: true, image: MENU_IMAGE_BY_NAME["Gulab Jamun (2 pcs)"] },
  ]);
  const dominosMenu = await MenuItem.insertMany([
    { canteen: dominos._id, name: "Margherita Pizza (Regular)", description: "Classic cheese and tomato pizza", price: 199, category: "Fast Food", isVeg: true, image: MENU_IMAGE_BY_NAME["Margherita Pizza (Regular)"] },
    { canteen: dominos._id, name: "Farmhouse Pizza (Medium)", description: "Loaded with fresh veggies", price: 349, category: "Fast Food", isVeg: true, image: MENU_IMAGE_BY_NAME["Farmhouse Pizza (Medium)"] },
    { canteen: dominos._id, name: "Pepperoni Pizza (Medium)", description: "Topped with spicy pepperoni", price: 399, category: "Fast Food", isVeg: false, image: MENU_IMAGE_BY_NAME["Pepperoni Pizza (Medium)"] },
    { canteen: dominos._id, name: "Chicken Dominator Pizza", description: "Loaded with double chicken toppings", price: 429, category: "Fast Food", isVeg: false, image: MENU_IMAGE_BY_NAME["Chicken Dominator Pizza"] },
    { canteen: dominos._id, name: "Garlic Breadsticks", description: "Baked breadsticks with garlic butter", price: 99, category: "Snacks", isVeg: true, image: MENU_IMAGE_BY_NAME["Garlic Breadsticks"] },
    { canteen: dominos._id, name: "Choco Lava Cake", description: "Warm chocolate cake with a molten center", price: 89, category: "Desserts", isVeg: true, image: MENU_IMAGE_BY_NAME["Choco Lava Cake"] },
    { canteen: dominos._id, name: "Pepsi (500ml)", description: "Chilled soft drink", price: 60, category: "Beverages", isVeg: true, image: MENU_IMAGE_BY_NAME["Pepsi (500ml)"] },
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
    { title: "Scientific Calculator - Casio fx-991EX", description: "Barely used, all functions working perfectly. Great for engineering courses.", category: "Academic", type: "sell", price: 650, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Scientific Calculator - Casio fx-991EX"]] },
    { title: "Data Structures Textbook (CLRS)", description: "Introduction to Algorithms, 3rd edition. Minor highlighting, otherwise great condition.", category: "Academic", type: "sell", price: 550, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Data Structures Textbook (CLRS)"]] },
    { title: "Engineering Graphics Drafter Kit", description: "Complete drafter kit with compass, scales, and set squares. Unused, still in box.", category: "Academic", type: "sell", price: 450, condition: "New", images: [LISTING_IMAGE_BY_TITLE["Engineering Graphics Drafter Kit"]] },
    { title: "Previous Year Question Papers Bundle", description: "Compiled PYQs for core engineering subjects, last 5 years. Printed and spiral bound.", category: "Academic", type: "sell", price: 150, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Previous Year Question Papers Bundle"]] },
    { title: "Study Table LED Lamp", description: "Adjustable brightness, USB powered. Perfect for late-night study sessions.", category: "Essentials", type: "sell", price: 300, condition: "Like New", images: [LISTING_IMAGE_BY_TITLE["Study Table LED Lamp"]] },
    { title: "Hot Water Kettle", description: "1L electric kettle, auto shut-off. Great for hostel rooms.", category: "Essentials", type: "sell", price: 400, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Hot Water Kettle"]] },
    { title: "Laundry Bag (Large)", description: "Durable, foldable laundry bag with drawstring closure.", category: "Essentials", type: "sell", price: 200, condition: "New", images: [LISTING_IMAGE_BY_TITLE["Laundry Bag (Large)"]] },
    { title: "JBL Go Bluetooth Speaker", description: "Compact and loud, great battery life. Selling because I upgraded.", category: "Electronics", type: "sell", price: 1200, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["JBL Go Bluetooth Speaker"]] },
    { title: "Mini Fridge for Hostel Room", description: "Compact fridge, perfect for hostel rooms. Available for weekly rent.", category: "Electronics", type: "rent", price: 500, rentalPeriod: "week", condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Mini Fridge for Hostel Room"]] },
    { title: "Noise Cancelling Headphones", description: "Over-ear ANC headphones, 20hr battery life, barely used.", category: "Electronics", type: "sell", price: 2200, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Noise Cancelling Headphones"]] },
    { title: "Portable Printer", description: "Compact wireless printer, available for short-term rent during assignment season.", category: "Electronics", type: "rent", price: 150, rentalPeriod: "day", condition: "Fair", images: [LISTING_IMAGE_BY_TITLE["Portable Printer"]] },
    { title: "Winter Jacket (Size M)", description: "Warm winter jacket, worn only a few times. No damage or stains.", category: "Clothing", type: "sell", price: 800, condition: "Like New", images: [LISTING_IMAGE_BY_TITLE["Winter Jacket (Size M)"]] },
    { title: "Formal Shirt Set (3 pcs)", description: "Formal shirts, perfect for interviews and presentations. Size M.", category: "Clothing", type: "sell", price: 600, condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Formal Shirt Set (3 pcs)"]] },
    { title: "Ethnic Wear for Cultural Night", description: "Traditional outfit available for rent for cultural fest nights.", category: "Clothing", type: "rent", price: 300, rentalPeriod: "day", condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Ethnic Wear for Cultural Night"]] },
    { title: "Yonex Badminton Racket", description: "Lightweight racket, available for short-term rent. Great grip, recently restrung.", category: "Sports", type: "rent", price: 50, rentalPeriod: "day", condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Yonex Badminton Racket"]] },
    { title: "Cricket Kit (Full Set)", description: "Bat, pads, gloves, and helmet included. Great for weekend matches.", category: "Sports", type: "rent", price: 200, rentalPeriod: "day", condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Cricket Kit (Full Set)"]] },
    { title: "Yoga Mat", description: "Anti-slip yoga mat, brand new, unused.", category: "Sports", type: "sell", price: 250, condition: "New", images: [LISTING_IMAGE_BY_TITLE["Yoga Mat"]] },
    { title: "Bicycle for Rent", description: "Well-maintained bicycle available for hourly rent around campus.", category: "Other", type: "rent", price: 30, rentalPeriod: "hour", condition: "Fair", images: [LISTING_IMAGE_BY_TITLE["Bicycle for Rent"]] },
    { title: "Acoustic Guitar", description: "Great condition acoustic guitar, available for daily rent. New strings fitted.", category: "Other", type: "rent", price: 100, rentalPeriod: "day", condition: "Good", images: [LISTING_IMAGE_BY_TITLE["Acoustic Guitar"]] },
    { title: "Hostel Room Decor Lights", description: "Warm white LED string lights, unused, still in packaging.", category: "Other", type: "sell", price: 180, condition: "New", images: [LISTING_IMAGE_BY_TITLE["Hostel Room Decor Lights"]] },
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

module.exports = { runSeed, refreshDemoImages };

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
