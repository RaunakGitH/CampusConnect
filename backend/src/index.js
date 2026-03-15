require("dotenv").config();

// ── FIX: Validate required env vars at startup so missing secrets produce a
//         clear error message instead of a cryptic jwt.sign(undefined) crash.
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("   Copy .env.example to .env and fill in the values.\n");
  process.exit(1);
}

const app       = require("./app");
const connectDB = require("./config/db");
const Listing   = require("./models/listing.model");

const PORT = process.env.PORT || 5000;

// ── FIX: deactivateExpired was running on every single listing API request.
//         Moved here as a scheduled job that runs once at midnight daily.
async function deactivateExpiredListings() {
  try {
    const result = await Listing.updateMany(
      { isActive: true, subscriptionExpiresAt: { $lt: new Date(), $ne: null } },
      { $set: { isActive: false } },
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Deactivated ${result.modifiedCount} expired listing(s).`);
    }
  } catch (err) {
    console.error("deactivateExpiredListings error:", err.message);
  }
}

function scheduleMidnightCron(fn) {
  const now    = new Date();
  const next   = new Date();
  next.setHours(24, 0, 0, 0); // next midnight
  const msUntilMidnight = next - now;

  setTimeout(() => {
    fn(); // run at first midnight
    setInterval(fn, 24 * 60 * 60 * 1000); // then every 24h
  }, msUntilMidnight);
}

connectDB().then(() => {
  // Run once on startup to catch any already-expired listings, then daily at midnight
  deactivateExpiredListings();
  scheduleMidnightCron(deactivateExpiredListings);

  app.listen(PORT, () => {
    console.log(`🚀 Campus Connect API running on http://localhost:${PORT}`);
  });
});
