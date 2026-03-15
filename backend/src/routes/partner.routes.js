const router = require("express").Router();
const { getOffers, createOffer, deleteOffer } = require("../controllers/partner.controller");
const { protect, restrict } = require("../middleware/auth.middleware");

router.get("/", getOffers);
router.post("/", protect, restrict("admin"), createOffer);
router.delete("/:id", protect, restrict("admin"), deleteOffer);

module.exports = router;
