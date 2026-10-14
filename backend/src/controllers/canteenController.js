const Canteen = require("../models/Canteen");
const MenuItem = require("../models/MenuItem");

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

async function getMenu(req, res) {
  try {
    const items = await MenuItem.find({ canteen: req.params.id, available: true }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function addMenuItem(req, res) {
  try {
    const { name, description, price, category, isVeg, image } = req.body;
    const item = await MenuItem.create({
      canteen: req.params.id,
      name,
      description,
      price,
      category,
      isVeg,
      image,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getCanteens, createCanteen, getMenu, addMenuItem };
