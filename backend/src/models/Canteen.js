const mongoose = require("mongoose");

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    avgServingMinutes: {
      type: Number,
      default: 3,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Canteen", canteenSchema);
