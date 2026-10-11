const Notice = require("../models/Notice");

// GET ALL NOTICES
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notices" });
  }
};

// GET SINGLE NOTICE
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("createdBy", "name");

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    res.status(400).json({ message: "Invalid notice ID" });
  }
};

// CREATE NOTICE
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const notice = await Notice.create({
      title,
      content,
      category,
      createdBy: req.userId,
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: "Failed to create notice" });
  }
};

// UPDATE NOTICE
exports.updateNotice = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content, category },
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    res.status(400).json({ message: "Failed to update notice" });
  }
};

// DELETE NOTICE
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete notice" });
  }
};