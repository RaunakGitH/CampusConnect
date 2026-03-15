const mongoose = require("mongoose");

const partnerOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["laundry", "mess", "tiffin", "wifi", "stationery", "library", "cook", "movers_packers", "rental_electronics", "rental_furniture", "transport", "other"],
    },
    discountText: { type: String, required: true, trim: true }, // e.g. "20% off", "₹100 off"
    partnerName: { type: String, required: true, trim: true },
    partnerContact: { type: String, trim: true },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    couponCode: { type: String, trim: true, uppercase: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }, // optional linked listing
  },
  { timestamps: true },
);

module.exports = mongoose.models.PartnerOffer || mongoose.model("PartnerOffer", partnerOfferSchema);
