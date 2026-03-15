const Review = require("../models/review.model");
const Listing = require("../models/listing.model");
const Notification = require("../models/notification.model");

const toFrontend = (doc) => ({
  id: doc._id.toString(),
  listingId: doc.listingId.toString(),
  userName: doc.userName,
  rating: doc.rating,
  comment: doc.comment,
  date: doc.date || doc.createdAt?.toISOString().split("T")[0],
});

async function recalcRating(listingId) {
  const agg = await Review.aggregate([
    { $match: { listingId: new (require("mongoose").Types.ObjectId)(listingId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Listing.findByIdAndUpdate(listingId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
  return { rating: Math.round(avg * 10) / 10, reviewCount: count };
}

// GET /api/reviews?listingId=xxx
const getReviews = async (req, res, next) => {
  try {
    const { listingId } = req.query;
    if (!listingId)
      return res.status(400).json({ success: false, message: "listingId required." });
    const docs = await Review.find({ listingId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { reviews: docs.map(toFrontend) } });
  } catch (err) { next(err); }
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { listingId, rating, comment } = req.body;
    if (!listingId || !rating || !comment)
      return res.status(400).json({ success: false, message: "listingId, rating, and comment are required." });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "Rating must be 1–5." });

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found." });

    // Prevent duplicate review from same user
    const existing = await Review.findOne({ listingId, userId: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: "You have already reviewed this listing." });

    const doc = await Review.create({
      listingId,
      userName: req.user.name,
      userId: req.user._id,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    });

    // Recalculate rating
    const { rating: newRating, reviewCount } = await recalcRating(listingId);

    // Notify listing owner
    if (listing.createdBy && listing.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: listing.createdBy,
        type: "review",
        title: "New Review Received",
        message: `${req.user.name} left a ${rating}★ review on "${listing.name}": "${comment.slice(0, 60)}${comment.length > 60 ? "…" : ""}"`,
        listingId: listing._id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        review: toFrontend(doc),
        listingRating: newRating,
        listingReviewCount: reviewCount,
      },
    });
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const doc = await Review.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Review not found." });
    if (doc.userId?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    const { listingId } = doc;
    await doc.deleteOne();
    await recalcRating(listingId);
    res.json({ success: true, message: "Review deleted." });
  } catch (err) { next(err); }
};

module.exports = { getReviews, createReview, deleteReview };
