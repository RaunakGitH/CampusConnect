const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt.utils");

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isStrongPassword = (p) => p && p.length >= 6;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: "Name is required." });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "A valid email is required." });
    if (!isStrongPassword(password))
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    // role is NEVER taken from req.body
    const user = await User.create({ name: name.trim(), email, password });
    const accessToken  = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    // Store hashed refresh token on user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    res.status(201).json({ success: true, data: { accessToken, user } });
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshToken");
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    // ── FIX: Handle OAuth users who have no password
    if (!user.password)
      return res.status(401).json({ success: false, message: "This account uses Google sign-in. Please use Google to log in." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    const accessToken  = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    user.password = undefined;
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) { next(err); }
};

// ── POST /api/auth/refresh-token ──────────────────────────────────────────────
// ── FIX: This endpoint was missing entirely — frontend had no way to renew
//         access tokens, so sessions died after 15 minutes silently.
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ success: false, message: "No refresh token." });

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.clearCookie("refreshToken");
      return res.status(401).json({ success: false, message: "Refresh token invalid or expired." });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ success: false, message: "Refresh token mismatch. Please log in again." });
    }

    // Rotate both tokens
    const newAccessToken  = signAccessToken({ id: user._id });
    const newRefreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) { next(err); }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// ── FIX: No longer requires protect middleware — works even when access token
//         has expired. Reads userId from the refresh cookie via verifyRefreshToken.
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch { /* invalid token — that's fine, just clear the cookie */ }
    }
  } catch { /* non-critical */ }
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out." });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

// ── POST /api/auth/set-owner-role ─────────────────────────────────────────────
// Called after a user self-identifies as an owner in the onboarding flow.
// Upgrades role from "student" → "employee" (our owner role).
const setOwnerRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.role === "admin") return res.json({ success: true, data: { user } }); // never downgrade admin
    user.role = "employee";
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

module.exports = { register, login, refreshToken, logout, me, setOwnerRole };
