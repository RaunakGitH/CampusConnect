/**
 * Booking Controller — CampusConnect
 * Allows users to book a visit/slot directly from a listing page.
 *
 * Owner actions:
 *   PUT  /api/bookings/:id/status  — confirm / cancel / complete
 *   GET  /api/bookings/mine        — owner's incoming bookings
 *   POST /api/listings/:id/slots   — add available slots to a listing
 *
 * User actions:
 *   POST /api/bookings             — create a booking
 *   GET  /api/bookings/my          — user's own bookings
 *   DELETE /api/bookings/:id       — cancel own booking
 */

const Booking      = require("../models/booking.model");
const Listing      = require("../models/listing.model");
const Notification = require("../models/notification.model");

// ── POST /api/bookings ────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { listingId, date, time, slotLabel, userPhone, userEmail, message } = req.body;

    if (!listingId || !date || !time || !userPhone)
      return res.status(400).json({ success: false, message: "listingId, date, time, and userPhone are required." });

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive)
      return res.status(404).json({ success: false, message: "Listing not found." });

    if (!listing.bookingEnabled)
      return res.status(400).json({ success: false, message: "Bookings are not enabled for this listing." });

    // Check if slot is already booked
    const conflict = await Booking.findOne({
      listingId,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (conflict)
      return res.status(409).json({ success: false, message: "This slot is already booked. Please choose another." });

    const booking = await Booking.create({
      listingId,
      userId:    req.user._id,
      ownerId:   listing.createdBy,
      date,
      time,
      slotLabel: slotLabel || "",
      userName:  req.user.name,
      userPhone,
      userEmail: userEmail || req.user.email || "",
      message:   message || "",
    });

    // Mark slot as booked in listing (if using pre-defined slots)
    await Listing.updateOne(
      { _id: listingId, "bookingSlots.date": date, "bookingSlots.time": time },
      { $set: { "bookingSlots.$.booked": true } },
    );

    // Notify owner
    if (listing.createdBy) {
      await Notification.create({
        userId:    listing.createdBy,
        type:      "system",
        title:     "📅 New Booking Request!",
        message:   `${req.user.name} wants to visit "${listing.name}" on ${date} at ${time}. Phone: ${userPhone}`,
        listingId: listing._id,
      }).catch(() => {});
    }

    res.status(201).json({ success: true, data: { booking } });
  } catch (err) { next(err); }
};

// ── GET /api/bookings/my — user's own bookings ────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("listingId", "name category address image");
    res.json({ success: true, data: { bookings } });
  } catch (err) { next(err); }
};

// ── GET /api/bookings/mine — owner's incoming bookings ────────────────────────
const getOwnerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { ownerId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("listingId", "name category address image")
      .populate("userId",    "name email");
    res.json({ success: true, data: { bookings } });
  } catch (err) { next(err); }
};

// ── PUT /api/bookings/:id/status ──────────────────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "completed"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found." });

    // Only owner or the user themselves can update
    const isOwner = booking.ownerId?.toString() === req.user._id.toString();
    const isUser  = booking.userId?.toString()  === req.user._id.toString();
    if (!isOwner && !isUser && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });

    // User can only cancel their own
    if (isUser && !isOwner && status !== "cancelled")
      return res.status(403).json({ success: false, message: "You can only cancel your booking." });

    booking.status = status;
    await booking.save();

    // Free up slot if cancelled
    if (status === "cancelled") {
      await Listing.updateOne(
        { _id: booking.listingId, "bookingSlots.date": booking.date, "bookingSlots.time": booking.time },
        { $set: { "bookingSlots.$.booked": false } },
      );
    }

    // Notify the other party
    if (isOwner) {
      await Notification.create({
        userId:    booking.userId,
        type:      "system",
        title:     status === "confirmed" ? "✅ Booking Confirmed!" : status === "cancelled" ? "❌ Booking Cancelled" : "✅ Visit Completed",
        message:   `Your booking for ${booking.date} at ${booking.time} has been ${status} by the owner.`,
        listingId: booking.listingId,
      }).catch(() => {});
    }

    res.json({ success: true, data: { booking } });
  } catch (err) { next(err); }
};

// ── DELETE /api/bookings/:id — user cancels own booking ──────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found." });
    if (booking.userId?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });

    booking.status = "cancelled";
    await booking.save();

    await Listing.updateOne(
      { _id: booking.listingId, "bookingSlots.date": booking.date, "bookingSlots.time": booking.time },
      { $set: { "bookingSlots.$.booked": false } },
    );

    res.json({ success: true, message: "Booking cancelled." });
  } catch (err) { next(err); }
};

// ── GET /api/bookings/slots/:listingId — get available slots ─────────────────
const getListingSlots = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId).select("bookingSlots bookingEnabled bookingPrice");
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found." });

    // Filter out past slots
    const today = new Date().toISOString().split("T")[0];
    const slots  = (listing.bookingSlots || []).filter((s) => s.date >= today);

    res.json({ success: true, data: { slots, bookingEnabled: listing.bookingEnabled, bookingPrice: listing.bookingPrice } });
  } catch (err) { next(err); }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getListingSlots,
};
