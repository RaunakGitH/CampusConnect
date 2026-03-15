/**
 * Admin Controller — Campus Connect
 * All routes require protect + restrict("admin")
 */

const User         = require("../models/user.model");
const Listing      = require("../models/listing.model");
const Review       = require("../models/review.model");
const Subscription = require("../models/subscription.model");
const PartnerOffer = require("../models/partner.model");
const Notification = require("../models/notification.model");

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalListings, activeListings,
      totalReviews, premiumUsers, totalOffers,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ isActive: true }),
      Review.countDocuments(),
      Subscription.countDocuments({ isActive: true, plan: "premium" }),
      PartnerOffer.countDocuments({ isActive: true }),
    ]);

    // New signups last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const newListingsThisWeek = await Listing.countDocuments({ createdAt: { $gte: weekAgo } });

    // Category breakdown
    const categoryBreakdown = await Listing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity (last 5 users + listings)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt");
    const recentListings = await Listing.find().sort({ createdAt: -1 }).limit(5).select("name category isActive verified createdAt");

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalListings, activeListings,
          totalReviews, premiumUsers, totalOffers,
          newUsersThisWeek, newListingsThisWeek,
          inactiveListings: totalListings - activeListings,
        },
        categoryBreakdown,
        recentUsers,
        recentListings,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = "1", limit = "20", role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select("-refreshToken"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["student", "employee", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role." });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "User deleted." });
  } catch (err) { next(err); }
};

// ── GET /api/admin/listings ───────────────────────────────────────────────────
const getListings = async (req, res, next) => {
  try {
    const { page = "1", limit = "20", category, verified, isActive, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (verified !== undefined) filter.verified = verified === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.$text = { $search: search };

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/listings/:id/verify ─────────────────────────────────────
const verifyListing = async (req, res, next) => {
  try {
    const { verified } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { verified: Boolean(verified) },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });

    // Notify owner
    if (listing.createdBy) {
      await Notification.create({
        userId: listing.createdBy,
        type: "system",
        title: verified ? "✅ Listing Verified!" : "❌ Verification Removed",
        message: verified
          ? `Your listing "${listing.name}" has been verified by CampusConnect admin.`
          : `Verification badge removed from "${listing.name}".`,
        listingId: listing._id,
      }).catch(() => {});
    }

    res.json({ success: true, data: { listing } });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/listings/:id/toggle ─────────────────────────────────────
const toggleListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });
    listing.isActive = !listing.isActive;
    await listing.save();
    res.json({ success: true, data: { listing } });
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/listings/:id ───────────────────────────────────────────
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });
    res.json({ success: true, message: "Listing permanently deleted." });
  } catch (err) { next(err); }
};

// ── GET /api/admin/partner-offers ────────────────────────────────────────────
const getPartnerOffers = async (req, res, next) => {
  try {
    const offers = await PartnerOffer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { offers } });
  } catch (err) { next(err); }
};

// ── POST /api/admin/partner-offers ───────────────────────────────────────────
const createPartnerOffer = async (req, res, next) => {
  try {
    const offer = await PartnerOffer.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { offer } });
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/partner-offers/:id ─────────────────────────────────────
const deletePartnerOffer = async (req, res, next) => {
  try {
    const offer = await PartnerOffer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found." });
    res.json({ success: true, message: "Offer deactivated." });
  } catch (err) { next(err); }
};

// ── POST /api/admin/broadcast ─────────────────────────────────────────────────
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message)
      return res.status(400).json({ success: false, message: "title and message required." });

    const filter = targetRole ? { role: targetRole } : {};
    const users  = await User.find(filter).select("_id");

    const notifications = users.map((u) => ({
      userId: u._id, type: "system", title, message,
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Sent to ${users.length} users.` });
  } catch (err) { next(err); }
};

module.exports = {
  getStats, getUsers, updateUserRole, deleteUser,
  getListings, verifyListing, toggleListing, deleteListing,
  getPartnerOffers, createPartnerOffer, deletePartnerOffer,
  broadcastNotification,
};
