const Canteen = require("../models/Canteen");

async function getCanteens(req, res) {
  try {
    const canteens = await Canteen.find();
    res.json(canteens);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function createCanteen(req, res) {
  try {
    const { name, location, avgServingMinutes } = req.body;
    const canteen = await Canteen.create({ name, location, avgServingMinutes });
    res.status(201).json(canteen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getCanteens, createCanteen };
