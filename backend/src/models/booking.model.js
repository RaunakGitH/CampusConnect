const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listingId:  { type: mongoose.Schema.Types.ObjectId, ref: "Listing",  required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },

    // Slot details
    date:       { type: String, required: true },   // "YYYY-MM-DD"
    time:       { type: String, required: true },   // "HH:MM"
    slotLabel:  { type: String, default: "" },

    // User contact for confirmation
    userName:   { type: String, required: true },
    userPhone:  { type: String, required: true },
    userEmail:  { type: String, default: "" },
    message:    { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Payment (optional — for token advance)
    amountPaid:    { type: Number, default: 0 },
    cfOrderId:     { type: String, default: null },
    cfPaymentId:   { type: String, default: null },
  },
  { timestamps: true },
);

bookingSchema.index({ listingId: 1, date: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ ownerId: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
