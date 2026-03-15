const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan:             { type: String, enum: ["free", "premium"], default: "free" },
    // student | owner_basic | owner_priority
    subscriptionType: { type: String, enum: ["student", "owner_basic", "owner_priority", "owner_yearly", "owner"], default: "student" },
    startedAt:        { type: Date },
    expiresAt:        { type: Date },
    isActive:         { type: Boolean, default: false },
    priceINR:         { type: Number },
    couponUsed:       { type: String, default: null },
    cfOrderId:        { type: String, default: null },
    cfPaymentId:      { type: String, default: null },
    cfOrderStatus:    { type: String, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.methods.isPremiumActive = function () {
  if (!this.isActive || this.plan !== "premium") return false;
  return !this.expiresAt || new Date() < new Date(this.expiresAt);
};

subscriptionSchema.methods.isOwnerActive = function () {
  return this.isPremiumActive() && ["owner_basic", "owner_priority", "owner_yearly", "owner"].includes(this.subscriptionType);
};

subscriptionSchema.methods.isPriorityActive = function () {
  return this.isPremiumActive() && this.subscriptionType === "owner_priority";
};

module.exports = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
