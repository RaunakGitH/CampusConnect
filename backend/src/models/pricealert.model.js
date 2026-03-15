const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    maxPrice: { type: Number, required: true },       // alert when listing priceRange is <= this (rough heuristic)
    location: { type: String, trim: true },           // area / address keyword
    isActive: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date },
  },
  { timestamps: true },
);

priceAlertSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.models.PriceAlert || mongoose.model("PriceAlert", priceAlertSchema);
