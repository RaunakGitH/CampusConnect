/**
 * Subscription Controller — Cashfree Payment Gateway
 *
 * Subscription tiers:
 *   STUDENT premium     ₹59/month   — advanced filters, price alerts, partner deals
 *   OWNER BASIC         ₹299/month  — publish & manage listings
 *   OWNER PRIORITY      ₹799/month  — priority placement + ads banner + featured badge
 *   OWNER YEARLY        ₹3,000/year — owner_basic for full year (save ₹588)
 *
 * Coupons:
 *   STUDENT10   — student 10% off
 *   WELCOME50   — ₹50 off any plan
 */

const axios        = require("axios");
const crypto       = require("crypto");
const Subscription = require("../models/subscription.model");
const Notification = require("../models/notification.model");

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PRICES = {
  student:        59,
  owner_basic:   299,
  owner_priority: 799,
  owner_yearly:  3000,
  owner:         299, // legacy alias → owner_basic
};

// Months of access granted per plan (default 1)
const DURATION_MONTHS = {
  owner_yearly: 12,
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
const COUPONS = {
  FREEMONTH:  { type: "free_month",  forType: "owner",         value: 0   },
  STUDENT10:  { type: "percent_off", forType: "student",  value: 10  },
  WELCOME50:  { type: "flat_off",    forType: "any",      value: 50  },
};

function applyCoupon(couponCode, subscriptionType) {
  if (!couponCode) return { valid: false };
  const coupon = COUPONS[couponCode.toUpperCase()];
  if (!coupon) return { valid: false, error: "Invalid coupon code." };
  const ownerTypes = ["owner", "owner_basic", "owner_priority", "owner_yearly"];
  const couponMatchesType =
    coupon.forType === "any" ||
    coupon.forType === subscriptionType ||
    (coupon.forType === "owner" && ownerTypes.includes(subscriptionType));
  if (!couponMatchesType)
    return { valid: false, error: "This coupon is only valid for owner subscriptions." };
  return { valid: true, coupon, code: couponCode.toUpperCase() };
}

function calculateFinalPrice(basePrice, coupon) {
  if (!coupon) return basePrice;
  if (coupon.type === "free_month")  return 0;
  if (coupon.type === "percent_off") return Math.round(basePrice * (1 - coupon.value / 100));
  if (coupon.type === "flat_off")    return Math.max(0, basePrice - coupon.value);
  return basePrice;
}

// ─── Cashfree config ──────────────────────────────────────────────────────────
const getCfConfig = () => {
  const appId  = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  const env    = process.env.CASHFREE_ENV || "sandbox";
  if (!appId || !secret)
    throw new Error("Cashfree not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env");
  const baseUrl = env === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
  return {
    baseUrl,
    headers: {
      "x-api-version":   "2023-08-01",
      "x-client-id":     appId,
      "x-client-secret": secret,
      "Content-Type":    "application/json",
    },
  };
};

// ─── Activate subscription ────────────────────────────────────────────────────
const activateSubscription = async (userId, subscriptionType, priceINR, cfOrderId, cfPaymentId, cfOrderStatus, couponCode) => {
  const now    = new Date();
  let sub      = await Subscription.findOne({ userId });
  const base   = sub?.isActive && sub?.expiresAt && sub.expiresAt > now ? sub.expiresAt : now;
  const expiry = new Date(base);
  // Yearly plan gets 12 months, everything else gets 1
  const months = DURATION_MONTHS[subscriptionType] || 1;
  expiry.setMonth(expiry.getMonth() + months);

  if (sub) {
    Object.assign(sub, {
      plan: "premium", subscriptionType, isActive: true,
      startedAt: sub.startedAt || now, expiresAt: expiry,
      priceINR, cfOrderId, cfPaymentId, cfOrderStatus,
      couponUsed: couponCode || sub.couponUsed || null,
    });
    await sub.save();
  } else {
    sub = await Subscription.create({
      userId, plan: "premium", subscriptionType, isActive: true,
      startedAt: now, expiresAt: expiry,
      priceINR, cfOrderId, cfPaymentId, cfOrderStatus,
      couponUsed: couponCode || null,
    });
  }

  const labelMap = {
    student: "Student Premium",
    owner_basic: "Owner Basic",
    owner_priority: "Owner Priority",
    owner: "Owner",
  };
  const label = labelMap[subscriptionType] || "Premium";

  await Notification.create({
    userId,
    type:    "subscription",
    title:   `🎉 ${label} Subscription Activated!`,
    message: `Your CampusConnect ${label} plan is active until ${expiry.toLocaleDateString("en-IN")}.`,
  }).catch(() => {});

  return sub;
};

// ─── GET /api/subscription/me ─────────────────────────────────────────────────
const getMySubscription = async (req, res, next) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) sub = { plan: "free", isActive: false, expiresAt: null, subscriptionType: null };
    res.json({ success: true, data: { subscription: sub } });
  } catch (err) { next(err); }
};

