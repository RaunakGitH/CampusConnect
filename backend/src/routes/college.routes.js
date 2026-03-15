// src/routes/college.routes.js
const router = require("express").Router();
const College = require("../models/college.model");
const User = require("../models/user.model");
const { protect, restrict } = require("../middleware/auth.middleware");

// GET /api/colleges?search=iit&city=Delhi   — public
router.get("/", async (req, res, next) => {
  try {
    const { search, city } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (search) filter.$text = { $search: search };
    const colleges = await College.find(filter).sort({ name: 1 }).limit(50);
    res.json({ success: true, data: { colleges } });
  } catch (err) { next(err); }
});

// PATCH /api/colleges/me   — set user's college (auth)
router.patch("/me", protect, async (req, res, next) => {
  try {
    const { collegeId } = req.body;
    if (!collegeId)
      return res.status(400).json({ success: false, message: "collegeId required." });

    const college = await College.findById(collegeId);
    if (!college)
      return res.status(404).json({ success: false, message: "College not found." });

    await User.findByIdAndUpdate(req.user._id, {
      college: college._id,
      collegeName: college.name,
    });

    res.json({ success: true, data: { college } });
  } catch (err) { next(err); }
});

// POST /api/colleges   — admin: add a college
router.post("/", protect, restrict("admin"), async (req, res, next) => {
  try {
    const { name, city, state, shortName } = req.body;
    if (!name || !city || !state)
      return res.status(400).json({ success: false, message: "name, city and state are required." });
    const doc = await College.create({ name, city, state, shortName });
    res.status(201).json({ success: true, data: { college: doc } });
  } catch (err) { next(err); }
});

module.exports = router;
