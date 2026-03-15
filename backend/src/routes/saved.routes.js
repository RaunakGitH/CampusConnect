const router = require("express").Router();
const { getSaved, toggleSave } = require("../controllers/saved.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getSaved);
router.post("/:id", protect, toggleSave);   // POST to toggle — returns { saved: true/false }

module.exports = router;
