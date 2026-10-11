const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

// ADMIN AUTHORIZATION
async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization failed" });
  }
}

// ALL ROUTES REQUIRE LOGIN
router.use(protect);

// STUDENT + ADMIN
router.get("/", getNotices);
router.get("/:id", getNoticeById);

// ADMIN ONLY
router.post("/", adminOnly, createNotice);
router.put("/:id", adminOnly, updateNotice);
router.delete("/:id", adminOnly, deleteNotice);

module.exports = router;