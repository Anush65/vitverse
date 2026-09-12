const User = require("../models/User");

async function getMe(req, res) {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
}

module.exports = { getMe };
