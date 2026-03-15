const PartnerOffer = require("../models/partner.model");

const toFrontend = (doc) => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  category: doc.category,
  discountText: doc.discountText,
  partnerName: doc.partnerName,
  partnerContact: doc.partnerContact,
  validUntil: doc.validUntil,
  couponCode: doc.couponCode,
  listingId: doc.listingId?.toString(),
  isActive: doc.isActive,
});

// GET /api/partners?category=laundry
const getOffers = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    // Only show non-expired offers
    filter.$or = [{ validUntil: { $gte: new Date() } }, { validUntil: null }];
    const docs = await PartnerOffer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { offers: docs.map(toFrontend) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/partners  (admin only)
const createOffer = async (req, res, next) => {
  try {
    const doc = await PartnerOffer.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { offer: toFrontend(doc) } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/partners/:id  (admin only)
const deleteOffer = async (req, res, next) => {
  try {
    const doc = await PartnerOffer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Offer not found." });
    doc.isActive = false;
    await doc.save();
    res.json({ success: true, message: "Offer removed." });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOffers, createOffer, deleteOffer };
