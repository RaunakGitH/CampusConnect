const { verifyAccessToken } = require("../utils/jwt.utils");
const User = require("../models/user.model");

// Hard require — 401 if no valid token
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Not authorized." });
    const decoded = verifyAccessToken(auth.split(" ")[1]);
    req.user = await User.findById(decoded.id);
    if (!req.user)
      return res.status(401).json({ success: false, message: "User not found." });
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

// Soft attach — attaches user if token present, never 401s
const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      const decoded = verifyAccessToken(auth.split(" ")[1]);
      req.user = await User.findById(decoded.id);
    }
  } catch { /* ignore */ }
  next();
};

const restrict = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Requires role: ${roles.join(" or ")}` });
  next();
};

module.exports = { protect, optionalAuth, restrict };
