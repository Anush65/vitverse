require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const Canteen = require("./models/Canteen");
const { runSeed, refreshDemoImages } = require("./seed");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const isEmpty = (await Canteen.countDocuments()) === 0;
  if (isEmpty) {
    console.log("Database looks empty — auto-seeding demo data...");
    await runSeed();
  }
  await refreshDemoImages();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
