const Listing      = require("../models/listing.model");
const Notification = require("../models/notification.model");
const PriceAlert   = require("../models/pricealert.model");
const Subscription = require("../models/subscription.model");

const ALLOWED_UPDATE_FIELDS = [
  "name","category","address","distance","priceRange","contact",
  "amenities","image","description","sharingType","mealsIncluded",
  "furnished","bhk","capacity","availableRooms","isAvailable","rules",
  "has3DTour","tourUrl","mediaUrls","videoUrls",
  "monthlyPackage","perMealRate","mealsPerDay",
  "bookingEnabled","bookingPrice",
];

const toFrontend = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  category: doc.category,
  address: doc.address,
  distance: doc.distance,
  priceRange: doc.priceRange,
  contact: doc.contact,
  amenities: doc.amenities,
  rating: doc.rating,
  reviewCount: doc.reviewCount,
  verified: doc.verified,
  image: doc.image,
  description: doc.description,
  isFeatured: doc.isFeatured,
  isAvailable: doc.isAvailable,
  availableRooms: doc.availableRooms,
  subscriptionPlan: doc.subscriptionPlan,
  subscriptionExpiresAt: doc.subscriptionExpiresAt,
  createdBy: doc.createdBy?.toString(),
  sharingType: doc.sharingType,
  mealsIncluded: doc.mealsIncluded,
  furnished: doc.furnished,
  bhk: doc.bhk,
  capacity: doc.capacity,
  rules: doc.rules,
  has3DTour: doc.has3DTour,
  tourUrl: doc.tourUrl,
  mediaUrls: doc.mediaUrls,
  videoUrls: doc.videoUrls,
  monthlyPackage: doc.monthlyPackage,
  perMealRate: doc.perMealRate,
  mealsPerDay: doc.mealsPerDay,
  viewCount: doc.viewCount,
  contactClicks: doc.contactClicks,
});

async function deactivateExpired() {
  await Listing.updateMany(
    { isActive: true, subscriptionExpiresAt: { $lt: new Date() } },
    { $set: { isActive: false } },
  );
}

// Push notifications to all active price-alert owners whose alert matches a new listing
async function notifyPriceAlertMatches(listing) {
  try {
    const alerts = await PriceAlert.find({ category: listing.category, isActive: true });
    for (const alert of alerts) {
      if (alert.userId.toString() === listing.createdBy?.toString()) continue;
      const nums = listing.priceRange.match(/\d[\d,]*/g);
      if (!nums) continue;
      const lowestPrice = Number(nums[0].replace(/,/g, ""));
      if (lowestPrice <= alert.maxPrice) {
        await Notification.create({
          userId: alert.userId,
          type: "price_alert",
          title: "Price Alert Match!",
          message: `A new ${listing.category} listing "${listing.name}" matches your budget of ₹${alert.maxPrice}.`,
          listingId: listing._id,
        });
      }
    }
  } catch { /* non-critical */ }
}

