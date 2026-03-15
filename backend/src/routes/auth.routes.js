const router  = require("express").Router();
const { register, login, refreshToken, logout, me, setOwnerRole } = require("../controllers/auth.controller");
const { googleAuth } = require("../controllers/oauth.controller");
const { protect }   = require("../middleware/auth.middleware");

router.post("/register",         register);
router.post("/login",            login);
router.post("/refresh-token",    refreshToken);
// ── FIX: logout must work even with an expired access token
router.post("/logout", logout);
router.get("/me",                protect, me);
router.post("/google",           googleAuth);
router.post("/set-owner-role",   protect, setOwnerRole);

module.exports = router;
