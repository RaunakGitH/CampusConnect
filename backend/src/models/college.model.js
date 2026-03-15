const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },   // e.g. "IIT Delhi"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

collegeSchema.index({ name: "text", city: "text" });
collegeSchema.index({ city: 1, isActive: 1 });

module.exports = mongoose.models.College || mongoose.model("College", collegeSchema);
