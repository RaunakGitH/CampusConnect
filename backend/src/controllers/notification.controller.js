const Notification = require("../models/notification.model");

// GET /api/notifications  (user's own, newest first)
const getNotifications = async (req, res, next) => {
  try {
    const { limit = "20", unreadOnly } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === "true") filter.read = false;
    const docs = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(50, parseInt(limit)));
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, data: { notifications: docs, unreadCount } });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const doc = await Notification.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found." });
    if (doc.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized." });
    doc.read = true;
    await doc.save();
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
