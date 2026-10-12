const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const listingRoutes = require("./routes/listingRoutes");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");
const canteenRoutes = require("./routes/canteenRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/listings", listingRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/uploads", uploadRoutes);
app.use("/api/canteen", canteenRoutes);

module.exports = app;

