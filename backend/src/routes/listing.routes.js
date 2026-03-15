const router = require("express").Router();
const {
  getListings, getListingById, createListing, updateListing,
  deleteListing, subscribeListing, recordContactClick, getAnalytics,
} = require("../controllers/listing.controller");
const { protect, optionalAuth } = require("../middleware/auth.middleware");

router.get("/", optionalAuth, getListings);
router.get("/:id", getListingById);
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);
router.post("/:id/subscribe", protect, subscribeListing);
router.post("/:id/contact-click", recordContactClick);      // public
router.get("/:id/analytics", protect, getAnalytics);

module.exports = router;
