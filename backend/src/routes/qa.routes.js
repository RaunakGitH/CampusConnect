const router = require("express").Router();
const { getQA, askQuestion, answerQuestion, deleteQuestion } = require("../controllers/qa.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", getQA);                                // public — list questions for a listing
router.post("/", protect, askQuestion);                // auth — ask question
router.post("/:id/answer", protect, answerQuestion);   // auth — owner/admin answers
router.delete("/:id", protect, deleteQuestion);        // auth — asker/admin deletes

module.exports = router;
