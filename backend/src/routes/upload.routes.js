const router     = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const upload     = require("../middleware/upload.middleware");
const { uploadImages } = require("../controllers/upload.controller");

// POST /api/upload/images  — upload 1–10 images, returns public URLs
// multer error handler wraps the route so multer errors return clean JSON
router.post(
  "/images",
  protect,
  (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed.",
        });
      }
      next();
    });
  },
  uploadImages
);

module.exports = router;
