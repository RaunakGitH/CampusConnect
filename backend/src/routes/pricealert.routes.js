const router = require("express").Router();
const { getAlerts, createAlert, deleteAlert, checkAlerts } = require("../controllers/pricealert.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getAlerts);
router.get("/check", protect, checkAlerts);
router.post("/", protect, createAlert);
router.delete("/:id", protect, deleteAlert);

module.exports = router;
