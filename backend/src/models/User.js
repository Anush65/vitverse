const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/, "Must be a valid VIT student email"],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", ""],
      default: "",
    },
    hostelBlock: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
