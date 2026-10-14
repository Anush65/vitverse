const User = require("../models/User");

async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization failed" });
  }
}

module.exports = adminOnly;
