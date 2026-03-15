const https = require("https");
const User = require("../models/user.model");
const { signAccessToken, signRefreshToken } = require("../utils/jwt.utils");
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Fetch Google user info using the access token from the client
function fetchGoogleUser(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "www.googleapis.com",
      path: `/oauth2/v3/userinfo`,
      headers: { Authorization: `Bearer ${accessToken}` },
    };
    const req = https.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid response")); }
      });
    });
    req.on("error", reject);
  });
}

// POST /api/auth/google
// Body: { accessToken } — the token from Google OAuth on the frontend (using Google Identity SDK)
const googleAuth = async (req, res, next) => {
  try {
    const { accessToken: googleAccessToken } = req.body;
    if (!googleAccessToken)
      return res.status(400).json({ success: false, message: "accessToken is required." });

    const googleUser = await fetchGoogleUser(googleAccessToken);
    if (!googleUser.sub || !googleUser.email)
      return res.status(400).json({ success: false, message: "Invalid Google token." });

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId: googleUser.sub }, { email: googleUser.email }] });

    if (!user) {
      user = await User.create({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        googleId: googleUser.sub,
        avatar: googleUser.picture || "",
        authProvider: "google",
        role: "student",
      });
    } else if (!user.googleId) {
      // Link Google to existing email account
      user.googleId = googleUser.sub;
      user.avatar = user.avatar || googleUser.picture || "";
      user.authProvider = "google";
      await user.save();
    }

    const accessToken  = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    // ── FIX: Store refresh token so the 7-day session works for OAuth users
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { googleAuth };
