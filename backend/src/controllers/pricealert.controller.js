const PriceAlert   = require("../models/pricealert.model");
const Listing      = require("../models/listing.model");
const Notification = require("../models/notification.model");

function extractLowestPrice(priceRange) {
  const nums = priceRange.match(/\d[\d,]*/g);
  if (!nums) return Infinity;
  return Number(nums[0].replace(/,/g, ""));
}

// FIX: Notify user of existing matching listings when a new alert is created
async function notifyExistingMatches(alert) {
  try {
    const filter = { isActive: true, category: alert.category };
    if (alert.location) filter.address = { $regex: alert.location, $options: "i" };
    const listings = await Listing.find(filter).limit(5);
    const matching = listings.filter((l) => extractLowestPrice(l.priceRange) <= alert.maxPrice);
    if (matching.length === 0) return;

    // Bug fix: check if we already sent a notification for this alert recently
    // to prevent duplicate notifications when multiple alerts match same listings
    const recentNotif = await Notification.findOne({
      userId: alert.userId,
      type: "price_alert",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // within last hour
    });
    if (recentNotif) return; // already notified recently

    await Notification.create({
      userId: alert.userId,
      type: "price_alert",
      title: `🔔 ${matching.length} existing match${matching.length > 1 ? "es" : ""} for your alert!`,
      message: `Found ${matching.length} ${alert.category} listing${matching.length > 1 ? "s" : ""} under ₹${alert.maxPrice}. Check them out now!`,
    });
  } catch { /* non-critical */ }
}

const getAlerts = async (req, res, next) => {
  try {
    const docs = await PriceAlert.find({ userId: req.user._id, isActive: true });
    res.json({ success: true, data: { alerts: docs } });
  } catch (err) { next(err); }
};

const createAlert = async (req, res, next) => {
  try {
    const { category, maxPrice, location } = req.body;
    if (!category || !maxPrice)
      return res.status(400).json({ success: false, message: "category and maxPrice are required." });
    const doc = await PriceAlert.create({ userId: req.user._id, category, maxPrice: Number(maxPrice), location });
    // FIX: Check existing listings immediately on alert creation
    notifyExistingMatches(doc);
    res.status(201).json({ success: true, data: { alert: doc } });
  } catch (err) { next(err); }
};

const deleteAlert = async (req, res, next) => {
  try {
    const doc = await PriceAlert.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Alert not found." });
    if (doc.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized." });
    doc.isActive = false;
    await doc.save();
    res.json({ success: true, message: "Alert removed." });
  } catch (err) { next(err); }
};

const checkAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.user._id, isActive: true });
    if (!alerts.length) return res.json({ success: true, data: { matches: [] } });
    const matches = [];
    for (const alert of alerts) {
      const filter = { isActive: true, category: alert.category };
      if (alert.location) filter.address = { $regex: alert.location, $options: "i" };
      const listings = await Listing.find(filter);
      const matching = listings.filter((l) => extractLowestPrice(l.priceRange) <= alert.maxPrice);
      if (matching.length) {
        matches.push({ alert, listings: matching.map((l) => ({ id: l._id, name: l.name, priceRange: l.priceRange, category: l.category })) });
      }
    }
    res.json({ success: true, data: { matches } });
  } catch (err) { next(err); }
};

module.exports = { getAlerts, createAlert, deleteAlert, checkAlerts };
