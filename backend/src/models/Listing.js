

const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ["Academic", "Electronics", "Essentials", "Clothing", "Sports", "Other"],
      required: true,
    },
    type: {
      type: String,
      enum: ["sell", "rent"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rentalPeriod: {
      type: String,
      enum: ["hour", "day", "week"],
      required: function () {
        return this.type === "rent";
      },
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair"],
      default: "Good",
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["available", "reserved", "sold", "rented"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);
