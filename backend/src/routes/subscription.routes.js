const express = require("express");
const router  = express.Router();
const {
  getMySubscription,
  validateCoupon,
  applyCouponFree,
  createOrder,
  verifyOrder,
  handleWebhook,
  upgradeSubscription,
  cancelSubscription,
} = require("../controllers/subscription.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/me",              protect, getMySubscription);
router.post("/validate-coupon",protect, validateCoupon);    // validate & preview discount
router.post("/apply-coupon",   protect, applyCouponFree);   // apply free-month coupon
router.post("/create-order",   protect, createOrder);       // create Cashfree order
router.post("/verify-order",   protect, verifyOrder);       // verify after payment
router.post("/webhook",                 handleWebhook);     // NO auth — Cashfree calls this
router.post("/upgrade",        protect, upgradeSubscription); // dev fallback
router.post("/cancel",         protect, cancelSubscription);

module.exports = router;
