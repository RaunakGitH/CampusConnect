const router = require("express").Router();
const { getReviews, createReview, deleteReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", getReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;