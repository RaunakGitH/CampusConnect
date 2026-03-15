/**
 * Roommate Controller — CampusConnect
 * Computes compatibility scores between users based on lifestyle preferences.
 */
const User = require("../models/user.model");

// Weights for each preference field (total = 100)
const WEIGHTS = {
  smoking: 18, drinking: 15, sleepSchedule: 18, cleaniness: 14,
  noise: 12, guests: 8, studying: 7, diet: 5, pets: 3,
};

// Returns 0–1 score for a single field
function fieldScore(a, b, field) {
  if (!a || !b) return 0.5;
  if (a === "no_preference" || b === "no_preference") return 1;
  if (a === b) return 1;
  // Partial matches
  const partials = {
    smoking:       [["occasionally", "yes", 0.4], ["occasionally", "no", 0.2]],
    drinking:      [["occasionally", "yes", 0.4], ["occasionally", "no", 0.2]],
    sleepSchedule: [["flexible", "early_bird", 0.7], ["flexible", "night_owl", 0.7]],
    noise:         [["moderate", "quiet", 0.6],  ["moderate", "lively", 0.6]],
    guests:        [["sometimes", "often", 0.6], ["sometimes", "rarely", 0.7], ["rarely", "never", 0.7]],
    studying:      [["both", "at_home", 0.8],    ["both", "library", 0.8]],
  };
  const p = partials[field] || [];
  for (const [v1, v2, score] of p) {
    if ((a === v1 && b === v2) || (a === v2 && b === v1)) return score;
  }
  return 0;
}

function computeScore(userPrefs, candidatePrefs) {
  let total = 0, maxTotal = 0;
  for (const [field, weight] of Object.entries(WEIGHTS)) {
    total    += fieldScore(userPrefs[field], candidatePrefs[field]) * weight;
    maxTotal += weight;
  }
  return Math.round((total / maxTotal) * 100);
}

function compatibilityLabel(score) {
  if (score >= 85) return { label: "Excellent Match", color: "emerald" };
  if (score >= 70) return { label: "Great Match",     color: "green" };
  if (score >= 55) return { label: "Good Match",      color: "blue" };
  if (score >= 40) return { label: "Fair Match",      color: "amber" };
  return              { label: "Low Match",           color: "red" };
}

// ── GET /api/roommates/matches ────────────────────────────────────────────────
const getMatches = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const myPrefs = me.roommatePrefs || {};

    // Find other users who are open to roommates
    const candidates = await User.find({
      _id: { $ne: req.user._id },
      "roommatePrefs.openToRoommate": true,
    }).select("name avatar roommatePrefs collegeName createdAt").limit(50);

    const scored = candidates
      .map((c) => {
        const score = computeScore(myPrefs, c.roommatePrefs || {});
        const { label, color } = compatibilityLabel(score);
        return {
          _id:         c._id,
          name:        c.name,
          avatar:      c.avatar,
          collegeName: c.collegeName,
          score,
          label,
          color,
          prefs: {
            sleepSchedule: c.roommatePrefs?.sleepSchedule,
            smoking:       c.roommatePrefs?.smoking,
            diet:          c.roommatePrefs?.diet,
            noise:         c.roommatePrefs?.noise,
            cleaniness:    c.roommatePrefs?.cleaniness,
            budget:        c.roommatePrefs?.budget,
            bio:           c.roommatePrefs?.bio,
          },
          joinedDate: c.createdAt,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ success: true, data: { matches: scored, myPrefs } });
  } catch (err) { next(err); }
};

// ── PUT /api/roommates/prefs ──────────────────────────────────────────────────
const updatePrefs = async (req, res, next) => {
  try {
    const ALLOWED = [
      "smoking", "drinking", "sleepSchedule", "cleaniness",
      "noise", "guests", "studying", "diet", "pets",
      "budget", "lookingFor", "bio", "openToRoommate",
    ];
    const update = {};
    ALLOWED.forEach((k) => {
      if (req.body[k] !== undefined) update[`roommatePrefs.${k}`] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: { roommatePrefs: user.roommatePrefs } });
  } catch (err) { next(err); }
};

// ── GET /api/roommates/prefs ──────────────────────────────────────────────────
const getMyPrefs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("roommatePrefs");
    res.json({ success: true, data: { roommatePrefs: user.roommatePrefs || {} } });
  } catch (err) { next(err); }
};

module.exports = { getMatches, updatePrefs, getMyPrefs };
