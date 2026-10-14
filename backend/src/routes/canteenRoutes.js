const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { getCanteens, createCanteen } = require("../controllers/canteenController");
const {
  getQueue,
  getMyQueueEntry,
  joinQueue,
  leaveQueue,
  serveEntry,
} = require("../controllers/queueController");

const router = express.Router();

router.use(protect);

router.get("/canteens", getCanteens);
router.post("/canteens", adminOnly, createCanteen);

router.get("/queues/me", getMyQueueEntry);
router.get("/queues", getQueue);
router.post("/queues/join", joinQueue);
router.delete("/queues/:id", leaveQueue);
router.put("/queues/:id/serve", adminOnly, serveEntry);

module.exports = router;