// ─── POST /api/subscription/validate-coupon ───────────────────────────────────
const validateCoupon = async (req, res) => {
  const { couponCode, subscriptionType } = req.body;
  const result = applyCoupon(couponCode, subscriptionType);
  if (!result.valid)
    return res.status(400).json({ success: false, message: result.error || "Invalid coupon." });

  const basePrice  = PRICES[subscriptionType] || PRICES.student;
  const finalPrice = calculateFinalPrice(basePrice, result.coupon);

  return res.json({
    success: true,
    data: {
      code: result.code,
      type: result.coupon.type,
      value: result.coupon.value,
      originalPrice: basePrice,
      finalPrice,
      isFree: finalPrice === 0,
    },
  });
};

// ─── POST /api/subscription/apply-coupon ─────────────────────────────────────
const applyCouponFree = async (req, res, next) => {
  try {
    const { couponCode, subscriptionType = "owner_basic" } = req.body;
    const result = applyCoupon(couponCode, subscriptionType);
    if (!result.valid)
      return res.status(400).json({ success: false, message: result.error || "Invalid coupon." });

    const basePrice  = PRICES[subscriptionType] || PRICES.student;
    const finalPrice = calculateFinalPrice(basePrice, result.coupon);

    if (finalPrice !== 0)
      return res.status(400).json({ success: false, message: "This coupon does not grant a free subscription. Please proceed to payment." });

    const existing = await Subscription.findOne({ userId: req.user._id });
    if (existing?.couponUsed === result.code)
      return res.status(400).json({ success: false, message: `Coupon ${result.code} has already been used on this account.` });

    const sub = await activateSubscription(req.user._id, subscriptionType, 0, "coupon", null, "COUPON", result.code);
    res.json({ success: true, data: { subscription: sub } });
  } catch (err) { next(err); }
};

