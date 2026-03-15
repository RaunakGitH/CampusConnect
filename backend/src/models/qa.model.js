const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    // Question
    question: { type: String, required: true, trim: true, maxlength: 500 },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    askedByName: { type: String, required: true, trim: true },
    // Answer (filled by listing owner or admin)
    answer: { type: String, trim: true, maxlength: 1000, default: "" },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    answeredByName: { type: String, default: "" },
    answeredAt: { type: Date, default: null },
    isAnswered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

qaSchema.index({ listingId: 1, createdAt: -1 });
qaSchema.index({ listingId: 1, isAnswered: 1 });

module.exports = mongoose.models.QA || mongoose.model("QA", qaSchema);
