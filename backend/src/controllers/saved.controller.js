const User = require("../models/user.model");
const Listing = require("../models/listing.model");

// Reuse the toFrontend mapper from listing controller inline (avoids circular deps)
const toFrontend = (doc) => ({
  id: doc._id.toString(),
  name: doc.name, category: doc.category, address: doc.address,
  distance: doc.distance, priceRange: doc.priceRange, contact: doc.contact,
  amenities: doc.amenities, rating: doc.rating, reviewCount: doc.reviewCount,
  verified: doc.verified, image: doc.image, description: doc.description,
  isFeatured: doc.isFeatured, isAvailable: doc.isAvailable,
  availableRooms: doc.availableRooms, subscriptionPlan: doc.subscriptionPlan,
  subscriptionExpiresAt: doc.subscriptionExpiresAt,
  createdBy: doc.createdBy?.toString(),
  sharingType: doc.sharingType, mealsIncluded: doc.mealsIncluded,
  furnished: doc.furnished, bhk: doc.bhk, capacity: doc.capacity,
  rules: doc.rules, has3DTour: doc.has3DTour, tourUrl: doc.tourUrl,
  mediaUrls: doc.mediaUrls, videoUrls: doc.videoUrls,
  monthlyPackage: doc.monthlyPackage, perMealRate: doc.perMealRate, mealsPerDay: doc.mealsPerDay,
  viewCount: doc.viewCount, contactClicks: doc.contactClicks,
});

// GET /api/saved  — returns user's saved listings
const getSaved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedListings");
    const listings = (user.savedListings || []).filter((l) => l.isActive);
    res.json({ success: true, data: { listings: listings.map(toFrontend), count: listings.length } });
  } catch (err) { next(err); }
};

// POST /api/saved/:id  — toggle save/unsave, returns { saved: bool, count: number }
const toggleSave = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);
    const idx = (user.savedListings || []).findIndex((id) => id.toString() === listingId);

    if (idx === -1) {
      // Save it
      user.savedListings = [...(user.savedListings || []), listingId];
    } else {
      // Unsave it
      user.savedListings = user.savedListings.filter((id) => id.toString() !== listingId);
    }
    await user.save();
    res.json({ success: true, data: { saved: idx === -1, count: user.savedListings.length } });
  } catch (err) { next(err); }
};

module.exports = { getSaved, toggleSave };
