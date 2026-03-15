const QA = require("../models/qa.model");
const Listing = require("../models/listing.model");
const Notification = require("../models/notification.model");

// GET /api/qa?listingId=xxx   — public
const getQA = async (req, res, next) => {
  try {
    const { listingId } = req.query;
    if (!listingId)
      return res.status(400).json({ success: false, message: "listingId required." });

    const docs = await QA.find({ listingId, isActive: true }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: { questions: docs } });
  } catch (err) { next(err); }
};

// POST /api/qa   — ask a question (auth required)
const askQuestion = async (req, res, next) => {
  try {
    const { listingId, question } = req.body;
    if (!listingId || !question?.trim())
      return res.status(400).json({ success: false, message: "listingId and question required." });
    if (question.trim().length < 5)
      return res.status(400).json({ success: false, message: "Question too short." });

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found." });

    const doc = await QA.create({
      listingId,
      question: question.trim(),
      askedBy: req.user._id,
      askedByName: req.user.name,
    });

    // Notify listing owner
    if (listing.createdBy && listing.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: listing.createdBy,
        type: "system",
        title: "New Question on Your Listing",
        message: `${req.user.name} asked: "${question.trim().slice(0, 80)}${question.length > 80 ? "…" : ""}"`,
        listingId: listing._id,
      });
    }

    res.status(201).json({ success: true, data: { question: doc } });
  } catch (err) { next(err); }
};

// POST /api/qa/:id/answer   — answer a question (listing owner or admin)
const answerQuestion = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim())
      return res.status(400).json({ success: false, message: "Answer is required." });

    const doc = await QA.findById(req.params.id);
    if (!doc || !doc.isActive)
      return res.status(404).json({ success: false, message: "Question not found." });

    // Only listing owner or admin can answer
    const listing = await Listing.findById(doc.listingId);
    const isOwner = listing?.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Only the listing owner can answer." });

    doc.answer = answer.trim();
    doc.answeredBy = req.user._id;
    doc.answeredByName = req.user.name;
    doc.answeredAt = new Date();
    doc.isAnswered = true;
    await doc.save();

    // Notify the person who asked
    if (doc.askedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: doc.askedBy,
        type: "system",
        title: "Your Question Was Answered!",
        message: `"${doc.question.slice(0, 60)}${doc.question.length > 60 ? "…" : ""}" — ${req.user.name} replied: "${answer.trim().slice(0, 80)}${answer.length > 80 ? "…" : ""}"`,
        listingId: doc.listingId,
      });
    }

    res.json({ success: true, data: { question: doc } });
  } catch (err) { next(err); }
};

// DELETE /api/qa/:id   — delete (asker or admin)
const deleteQuestion = async (req, res, next) => {
  try {
    const doc = await QA.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found." });
    if (doc.askedBy.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    doc.isActive = false;
    await doc.save();
    res.json({ success: true, message: "Question removed." });
  } catch (err) { next(err); }
};

module.exports = { getQA, askQuestion, answerQuestion, deleteQuestion };
