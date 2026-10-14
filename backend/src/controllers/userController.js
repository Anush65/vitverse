const User = require("../models/User");

async function getMe(req, res) {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
}

const EDITABLE_FIELDS = ["name", "bio", "branch", "year", "hostelBlock"];

async function updateMe(req, res) {
  try {
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getMe, updateMe };
