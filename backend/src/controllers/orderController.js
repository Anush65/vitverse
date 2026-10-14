const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

async function placeOrder(req, res) {
  try {
    const { canteenId, items } = req.body;

    if (!canteenId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Select at least one item to order" });
    }

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, canteen: canteenId });

    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: "One or more items are no longer available" });
    }

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find((m) => m._id.toString() === item.menuItemId);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.userId,
      canteen: canteenId,
      items: orderItems,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("canteen", "name location")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function cancelOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "placed") {
      return res.status(400).json({ message: "Order is already being prepared and can't be cancelled" });
    }
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { placeOrder, getMyOrders, cancelOrder, updateOrderStatus };
