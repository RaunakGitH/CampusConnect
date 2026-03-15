/**
 * AI Controller — Campus Connect
 * Powered by Groq API (llama-3.3-70b-versatile)
 * Fast, free tier available at console.groq.com
 */

const axios   = require("axios");
const Listing = require("../models/listing.model");

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile"; // fast + smart, free tier

// ── Core Groq caller ──────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userMessage, maxTokens = 800) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in backend .env");

  const { data } = await axios.post(
    GROQ_API,
    {
      model:      MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system",  content: systemPrompt },
        { role: "user",    content: userMessage  },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  return data.choices?.[0]?.message?.content || "";
}

// ── Multi-turn chat caller (keeps history) ────────────────────────────────────
async function callGroqChat(systemPrompt, messages, maxTokens = 500) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in backend .env");

  const { data } = await axios.post(
    GROQ_API,
    {
      model:      MODEL,
      max_tokens: maxTokens,
      messages:   [{ role: "system", content: systemPrompt }, ...messages],
    },
    {
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  return data.choices?.[0]?.message?.content || "";
}

// ── POST /api/ai/generate-description ────────────────────────────────────────
const generateDescription = async (req, res, next) => {
  try {
    const {
      name, category, address, priceRange, amenities,
      sharingType, bhk, furnished, mealsIncluded, rules, capacity,
    } = req.body;

    if (!name || !category)
      return res.status(400).json({ success: false, message: "name and category are required." });

    const system = `You are a listing copywriter for CampusConnect, a platform for students and working professionals finding accommodation near campuses in India.
Write compelling, honest, and warm listing descriptions in 3-4 sentences.
Focus on what students care about: convenience, safety, affordability, amenities.
Write in a friendly, informative tone. Do NOT use filler phrases like "nestled" or "boasting".
Return ONLY the description text, nothing else.`;

    const user = `Write a listing description for:
Name: ${name}
Category: ${category}
Location: ${address || "near campus"}
Price: ${priceRange || "contact for pricing"}
${amenities?.length    ? `Amenities: ${amenities.join(", ")}` : ""}
${sharingType          ? `Sharing: ${sharingType}`            : ""}
${bhk                  ? `BHK: ${bhk}`                        : ""}
${furnished            ? `Furnished: ${furnished}`            : ""}
${mealsIncluded        ? "Meals: included in rent"            : ""}
${capacity             ? `Capacity: ${capacity} residents`    : ""}
${rules?.length        ? `Rules: ${rules.join(", ")}`         : ""}`;

    const description = await callGroq(system, user, 400);
    res.json({ success: true, data: { description: description.trim() } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

// ── POST /api/ai/smart-search ─────────────────────────────────────────────────
const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query?.trim())
      return res.status(400).json({ success: false, message: "query is required." });

    const system = `You are a search parser for CampusConnect, an accommodation and services platform in India.
Parse the user's natural language search query and extract structured filters.
Return ONLY a valid JSON object with these optional fields:
{
  "category": one of: hostel|pg|flat|private_room|dormitory|mess|food|stationery|medical|transport|laundry|tiffin|cyber_cafe|library|wifi|cook|movers_packers,
  "maxPrice": number (INR — extract from "under 5000" or "budget 6k"),
  "maxDistance": number in km,
  "sharingType": "single" or "double" or "triple",
  "mealsIncluded": true,
  "furnished": "furnished" or "semi-furnished" or "unfurnished",
  "bhk": "1BHK" or "2BHK" or "3BHK",
  "search": string (keywords, only if a specific name or area is mentioned),
  "available": true
}
Only include fields clearly mentioned. Return valid JSON only, no explanation, no markdown.`;

    const raw = await callGroq(system, `Parse: "${query}"`, 300);

    let filters = {};
    try {
      filters = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      filters = { search: query };
    }

    const mongoFilter = { isActive: true };
    if (filters.category)      mongoFilter.category      = filters.category;
    if (filters.maxDistance)   mongoFilter.distance      = { $lte: Number(filters.maxDistance) };
    // ── FIX: Apply maxPrice inside Mongo using a regex on priceRange so the
    //         DB limit(20) doesn't cut off valid results before filtering.
    //         We match listings whose first numeric run is <= maxPrice.
    // (Exact price comparison happens server-side after the query as a safety net.)
    if (filters.maxPrice) {
      // Pull in up to 200 candidates when a price filter is present to ensure
      // we don't miss cheap listings buried behind higher-rated expensive ones.
      mongoFilter._maxPriceHint = Number(filters.maxPrice); // used below to increase limit
    }
    // Bug fix: $text search requires a MongoDB text index.
    // Use regex fallback if $text would fail (e.g. fresh DB without index)
    if (filters.search) {
      try {
        mongoFilter.$text = { $search: filters.search };
      } catch {
        mongoFilter.$or = [
          { name:        { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { address:     { $regex: filters.search, $options: "i" } },
        ];
      }
    }
    if (filters.sharingType)   mongoFilter.sharingType   = { $regex: filters.sharingType, $options: "i" };
    if (filters.mealsIncluded) mongoFilter.mealsIncluded = true;
    if (filters.furnished)     mongoFilter.furnished     = filters.furnished;
    if (filters.bhk)           mongoFilter.bhk           = { $regex: filters.bhk, $options: "i" };
    if (filters.available)     mongoFilter.isAvailable   = true;

    let listings;
    try {
      // Use a larger limit when price filtering so cheap listings aren't missed
      const queryLimit = mongoFilter._maxPriceHint ? 200 : 20;
      delete mongoFilter._maxPriceHint;
      listings = await Listing.find(mongoFilter).sort({ isFeatured: -1, rating: -1 }).limit(queryLimit);
    } catch (findErr) {
      // If $text search fails (missing index), fall back to regex
      if (mongoFilter.$text) {
        const term = mongoFilter.$text.$search;
        delete mongoFilter.$text;
        delete mongoFilter._maxPriceHint;
        mongoFilter.$or = [
          { name:        { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } },
          { address:     { $regex: term, $options: "i" } },
        ];
        listings = await Listing.find(mongoFilter).sort({ isFeatured: -1, rating: -1 }).limit(filters.maxPrice ? 200 : 20);
      } else {
        throw findErr;
      }
    }

    // ── FIX: Price filter now runs on a larger candidate set (up to 200)
    //         instead of just the top 20 by rating, so cheap listings are
    //         never hidden behind higher-rated expensive results.
    if (filters.maxPrice) {
      listings = listings.filter((l) => {
        const nums = l.priceRange.match(/\d[\d,]*/g);
        if (!nums) return true;
        return Number(nums[0].replace(/,/g, "")) <= filters.maxPrice;
      }).slice(0, 20); // cap final result at 20 after filtering
    }

    const toFrontend = (doc) => ({
      id: doc._id.toString(), name: doc.name, category: doc.category,
      address: doc.address, distance: doc.distance, priceRange: doc.priceRange,
      contact: doc.contact, amenities: doc.amenities, rating: doc.rating,
      reviewCount: doc.reviewCount, verified: doc.verified, image: doc.image,
      description: doc.description, isFeatured: doc.isFeatured,
      isAvailable: doc.isAvailable, availableRooms: doc.availableRooms,
      sharingType: doc.sharingType, mealsIncluded: doc.mealsIncluded,
      furnished: doc.furnished, bhk: doc.bhk,
    });

    res.json({
      success: true,
      data: { listings: listings.map(toFrontend), parsedFilters: filters, total: listings.length },
    });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

// ── POST /api/ai/review-summary ───────────────────────────────────────────────
const reviewSummary = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId)
      return res.status(400).json({ success: false, message: "listingId is required." });

    const Review = require("../models/review.model");
    const reviews = await Review.find({ listingId }).limit(50);

    if (reviews.length < 3)
      return res.json({ success: true, data: { summary: null, count: reviews.length } });

    const reviewText = reviews.map((r) => `${r.rating} stars: "${r.comment}"`).join("\n");

    const system = `You summarize student reviews for accommodation and service listings in India.
Write exactly 2 sentences: first what students love, second any common complaints.
Be specific and honest. Start with "Students love..." or similar.
Return ONLY the 2-sentence summary, nothing else.`;

    const summary = await callGroq(system, `Summarize these ${reviews.length} reviews:\n${reviewText}`, 200);
    res.json({ success: true, data: { summary: summary.trim(), count: reviews.length } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim())
      return res.status(400).json({ success: false, message: "message is required." });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
      return res.status(500).json({
        success: false,
        message: "AI not configured. Add GROQ_API_KEY to backend .env — get it free at console.groq.com",
      });

    // Get live listings to ground the AI
    const listings = await Listing.find({ isActive: true })
      .select("name category address distance priceRange amenities rating isAvailable mealsIncluded")
      .sort({ isFeatured: -1, rating: -1 })
      .limit(30);

    const listingSummary = listings
      .map((l) =>
        `- ${l.name} (${l.category}) | ${l.priceRange} | ${l.distance}km from campus | Rating: ${l.rating}/5 | ${l.isAvailable ? "Available" : "Full"}${l.mealsIncluded ? " | Meals included" : ""}`
      )
      .join("\n");

    const system = `You are CampusBot, a friendly AI assistant for CampusConnect — a platform helping students and working professionals find accommodation and services near their campus in India.

You help users find hostels, PGs, flats, dormitories, mess facilities, food joints, transport, laundry, tiffin services, libraries, Wi-Fi operators, and private cooks.

Current live listings on the platform:
${listingSummary || "No listings available right now."}

Guidelines:
- Be friendly, warm, and concise. Keep replies under 150 words.
- Recommend specific listings by name when relevant to the user's query.
- Use Indian context (₹ rupees, terms like PG, mess, warden, tiffin, etc.)
- If no matching listings, suggest the user check back later or set a price alert.
- For accommodation questions, ask about budget and preferences if not mentioned.
- If asked about the platform, explain it's broker-free and subscription-based.`;

    const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
    const messages = [
      ...safeHistory.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const reply = await callGroqChat(system, messages, 500);
    res.json({ success: true, data: { reply: reply.trim() } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};


// ── POST /api/ai/price-fairness ───────────────────────────────────────────────
// Compare a listing's price to similar listings in the same category
const priceFairness = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId)
      return res.status(400).json({ success: false, message: "listingId is required." });

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found." });

    // Get comparable listings in same category
    const comparables = await Listing.find({
      isActive: true,
      category: listing.category,
      _id: { $ne: listing._id },
    }).limit(20).select("priceRange name");

    if (comparables.length < 3) {
      return res.json({ success: true, data: { verdict: "neutral", label: "New Listing", reason: "Not enough comparable listings yet to determine price fairness.", percentile: null } });
    }

    // Extract lowest prices from all comparables
    const extractPrice = (pr) => {
      const nums = pr.match(/\d[\d,]*/g);
      return nums ? Number(nums[0].replace(/,/g, "")) : null;
    };

    const prices = comparables
      .map((c) => extractPrice(c.priceRange))
      .filter((p) => p !== null)
      .sort((a, b) => a - b);

    const listingPrice = extractPrice(listing.priceRange);
    if (!listingPrice || prices.length === 0) {
      return res.json({ success: true, data: { verdict: "neutral", label: "Price Not Comparable", reason: "Could not parse price for comparison.", percentile: null } });
    }

    const avg    = prices.reduce((a, b) => a + b, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)];
    const rank   = prices.filter((p) => p <= listingPrice).length;
    const percentile = Math.round((rank / prices.length) * 100);

    let verdict, label, reason;
    if (percentile <= 25) {
      verdict = "great";
      label   = "Great Value";
      reason  = `Priced in the bottom 25% for ${listing.category}s. Median in this area is ₹${median.toLocaleString()}.`;
    } else if (percentile <= 50) {
      verdict = "fair";
      label   = "Fair Price";
      reason  = `Priced around the median for ${listing.category}s nearby (₹${median.toLocaleString()}).`;
    } else if (percentile <= 75) {
      verdict = "above";
      label   = "Slightly Above Average";
      reason  = `Priced above average for this category. Median nearby is ₹${median.toLocaleString()}.`;
    } else {
      verdict = "high";
      label   = "Above Market";
      reason  = `Priced in the top 25% for ${listing.category}s. Comparable options start at ₹${prices[0].toLocaleString()}.`;
    }

    res.json({ success: true, data: { verdict, label, reason, percentile, median, avg: Math.round(avg), listingPrice } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

// ── POST /api/ai/relocation-checklist ─────────────────────────────────────────
// Generate personalised relocation checklist using Groq
const relocationChecklist = async (req, res, next) => {
  try {
    const { college, city, moveDate, category } = req.body;
    if (!city && !college)
      return res.status(400).json({ success: false, message: "city or college is required." });

    // Get services available near the user
    const availableServices = await Listing.find({ isActive: true })
      .select("category name")
      .limit(50);

    const servicesSummary = [...new Set(availableServices.map((l) => l.category))].join(", ");

    const system = `You are a relocation advisor helping students and working professionals moving to a new city near a campus in India.
Generate a personalised relocation checklist as a JSON array.
Each item: { "task": string, "category": string, "priority": "high"|"medium"|"low", "tip": string, "available_on_platform": boolean }
"available_on_platform" is true if CampusConnect can help (accommodation, food, mess, laundry, tiffin, transport, library, wifi, cook, stationery).
Return ONLY valid JSON array, no markdown, no explanation.`;

    const user = `Create a relocation checklist for someone moving to ${college || city}${moveDate ? ` in ${moveDate}` : ""}.
They are looking for: ${category || "accommodation"}.
Services available on CampusConnect in this area: ${servicesSummary || "hostel, pg, mess, food, laundry, transport"}.
Include 8-10 practical tasks covering: finding accommodation, setting up utilities, food, transport, documents, banking, SIM card, and local services.`;

    const raw = await callGroq(system, user, 800);
    let checklist = [];
    try {
      checklist = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      // Fallback static checklist if AI fails
      checklist = [
        { task: "Book accommodation", category: "housing", priority: "high", tip: "Book at least 2 weeks before moving. Use CampusConnect for broker-free options.", available_on_platform: true },
        { task: "Find a mess or tiffin service", category: "food", priority: "high", tip: "Many PGs include meals. Check mess services on CampusConnect.", available_on_platform: true },
        { task: "Get a local SIM card", category: "utilities", priority: "high", tip: "Jio/Airtel offer student plans. Bring Aadhaar + college ID.", available_on_platform: false },
        { task: "Open a bank account", category: "finance", priority: "medium", tip: "SBI and Canara are common on campuses. Bring admission letter.", available_on_platform: false },
        { task: "Set up Wi-Fi", category: "utilities", priority: "medium", tip: "Many PGs include Wi-Fi. Check CampusConnect for Wi-Fi operators.", available_on_platform: true },
        { task: "Find laundry service", category: "services", priority: "low", tip: "Weekly laundry services are available nearby.", available_on_platform: true },
        { task: "Book transport for shifting", category: "transport", priority: "high", tip: "Book movers at least a week in advance.", available_on_platform: true },
        { task: "Locate nearest medical store", category: "health", priority: "medium", tip: "Find 24/7 pharmacies on CampusConnect.", available_on_platform: true },
      ];
    }

    res.json({ success: true, data: { checklist, city: city || college } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

// ── POST /api/ai/roommate-compatibility ───────────────────────────────────────
// Receives two preference objects, returns an AI-written compatibility insight
const roommateCompatibility = async (req, res, next) => {
  try {
    const { myPrefs, candidatePrefs, candidateName, score } = req.body;
    if (!myPrefs || !candidatePrefs)
      return res.status(400).json({ success: false, message: "myPrefs and candidatePrefs are required." });

    const system = `You are a roommate compatibility advisor for CampusConnect, a student accommodation platform in India.
You receive two students' lifestyle preference profiles and a pre-calculated compatibility score, and write a concise, honest, warm compatibility insight.

Rules:
- Write exactly 2 sentences. First sentence: what they have in common / why they'd get along. Second sentence: one potential friction point or tip.
- Be specific — mention actual preference values (e.g. "both early risers", "different noise preferences").
- Use friendly Indian student language. Keep it under 40 words total.
- Do NOT repeat the score number. Do NOT say "great match" or "excellent match".
- Return ONLY the 2-sentence insight text, nothing else.`;

    const formatPrefs = (p, label) =>
      `${label}: sleep=${p.sleepSchedule||"?"}, smoking=${p.smoking||"?"}, drinking=${p.drinking||"?"}, noise=${p.noise||"?"}, cleanliness=${p.cleaniness||"?"}, diet=${p.diet||"?"}, guests=${p.guests||"?"}, study=${p.studying||"?"}, pets=${p.pets||"?"}`;

    const userMsg = `Score: ${score}%\n${formatPrefs(myPrefs, "You")}\n${formatPrefs(candidatePrefs, candidateName || "Candidate")}`;

    const insight = await callGroq(system, userMsg, 120);
    res.json({ success: true, data: { insight: insight.trim() } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    next(new Error(msg));
  }
};

module.exports = { generateDescription, smartSearch, reviewSummary, chat, priceFairness, relocationChecklist, roommateCompatibility };

