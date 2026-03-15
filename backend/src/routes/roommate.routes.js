const router = require("express").Router();
const { getMatches, updatePrefs, getMyPrefs } = require("../controllers/roommate.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/matches", protect, getMatches);
router.get("/prefs",   protect, getMyPrefs);
router.put("/prefs",   protect, updatePrefs);

module.exports = router;