// ─── POST /api/subscription/create-order ─────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { baseUrl, headers } = getCfConfig();
    const subscriptionType = req.body.subscriptionType || "student";
    const couponCode       = req.body.couponCode || null;

    let couponResult = null;
    if (couponCode) {
      const r = applyCoupon(couponCode, subscriptionType);
      if (!r.valid) return res.status(400).json({ success: false, message: r.error || "Invalid coupon." });
      couponResult = r;
    }

    const basePrice  = PRICES[subscriptionType] || PRICES.student;
    const finalPrice = calculateFinalPrice(basePrice, couponResult?.coupon);

    if (finalPrice === 0)
      return res.status(400).json({ success: false, message: "Use /apply-coupon endpoint for free coupons." });

    const orderId = `cc_${req.user._id}_${Date.now()}`;
    const labelMap = { student: "Student Premium", owner_basic: "Owner Basic", owner_priority: "Owner Priority", owner_yearly: "Owner Yearly" };
    const { data } = await axios.post(
      `${baseUrl}/orders`,
      {
        order_id:       orderId,
        order_amount:   finalPrice,
        order_currency: "INR",
        customer_details: {
          customer_id:    req.user._id.toString(),
          customer_email: req.user.email,
          customer_name:  req.user.name,
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${(process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:8080").split(",")[0].trim()}/subscription?order_id={order_id}&success=true&subType=${subscriptionType}&coupon=${couponCode || ""}`,
          notify_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/subscription/webhook`,
          udf1: subscriptionType,
        },
        order_note: `CampusConnect ${labelMap[subscriptionType] || subscriptionType} — 1 month`,
      },
      { headers },
    );

    res.json({
      success: true,
      data: {
        orderId: data.order_id,
        paymentSessionId: data.payment_session_id,
        cfEnv: process.env.CASHFREE_ENV || "sandbox",
        finalPrice,
        subscriptionType,
        couponCode,
      },
    });
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error("Cashfree create-order error:", msg);
    next(new Error(msg));
  }
};

// ─── POST /api/subscription/verify-order ─────────────────────────────────────
const verifyOrder = async (req, res, next) => {
  try {
    const { orderId, couponCode } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "orderId required." });

    const { baseUrl, headers } = getCfConfig();
    const { data: order } = await axios.get(`${baseUrl}/orders/${orderId}`, { headers });

    if (order.order_status !== "PAID")
      return res.status(402).json({ success: false, message: `Payment not completed. Status: ${order.order_status}` });

    if (order.customer_details?.customer_id !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Order does not belong to this user." });

    const existing = await Subscription.findOne({ userId: req.user._id, cfOrderId: orderId });
    if (existing?.isActive) return res.json({ success: true, data: { subscription: existing } });

    let paymentId = null;
    try {
      const { data: payments } = await axios.get(`${baseUrl}/orders/${orderId}/payments`, { headers });
      paymentId = payments?.[0]?.cf_payment_id?.toString() || null;
    } catch { /* non-critical */ }

    // ── FIX: Read subscriptionType from the order's udf1 field (set at order creation)
    //         instead of trusting req.body — prevents a user paying ₹59 and claiming owner tier.
    const subscriptionType = order.order_meta?.udf1 || "student";
    const sub = await activateSubscription(req.user._id, subscriptionType, order.order_amount, orderId, paymentId, "PAID", couponCode || null);
    res.json({ success: true, data: { subscription: sub } });
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    next(new Error(msg));
  }
};

// ─── POST /api/subscription/webhook ──────────────────────────────────────────
// ── FIX: Added HMAC-SHA256 signature verification so arbitrary callers cannot
//         fake a PAYMENT_SUCCESS event and grant themselves a free subscription.
const handleWebhook = async (req, res) => {
  try {
    // Verify Cashfree signature when secret is configured
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (secret) {
      const ts        = req.headers["x-webhook-timestamp"];
      const signature = req.headers["x-webhook-signature"];
      if (!ts || !signature) {
        console.warn("Cashfree webhook: missing signature headers — rejected.");
        return res.status(400).json({ received: false, error: "Missing signature" });
      }
      const body    = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const payload = `${ts}${body}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64");
      if (expected !== signature) {
        console.warn("Cashfree webhook: signature mismatch — rejected.");
        return res.status(401).json({ received: false, error: "Invalid signature" });
      }
    }

    const event = req.body;
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.data?.order?.order_status === "PAID") {
      const order = event.data?.order;
      if (!order) return res.json({ received: true });
      const customerId = order.customer_details?.customer_id;
      if (!customerId) return res.json({ received: true });
      const paymentId = event.data?.payment?.cf_payment_id?.toString() || null;
      const subscriptionType = order.order_meta?.udf1 || "student";
      await activateSubscription(customerId, subscriptionType, order.order_amount, order.order_id, paymentId, "PAID", null).catch(console.error);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Cashfree webhook error:", err.message);
    res.json({ received: true });
  }
};

// ─── POST /api/subscription/cancel ───────────────────────────────────────────
const cancelSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: "No subscription found." });
    sub.isActive = false;
    await sub.save();
    res.json({ success: true, message: "Subscription cancelled." });
  } catch (err) { next(err); }
};

// ─── POST /api/subscription/upgrade — dev fallback ───────────────────────────
const upgradeSubscription = async (req, res, next) => {
  if (process.env.CASHFREE_APP_ID)
    return res.status(400).json({ success: false, message: "Cashfree is configured. Use /create-order instead." });
  try {
    const subscriptionType = req.body.subscriptionType || "student";
    const sub = await activateSubscription(req.user._id, subscriptionType, PRICES[subscriptionType] || 59, "dev", "dev", "PAID", null);
    res.json({ success: true, data: { subscription: sub } });
  } catch (err) { next(err); }
};

module.exports = {
  getMySubscription, validateCoupon, applyCouponFree,
  createOrder, verifyOrder, handleWebhook,
  upgradeSubscription, cancelSubscription,
};
