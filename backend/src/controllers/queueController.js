const Queue = require("../models/Queue");

// Live list of everyone waiting at a canteen, in join order
async function getQueue(req, res) {
  try {
    const { canteenId } = req.query;
    if (!canteenId) {
      return res.status(400).json({ message: "canteenId is required" });
    }

    const entries = await Queue.find({ canteen: canteenId, status: "waiting" })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    res.json(entries);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// The logged-in student's own active queue entry, with computed position + ETA
async function getMyQueueEntry(req, res) {
  try {
    const entry = await Queue.findOne({ user: req.userId, status: "waiting" }).populate(
      "canteen",
      "name location avgServingMinutes"
    );

    if (!entry) {
      return res.json(null);
    }

    const aheadCount = await Queue.countDocuments({
      canteen: entry.canteen._id,
      status: "waiting",
      createdAt: { $lt: entry.createdAt },
    });

    res.json({
      ...entry.toObject(),
      position: aheadCount + 1,
      estimatedWaitMinutes: aheadCount * (entry.canteen.avgServingMinutes || 3),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function joinQueue(req, res) {
  try {
    const { canteenId } = req.body;

    const existing = await Queue.findOne({ user: req.userId, status: "waiting" });
    if (existing) {
      return res.status(409).json({ message: "You are already in a queue" });
    }

    const entry = await Queue.create({ canteen: canteenId, user: req.userId });
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function leaveQueue(req, res) {
  try {
    const entry = await Queue.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }
    if (entry.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your queue entry" });
    }

    entry.status = "cancelled";
    await entry.save();
    res.json({ message: "Left the queue" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Admin/counter action: mark the next person served, advancing everyone behind them
async function serveEntry(req, res) {
  try {
    const entry = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "served", servedAt: new Date() },
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getQueue, getMyQueueEntry, joinQueue, leaveQueue, serveEntry };
