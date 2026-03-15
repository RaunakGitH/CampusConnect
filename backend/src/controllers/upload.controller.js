const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// ── POST /api/upload/images ───────────────────────────────────────────────────
// Accepts 1–10 image files (field name: "images").
// Returns array of public URLs the frontend can store on the listing.
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded." });

    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const urls = req.files.map(
      (f) => `${baseUrl}/uploads/${f.filename}`
    );

    res.json({ success: true, data: { urls } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /uploads/:filename — static file serving handled by express.static ───
// No controller needed — app.js serves the uploads folder as static files.

module.exports = { uploadImages };
