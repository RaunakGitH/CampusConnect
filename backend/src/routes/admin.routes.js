const router = require("express").Router();
const {
  getStats, getUsers, updateUserRole, deleteUser,
  getListings, verifyListing, toggleListing, deleteListing,
  getPartnerOffers, createPartnerOffer, deletePartnerOffer,
  broadcastNotification,
} = require("../controllers/admin.controller");
const { protect, restrict } = require("../middleware/auth.middleware");

// All admin routes require auth + admin role
router.use(protect, restrict("admin"));

// Stats
router.get("/stats", getStats);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Listings
router.get("/listings", getListings);
router.patch("/listings/:id/verify", verifyListing);
router.patch("/listings/:id/toggle", toggleListing);
router.delete("/listings/:id", deleteListing);

// Partner Offers
router.get("/partner-offers", getPartnerOffers);
router.post("/partner-offers", createPartnerOffer);
router.delete("/partner-offers/:id", deletePartnerOffer);

// Broadcast
router.post("/broadcast", broadcastNotification);

module.exports = router;
