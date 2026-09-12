const User = require("../models/User");

async function getMe(req, res) {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
}

async function updateMe(req, res) {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getMe, updateMe };
