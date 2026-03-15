const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const listingRoutes = require("./routes/listing.routes");
const reviewRoutes = require("./routes/review.routes");
const partnerRoutes = require("./routes/partner.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const alertRoutes = require("./routes/pricealert.routes");
const notificationRoutes = require("./routes/notification.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const savedRoutes = require("./routes/saved.routes");
const qaRoutes = require("./routes/qa.routes");
const collegeRoutes = require("./routes/college.routes");
const aiRoutes   = require("./routes/ai.routes");
const bookingRoutes  = require("./routes/booking.routes");
const roommateRoutes = require("./routes/roommate.routes");
const adminRoutes    = require("./routes/admin.routes");
const uploadRoutes   = require("./routes/upload.routes");

const app = express();

const path = require("path");

app.use(helmet());

const clientUrls = (
  process.env.CLIENT_URLS || process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:8080,http://localhost:8081"
).split(",").map((s) => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || clientUrls.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

// General rate limit: 500 requests per 15 min
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please wait a moment and try again." },
}));

// Auth-specific: 50 requests per 15 min (up from 20)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skip: (req) => !req.path.startsWith("/api/auth"),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts — please wait 15 minutes and try again." },
}));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Serve uploaded images as static files
app.use("/uploads", require("express").static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api/roommates", roommateRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/upload",   uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
