const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "served", "cancelled"],
      default: "waiting",
    },
    servedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);