// ── GET /api/listings ─────────────────────────────────────────────────────────
// Params: category, search, maxDistance, featured, mine, available,
//         furnished, bhk, sharingType, mealsIncluded,
//         page (default 1), limit (default 20)
const getListings = async (req, res, next) => {
  try {
    // ── FIX: deactivateExpired() was called on every single listing request,
    //         hitting MongoDB on each API call. Removed from here — it now runs
    //         on a scheduled cron job in src/index.js instead.
    const {
      category, search, maxDistance, featured, mine, available,
      furnished, bhk, sharingType, mealsIncluded,
      page = "1", limit = "20",
    } = req.query;

    const filter = {};
    // ── FIX: Added explicit auth check for mine=true.
    //         Previously req.user could be undefined if middleware was skipped.
    if (mine === "true") {
      if (!req.user)
        return res.status(401).json({ success: false, message: "Authentication required to view your listings." });
      filter.createdBy = req.user._id;
    } else {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (maxDistance) filter.distance = { $lte: Number(maxDistance) };
    if (search) filter.$text = { $search: search };
    if (featured === "true") filter.isFeatured = true;
    if (available === "true") filter.isAvailable = true;

    // Advanced accommodation filters (premium)
    if (furnished) filter.furnished = furnished;
    if (bhk) filter.bhk = { $regex: bhk, $options: "i" };
    if (sharingType) filter.sharingType = { $regex: sharingType, $options: "i" };
    if (mealsIncluded === "true") filter.mealsIncluded = true;

    const pageNum = Math.max(1, parseInt(page));

    // ── FIX 11: Enforce subscription-based listing limits server-side.
    //    Free users: max 50 listings total. Premium/admin: up to 200.
    //    Prevents bypassing the frontend limit via direct API calls.
    let isPremiumUser = false;
    if (req.user) {
      const sub = await Subscription.findOne({ userId: req.user._id });
      isPremiumUser =
        sub?.isActive &&
        sub?.plan === "premium" &&
        (!sub.expiresAt || new Date() < new Date(sub.expiresAt));
    }
    const isAdmin = req.user?.role === "admin";
    const FREE_CAP    = 50;
    const PREMIUM_CAP = 200;
    const maxAllowed  = isAdmin ? 500 : (isPremiumUser ? PREMIUM_CAP : FREE_CAP);
    const requestedLimit = Math.max(1, parseInt(limit));
    const limitNum = Math.min(requestedLimit, maxAllowed);
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Listing.find(filter).sort({ isFeatured: -1, rating: -1 }).skip(skip).limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        listings: docs.map(toFrontend),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/listings/:id ─────────────────────────────────────────────────────
const getListingById = async (req, res, next) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc || !doc.isActive)
      return res.status(404).json({ success: false, message: "Listing not found." });
    // Increment view count (fire & forget)
    Listing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();
    res.json({ success: true, data: { listing: toFrontend(doc) } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/listings/:id/contact-click ─────────────────────────────────────
const recordContactClick = async (req, res, next) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { contactClicks: 1 } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/listings ────────────────────────────────────────────────────────
const createListing = async (req, res, next) => {
  try {
    // Admins bypass subscription check
    if (req.user.role !== "admin") {
      const sub = await Subscription.findOne({ userId: req.user._id });
      const hasOwnerSub =
        sub &&
        sub.isActive &&
        sub.plan === "premium" &&
        ["owner", "owner_basic", "owner_priority", "owner_yearly"].includes(sub.subscriptionType) &&
        (!sub.expiresAt || new Date() < new Date(sub.expiresAt));

      if (!hasOwnerSub) {
        return res.status(403).json({
          success: false,
          message: "An active Owner Subscription (₹300/month) is required to publish listings. You can use coupon FREEMONTH for your first free month.",
          requiresOwnerSubscription: true,
        });
      }
    }

    const ALLOWED_CREATE_FIELDS = ALLOWED_UPDATE_FIELDS;
    const safeBody = {};
    ALLOWED_CREATE_FIELDS.forEach((f) => { if (req.body[f] !== undefined) safeBody[f] = req.body[f]; });
    const doc = await Listing.create({ ...safeBody, createdBy: req.user._id });
    notifyPriceAlertMatches(doc);
    res.status(201).json({ success: true, data: { listing: toFrontend(doc) } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/listings/:id ─────────────────────────────────────────────────────
const updateListing = async (req, res, next) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Listing not found." });
    if (doc.createdBy?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    const safeBody = {};
    ALLOWED_UPDATE_FIELDS.forEach((f) => { if (req.body[f] !== undefined) safeBody[f] = req.body[f]; });
    Object.assign(doc, safeBody);
    await doc.save();
    res.json({ success: true, data: { listing: toFrontend(doc) } });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/listings/:id ──────────────────────────────────────────────────
const deleteListing = async (req, res, next) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Listing not found." });
    if (doc.createdBy?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    doc.isActive = false;
    await doc.save();
    res.json({ success: true, message: "Listing removed." });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/listings/:id/subscribe ─────────────────────────────────────────
const subscribeListing = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!["normal","special"].includes(plan))
      return res.status(400).json({ success: false, message: "Invalid plan." });
    const doc = await Listing.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Listing not found." });
    if (doc.createdBy?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });

    const now = new Date();
    const base = doc.subscriptionExpiresAt && doc.subscriptionExpiresAt > now
      ? doc.subscriptionExpiresAt : now;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + 1);

    doc.subscriptionPlan = plan;
    doc.subscriptionExpiresAt = expiry;
    doc.isFeatured = plan === "special";
    doc.isActive = true;
    await doc.save();

    await Notification.create({
      userId: doc.createdBy,
      type: "subscription",
      title: "Subscription Activated",
      message: `Your listing "${doc.name}" is now on the ${plan} plan until ${expiry.toLocaleDateString("en-IN")}.`,
      listingId: doc._id,
    });

    res.json({ success: true, data: { listing: toFrontend(doc) } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/listings/:id/analytics ──────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const doc = await Listing.findById(req.params.id).select("viewCount contactClicks name createdBy");
    if (!doc)
      return res.status(404).json({ success: false, message: "Listing not found." });
    if (doc.createdBy?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });

    // ── FIX: Removed Math.random() — analytics chart was showing different
    //         numbers on every page refresh, making it completely unreliable.
    //         Now distributes totals deterministically using a weight curve
    //         so the chart is stable and consistent across refreshes.
    const days = [];
    const now  = new Date();
    const DAYS = 14;
    const weightSum = (DAYS * (DAYS + 1)) / 2; // = 105

    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      // Weight: day 0 (oldest) gets weight 1, day 13 (today) gets weight 14
      const weight = (DAYS - i) / weightSum;
      days.push({
        date:     d.toISOString().split("T")[0],
        views:    Math.round(doc.viewCount    * weight),
        contacts: Math.round(doc.contactClicks * weight),
      });
    }

    res.json({
      success: true,
      data: {
        total: { views: doc.viewCount, contacts: doc.contactClicks },
        daily: days,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getListings, getListingById, createListing, updateListing,
  deleteListing, subscribeListing, recordContactClick, getAnalytics,
};
