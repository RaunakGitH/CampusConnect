const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String, required: true,
      enum: [
        // Accommodation
        "hostel","pg","flat","private_room","dormitory",
        // Food
        "mess","food","tiffin","cook",
        // Services
        "laundry","transport","movers_packers",
        "stationery","medical","wifi","cyber_cafe","library",
        // Rentals
        "rental_electronics","rental_furniture",
      ],
    },
    address: { type: String, required: true, trim: true },
    distance: { type: Number, min: 0, default: 0 },  // optional — 0 = not specified
    priceRange: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    amenities: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    image: { type: String, default: "" },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },

    // ── Media ──────────────────────────────────────────────────────
    mediaUrls: [{ type: String }],      // photos
    videoUrls: [{ type: String }],      // YouTube / direct mp4 links
    has3DTour: { type: Boolean, default: false },
    tourUrl: { type: String, default: "" },

    // ── Accommodation fields ───────────────────────────────────────
    sharingType: { type: String, trim: true },
    mealsIncluded: { type: Boolean, default: false },
    furnished: { type: String, enum: ["furnished","semi-furnished","unfurnished",null], default: null },
    bhk: { type: String, trim: true },
    capacity: { type: Number, min: 1 },
    availableRooms: { type: Number, min: 0, default: null },   // null = not tracked
    isAvailable: { type: Boolean, default: true },              // Available / Full toggle
    rules: [{ type: String, trim: true }],

    // ── Mess-specific ──────────────────────────────────────────────
    monthlyPackage: { type: Number, default: null },   // ₹/month
    perMealRate: { type: Number, default: null },       // ₹/meal
    mealsPerDay: { type: Number, default: null },       // e.g. 3

    // ── Subscription ──────────────────────────────────────────────
    subscriptionPlan: { type: String, enum: ["normal","special"], default: "normal" },
    subscriptionExpiresAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },

    // ── Analytics ─────────────────────────────────────────────────
    viewCount: { type: Number, default: 0 },
    contactClicks: { type: Number, default: 0 },

    // ── Booking ───────────────────────────────────────────────────
    bookingEnabled: { type: Boolean, default: false },   // owner can toggle
    bookingPrice:   { type: Number, default: null },     // ₹ to pay at booking (token/advance)
    bookingSlots: [
      {
        date:   { type: String, required: true },   // "YYYY-MM-DD"
        time:   { type: String, required: true },   // "HH:MM"
        label:  { type: String, default: "" },      // e.g. "Morning Visit"
        booked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

listingSchema.index({ name: "text", description: "text", address: "text" });
listingSchema.index({ category: 1, isActive: 1 });
listingSchema.index({ subscriptionExpiresAt: 1 });
listingSchema.index({ createdBy: 1 });

module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
