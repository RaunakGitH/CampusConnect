const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, minlength: 6, select: false },
    role:         { type: String, enum: ["student", "employee", "admin"], default: "student" },
    // ── FIX: refreshToken was missing from the model schema.
    //         Without it, user.save() after assigning refreshToken was a no-op.
    refreshToken: { type: String, select: false, default: null },
    // OAuth
    googleId:     { type: String, sparse: true, unique: true },
    avatar:       { type: String, default: "" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: [] }],
    college:      { type: mongoose.Schema.Types.ObjectId, ref: "College", default: null },
    collegeName:  { type: String, trim: true, default: "" },

    // ── Roommate compatibility preferences ────────────────────────
    roommatePrefs: {
      smoking:       { type: String, enum: ["yes","no","occasionally","no_preference"], default: "no_preference" },
      drinking:      { type: String, enum: ["yes","no","occasionally","no_preference"], default: "no_preference" },
      sleepSchedule: { type: String, enum: ["early_bird","night_owl","flexible"],       default: "flexible" },
      cleaniness:    { type: String, enum: ["very_clean","moderate","relaxed"],         default: "moderate" },
      noise:         { type: String, enum: ["quiet","moderate","lively"],               default: "moderate" },
      guests:        { type: String, enum: ["often","sometimes","rarely","never"],      default: "sometimes" },
      studying:      { type: String, enum: ["at_home","library","both"],               default: "both" },
      diet:          { type: String, enum: ["veg","non_veg","vegan","no_preference"],  default: "no_preference" },
      pets:          { type: String, enum: ["love","allergic","okay","no_preference"], default: "no_preference" },
      budget:        { type: Number, default: null },
      lookingFor:    [{ type: String }],  // category preferences from signup
      bio:           { type: String, default: "", maxlength: 300 },
      openToRoommate:{ type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return require("bcryptjs").compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
