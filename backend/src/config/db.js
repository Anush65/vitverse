const dns = require("dns");
const mongoose = require("mongoose");

// Works around a Windows issue where Node's DNS resolver can't reach the
// system-assigned DNS server for SRV lookups, even though the OS resolver can.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = connectDB;
