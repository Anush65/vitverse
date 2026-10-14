const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { getCanteens, createCanteen, getMenu, addMenuItem } = require("../controllers/canteenController");
const {
  getQueue,
  getMyQueueEntry,
  joinQueue,
  leaveQueue,
  serveEntry,
} = require("../controllers/queueController");
const {
  placeOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect);

router.get("/canteens", getCanteens);
router.post("/canteens", adminOnly, createCanteen);
router.get("/canteens/:id/menu", getMenu);
router.post("/canteens/:id/menu", adminOnly, addMenuItem);

router.get("/queues/me", getMyQueueEntry);
router.get("/queues", getQueue);
router.post("/queues/join", joinQueue);
router.delete("/queues/:id", leaveQueue);
router.put("/queues/:id/serve", adminOnly, serveEntry);

router.post("/orders", placeOrder);
router.get("/orders/mine", getMyOrders);
router.delete("/orders/:id", cancelOrder);
router.put("/orders/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
