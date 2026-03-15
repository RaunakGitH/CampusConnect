const router = require("express").Router();
const {
  createBooking, getMyBookings, getOwnerBookings,
  updateBookingStatus, cancelBooking, getListingSlots,
} = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/",             protect, createBooking);
router.get("/my",            protect, getMyBookings);
router.get("/mine",          protect, getOwnerBookings);
router.put("/:id/status",   protect, updateBookingStatus);
router.delete("/:id",        protect, cancelBooking);
router.get("/slots/:listingId", getListingSlots);

module.exports = router;
