
const express = require("express");
const router = express.Router();

const {
  getListings,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getListings);
router.post("/", authMiddleware, createListing);
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

module.exports = router;
