const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["Meals", "Snacks", "Fast Food", "Beverages", "Desserts"],
      default: "Snacks",
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
