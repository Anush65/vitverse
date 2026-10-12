
const Listing = require("../models/Listing");

exports.getListings = async (req, res) => {
  try {
    const { search, category, type, minPrice, maxPrice } = req.query;
    const filter = { status: "available" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") filter.category = category;
    if (type && type !== "all") filter.type = type;

    if (minPrice !== "" && minPrice !== undefined) {
      filter.price = { ...filter.price, $gte: Number(minPrice) };
    }

    if (maxPrice !== "" && maxPrice !== undefined) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }

    const listings = await Listing.find(filter)
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(listings);
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

exports.createListing = async (req, res) => {
  try {
    const {
      title, description, category, type, price,
      rentalPeriod, condition, images,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !["Academic", "Electronics", "Essentials", "Clothing", "Sports", "Other"].includes(category) ||
      !["sell", "rent"].includes(type) ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({ message: "Please provide valid listing details" });
    }

    if (type === "rent" && !["hour", "day", "week"].includes(rentalPeriod)) {
      return res.status(400).json({ message: "Choose a valid rental period" });
    }

    const listing = await Listing.create({
      seller: req.userId,
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      price: Number(price),
      rentalPeriod: type === "rent" ? rentalPeriod : undefined,
      condition,
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ message: "Failed to create listing" });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your listing" });
    }

    const allowed = [
      "title", "description", "category", "type",
      "price", "rentalPeriod", "condition", "images", "status",
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) listing[key] = req.body[key];
    }

    await listing.save();
    res.json(listing);
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(400).json({ message: "Failed to update listing" });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ message: "Failed to delete listing" });
  }
};
