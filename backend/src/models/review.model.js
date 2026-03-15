const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    userName: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    date: { type: String },
  },
  { timestamps: true },
);

// ── FIX: Removed duplicate post-save hook — review.controller.js handles
// recalculation after every write. Having both caused a race condition.

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
