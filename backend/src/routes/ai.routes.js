const router = require("express").Router();
const { generateDescription, smartSearch, reviewSummary, chat, priceFairness, relocationChecklist, roommateCompatibility } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/generate-description",    protect, generateDescription);
router.post("/smart-search",            smartSearch);
router.post("/review-summary",          reviewSummary);
router.post("/chat",                    chat);
router.post("/price-fairness",          priceFairness);
router.post("/relocation-checklist",    relocationChecklist);
router.post("/roommate-compatibility",  protect, roommateCompatibility);

module.exports = router;
