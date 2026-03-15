const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Token ────────────────────────────────────────────────────────────────────
let token: string | null = localStorage.getItem("cc_token");
export const setToken = (t: string | null) => {
  token = t;
  if (t) localStorage.setItem("cc_token", t);
  else localStorage.removeItem("cc_token");
};
export const getToken = () => token;

// ─── Fetch core ───────────────────────────────────────────────────────────────
async function api<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth, headers, ...rest } = init;

  const buildHeaders = (tkn: string | null) => ({
    "Content-Type": "application/json",
    ...(auth && tkn ? { Authorization: `Bearer ${tkn}` } : {}),
    ...(headers as Record<string, string>),
  });

  let res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: buildHeaders(token),
    ...rest,
  });

  // ── FIX: Auto-refresh on 401 and retry original request once ──────────────
  if (res.status === 401 && auth) {
    try {
      const refreshRes = await fetch(`${BASE}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.data?.accessToken;
        if (newToken) {
          setToken(newToken);
          // Retry original request with new token
          res = await fetch(`${BASE}${path}`, {
            credentials: "include",
            headers: buildHeaders(newToken),
            ...rest,
          });
        }
      }
    } catch {
      // refresh failed — fall through to throw below
    }
  }

  // Safe parse — handles plain-text responses (rate limits, proxy errors, etc.)
  let data: any;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    try { data = JSON.parse(text); }
    catch {
      if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
      throw new Error(text.slice(0, 120) || `Request failed (${res.status})`);
    }
  }

  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
    throw new Error(data?.message || data?.error || "Request failed");
  }
  return data.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type Category =
  | "hostel" | "pg" | "flat" | "private_room" | "dormitory"
  | "mess" | "food" | "tiffin" | "cook"
  | "laundry" | "transport" | "movers_packers"
  | "stationery" | "medical" | "wifi" | "cyber_cafe" | "library"
  | "rental_electronics" | "rental_furniture";

export interface Listing {
  id: string;
  name: string;
  category: Category;
  address: string;
  distance: number;
  priceRange: string;
  contact: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  image: string;
  description: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  availableRooms?: number;
  subscriptionPlan?: "normal" | "special";
  subscriptionExpiresAt?: string;
  createdBy?: string;
  // Accommodation
  sharingType?: string;
  mealsIncluded?: boolean;
  furnished?: "furnished" | "semi-furnished" | "unfurnished";
  bhk?: string;
  capacity?: number;
  rules?: string[];
  has3DTour?: boolean;
  tourUrl?: string;
  mediaUrls?: string[];
  videoUrls?: string[];
  // Mess
  monthlyPackage?: number;
  perMealRate?: number;
  mealsPerDay?: number;
  // Analytics
  viewCount?: number;
  contactClicks?: number;
  // Booking
  bookingEnabled?: boolean;
  bookingPrice?: number | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Review {
  id: string;
  listingId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "employee" | "admin";
  avatar?: string;
  authProvider?: "local" | "google";
}

export interface PartnerOffer {
  id: string;
  title: string;
  description: string;
  category: string;
  discountText: string;
  partnerName: string;
  partnerContact?: string;
  validUntil?: string;
  couponCode?: string;
  listingId?: string;
}

export interface Subscription {
  plan: "free" | "premium";
  subscriptionType?: "student" | "owner_basic" | "owner_priority" | "owner";
  isActive: boolean;
  expiresAt?: string;
  priceINR?: number;
  couponUsed?: string;
}

export interface BookingSlot {
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  label?: string;
  booked: boolean;
}

export interface Booking {
  _id: string;
  listingId: string | { _id: string; name: string; category: string; address: string; image: string };
  userId: string | { _id: string; name: string; email: string };
  date: string;
  time: string;
  slotLabel?: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  amountPaid?: number;
  createdAt: string;
}

export interface PriceAlert {
  _id: string;
  category: string;
  maxPrice: number;
  location?: string;
  isActive: boolean;
}

export interface Notification {
  _id: string;
  type: "new_listing" | "price_alert" | "subscription" | "review" | "system";
  title: string;
  message: string;
  listingId?: string;
  read: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST", body: JSON.stringify(body),
    }).then((d) => { setToken(d.accessToken); return d; }),

  login: (body: { email: string; password: string }) =>
    api<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST", body: JSON.stringify(body),
    }).then((d) => { setToken(d.accessToken); return d; }),

  logout: () => api("/auth/logout", { method: "POST", auth: true }).finally(() => setToken(null)),

  me: () => api<{ user: User }>("/auth/me", { auth: true }),

  googleAuth: (accessToken: string) =>
    api<{ accessToken: string; user: User }>("/auth/google", {
      method: "POST", body: JSON.stringify({ accessToken }),
    }).then((d) => { setToken(d.accessToken); return d; }),

  setOwnerRole: () =>
    api<{ user: User }>("/auth/set-owner-role", { method: "POST", auth: true }),

  // ── FIX: refresh was missing — needed to renew 15-min access tokens
  //         via the 7-day httpOnly refresh cookie.
  refresh: async (): Promise<boolean> => {
    try {
      const data = await api<{ accessToken: string }>("/auth/refresh-token", {
        method: "POST",
        // credentials: "include" is set globally so the cookie is sent automatically
      });
      setToken(data.accessToken);
      return true;
    } catch {
      setToken(null);
      return false;
    }
  },
};

// ─── Listings ─────────────────────────────────────────────────────────────────
export const listingsApi = {
  getAll: (params?: {
    category?: string; search?: string; maxDistance?: number; featured?: boolean;
    mine?: boolean; available?: boolean;
    furnished?: string; bhk?: string; sharingType?: string; mealsIncluded?: boolean;
    page?: number; limit?: number;
  }) => {
    const p: Record<string, string> = {};
    if (params?.category) p.category = params.category;
    if (params?.search) p.search = params.search;
    if (params?.maxDistance !== undefined) p.maxDistance = String(params.maxDistance);
    if (params?.featured) p.featured = "true";
    if (params?.mine) p.mine = "true";
    if (params?.available) p.available = "true";
    if (params?.furnished) p.furnished = params.furnished;
    if (params?.bhk) p.bhk = params.bhk;
    if (params?.sharingType) p.sharingType = params.sharingType;
    if (params?.mealsIncluded) p.mealsIncluded = "true";
    if (params?.page) p.page = String(params.page);
    if (params?.limit) p.limit = String(params.limit);
    const q = new URLSearchParams(p).toString();
    return api<{ listings: Listing[]; pagination: Pagination }>(
      `/listings${q ? `?${q}` : ""}`,
      params?.mine ? { auth: true } : {},
    );
  },
  getById: (id: string) => api<{ listing: Listing }>(`/listings/${id}`),
  create: (body: Partial<Listing>) =>
    api<{ listing: Listing }>("/listings", { method: "POST", auth: true, body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Listing>) =>
    api<{ listing: Listing }>(`/listings/${id}`, { method: "PUT", auth: true, body: JSON.stringify(body) }),
  delete: (id: string) => api(`/listings/${id}`, { method: "DELETE", auth: true }),
  subscribe: (id: string, plan: "normal" | "special") =>
    api<{ listing: Listing }>(`/listings/${id}/subscribe`, {
      method: "POST", auth: true, body: JSON.stringify({ plan }),
    }),
  recordContactClick: (id: string) =>
    fetch(`${BASE}/listings/${id}/contact-click`, { method: "POST" }).catch(() => {}),
  getAnalytics: (id: string) =>
    api<{ total: { views: number; contacts: number }; daily: { date: string; views: number; contacts: number }[] }>(
      `/listings/${id}/analytics`, { auth: true },
    ),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getByListing: (listingId: string) =>
    api<{ reviews: Review[] }>(`/reviews?listingId=${listingId}`),
  create: (body: { listingId: string; rating: number; comment: string }) =>
    api<{ review: Review; listingRating: number; listingReviewCount: number }>(
      "/reviews", { method: "POST", auth: true, body: JSON.stringify(body) },
    ),
  delete: (id: string) => api(`/reviews/${id}`, { method: "DELETE", auth: true }),
};

// ─── Partners ─────────────────────────────────────────────────────────────────
export const partnersApi = {
  getAll: (category?: string) =>
    api<{ offers: PartnerOffer[] }>(`/partners${category ? `?category=${category}` : ""}`),
  create: (body: Omit<PartnerOffer, "id">) =>
    api<{ offer: PartnerOffer }>("/partners", { method: "POST", auth: true, body: JSON.stringify(body) }),
  delete: (id: string) => api(`/partners/${id}`, { method: "DELETE", auth: true }),
};

// ─── Subscription ─────────────────────────────────────────────────────────────
export interface CouponValidation {
  code: string;
  type: "free_month" | "percent_off" | "flat_off";
  value: number;
  originalPrice: number;
  finalPrice: number;
  isFree: boolean;
}

export const subscriptionApi = {
  getMe: () => api<{ subscription: Subscription }>("/subscription/me", { auth: true }),

  validateCoupon: (couponCode: string, subscriptionType: "student" | "owner") =>
    api<CouponValidation>("/subscription/validate-coupon", {
      method: "POST", auth: true,
      body: JSON.stringify({ couponCode, subscriptionType }),
    }),

  applyCouponFree: (couponCode: string, subscriptionType: "student" | "owner") =>
    api<{ subscription: Subscription }>("/subscription/apply-coupon", {
      method: "POST", auth: true,
      body: JSON.stringify({ couponCode, subscriptionType }),
    }),

  upgrade: (subscriptionType: "student" | "owner" = "student") =>
    api<{ subscription: Subscription }>("/subscription/upgrade", {
      method: "POST", auth: true, body: JSON.stringify({ subscriptionType }),
    }),

  createOrder: (subscriptionType: string, couponCode?: string) =>
    api<{ orderId: string; paymentSessionId: string; cfEnv: string; finalPrice: number; subscriptionType: string; couponCode?: string }>(
      "/subscription/create-order",
      { method: "POST", auth: true, body: JSON.stringify({ subscriptionType, couponCode }) }
    ),

  verifyOrder: (orderId: string, couponCode?: string) =>
    api<{ subscription: Subscription }>(
      "/subscription/verify-order",
      { method: "POST", auth: true, body: JSON.stringify({ orderId, couponCode }) }
    ),

  cancel: () => api("/subscription/cancel", { method: "POST", auth: true }),
};

// ─── Price Alerts ─────────────────────────────────────────────────────────────
export const alertsApi = {
  getAll: () => api<{ alerts: PriceAlert[] }>("/alerts", { auth: true }),
  create: (body: { category: string; maxPrice: number; location?: string }) =>
    api<{ alert: PriceAlert }>("/alerts", { method: "POST", auth: true, body: JSON.stringify(body) }),
  delete: (id: string) => api(`/alerts/${id}`, { method: "DELETE", auth: true }),
  check: () =>
    api<{ matches: Array<{ alert: PriceAlert; listings: Listing[] }> }>("/alerts/check", { auth: true }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (unreadOnly?: boolean) =>
    api<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`, { auth: true },
    ),
  markRead: (id: string) => api(`/notifications/${id}/read`, { method: "PATCH", auth: true }),
  markAllRead: () => api("/notifications/read-all", { method: "PATCH", auth: true }),
  delete: (id: string) => api(`/notifications/${id}`, { method: "DELETE", auth: true }),
};

// ─── Saved / Bookmarks ────────────────────────────────────────────────────────
export const savedApi = {
  getAll: () => api<{ listings: Listing[]; count: number }>("/saved", { auth: true }),
  toggle: (id: string) => api<{ saved: boolean; count: number }>(`/saved/${id}`, { method: "POST", auth: true }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  generateDescription: (fields: {
    name: string; category: string; address?: string; priceRange?: string;
    amenities?: string[]; sharingType?: string; bhk?: string; furnished?: string;
    mealsIncluded?: boolean; rules?: string[]; capacity?: number;
  }) =>
    api<{ description: string }>("/ai/generate-description", {
      method: "POST", auth: true, body: JSON.stringify(fields),
    }),

  smartSearch: (query: string) =>
    api<{ listings: Listing[]; parsedFilters: Record<string, unknown>; total: number }>(
      "/ai/smart-search", { method: "POST", body: JSON.stringify({ query }) },
    ),

  reviewSummary: (listingId: string) =>
    api<{ summary: string | null; count: number }>(
      "/ai/review-summary", { method: "POST", body: JSON.stringify({ listingId }) },
    ),

  chat: (message: string, history?: { role: string; content: string }[]) =>
    api<{ reply: string }>(
      "/ai/chat", { method: "POST", body: JSON.stringify({ message, history }) },
    ),

  priceFairness: (listingId: string) =>
    api<{ verdict: "great"|"fair"|"above"|"high"|"neutral"; label: string; reason: string; percentile: number|null; median?: number; avg?: number; listingPrice?: number }>(
      "/ai/price-fairness", { method: "POST", body: JSON.stringify({ listingId }) },
    ),

  relocationChecklist: (params: { college?: string; city?: string; moveDate?: string; category?: string }) =>
    api<{ checklist: Array<{ task: string; category: string; priority: string; tip: string; available_on_platform: boolean }>; city: string }>(
      "/ai/relocation-checklist", { method: "POST", body: JSON.stringify(params) },
    ),

  roommateCompatibility: (body: {
    myPrefs: Record<string, string | number | boolean | string[] | null | undefined>;
    candidatePrefs: Record<string, string | number | boolean | string[] | null | undefined>;
    candidateName: string;
    score: number;
  }) =>
    api<{ insight: string }>(
      "/ai/roommate-compatibility", { method: "POST", auth: true, body: JSON.stringify(body) },
    ),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (body: {
    listingId: string; date: string; time: string;
    slotLabel?: string; userPhone: string; userEmail?: string; message?: string;
  }) => api<{ booking: Booking }>("/bookings", { method: "POST", auth: true, body: JSON.stringify(body) }),

  getMy:    () => api<{ bookings: Booking[] }>("/bookings/my",  { auth: true }),
  getMine:  () => api<{ bookings: Booking[] }>("/bookings/mine", { auth: true }),

  updateStatus: (id: string, status: "confirmed" | "cancelled" | "completed") =>
    api<{ booking: Booking }>(`/bookings/${id}/status`, {
      method: "PUT", auth: true, body: JSON.stringify({ status }),
    }),

  cancel: (id: string) => api(`/bookings/${id}`, { method: "DELETE", auth: true }),

  getSlots: (listingId: string) =>
    api<{ slots: BookingSlot[]; bookingEnabled: boolean; bookingPrice: number | null }>(
      `/bookings/slots/${listingId}`,
    ),
};

// ─── Roommate Compatibility ───────────────────────────────────────────────────
export interface RoommatePrefs {
  smoking?:        "yes" | "no" | "occasionally" | "no_preference";
  drinking?:       "yes" | "no" | "occasionally" | "no_preference";
  sleepSchedule?:  "early_bird" | "night_owl" | "flexible";
  cleaniness?:     "very_clean" | "moderate" | "relaxed";
  noise?:          "quiet" | "moderate" | "lively";
  guests?:         "often" | "sometimes" | "rarely" | "never";
  studying?:       "at_home" | "library" | "both";
  diet?:           "veg" | "non_veg" | "vegan" | "no_preference";
  pets?:           "love" | "allergic" | "okay" | "no_preference";
  budget?:         number | null;
  lookingFor?:     string[];
  bio?:            string;
  openToRoommate?: boolean;
}

export interface RoommateMatch {
  _id: string;
  name: string;
  avatar?: string;
  collegeName?: string;
  score: number;
  label: string;
  color: string;
  prefs: Partial<RoommatePrefs>;
  joinedDate?: string;
}

export const roommateApi = {
  getMatches: () =>
    api<{ matches: RoommateMatch[]; myPrefs: RoommatePrefs }>("/roommates/matches", { auth: true }),
  getMyPrefs: () =>
    api<{ roommatePrefs: RoommatePrefs }>("/roommates/prefs", { auth: true }),
  updatePrefs: (prefs: Partial<RoommatePrefs>) =>
    api<{ roommatePrefs: RoommatePrefs }>("/roommates/prefs", {
      method: "PUT", auth: true, body: JSON.stringify(prefs),
    }),
};


// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  // Upload 1–10 image files. Returns array of public URLs.
  images: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const tkn = getToken();
    const res = await fetch(`${BASE}/upload/images`, {
      method: "POST",
      credentials: "include",
      headers: tkn ? { Authorization: `Bearer ${tkn}` } : {},
      body: formData,
      // Note: do NOT set Content-Type — browser sets multipart/form-data with boundary
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed.");
    return data.data.urls as string[];
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number; totalListings: number; activeListings: number;
  totalReviews: number; premiumUsers: number; totalOffers: number;
  newUsersThisWeek: number; newListingsThisWeek: number; inactiveListings: number;
}

export const adminApi = {
  getStats: () =>
    api<{ stats: AdminStats; categoryBreakdown: {_id:string;count:number}[]; recentUsers: User[]; recentListings: Listing[] }>(
      "/admin/stats", { auth: true }
    ),

  // Users
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const p = new URLSearchParams();
    if (params?.page)   p.set("page",   String(params.page));
    if (params?.limit)  p.set("limit",  String(params.limit));
    if (params?.role)   p.set("role",   params.role);
    if (params?.search) p.set("search", params.search);
    return api<{ users: User[]; pagination: Pagination }>(`/admin/users?${p}`, { auth: true });
  },
  updateUserRole: (id: string, role: string) =>
    api<{ user: User }>(`/admin/users/${id}/role`, { method: "PATCH", auth: true, body: JSON.stringify({ role }) }),
  deleteUser: (id: string) =>
    api(`/admin/users/${id}`, { method: "DELETE", auth: true }),

  // Listings
  getListings: (params?: { page?: number; limit?: number; category?: string; verified?: boolean; isActive?: boolean; search?: string }) => {
    const p = new URLSearchParams();
    if (params?.page     !== undefined) p.set("page",     String(params.page));
    if (params?.limit    !== undefined) p.set("limit",    String(params.limit));
    if (params?.category !== undefined) p.set("category", params.category);
    if (params?.verified !== undefined) p.set("verified", String(params.verified));
    if (params?.isActive !== undefined) p.set("isActive", String(params.isActive));
    if (params?.search   !== undefined) p.set("search",   params.search);
    return api<{ listings: Listing[]; pagination: Pagination }>(`/admin/listings?${p}`, { auth: true });
  },
  verifyListing:  (id: string, verified: boolean) =>
    api<{ listing: Listing }>(`/admin/listings/${id}/verify`, { method: "PATCH", auth: true, body: JSON.stringify({ verified }) }),
  toggleListing:  (id: string) =>
    api<{ listing: Listing }>(`/admin/listings/${id}/toggle`, { method: "PATCH", auth: true }),
  deleteListing:  (id: string) =>
    api(`/admin/listings/${id}`, { method: "DELETE", auth: true }),

  // Partner Offers
  getPartnerOffers: () =>
    api<{ offers: PartnerOffer[] }>("/admin/partner-offers", { auth: true }),
  createPartnerOffer: (body: Omit<PartnerOffer, "id">) =>
    api<{ offer: PartnerOffer }>("/admin/partner-offers", { method: "POST", auth: true, body: JSON.stringify(body) }),
  deletePartnerOffer: (id: string) =>
    api(`/admin/partner-offers/${id}`, { method: "DELETE", auth: true }),

  // Broadcast
  broadcast: (title: string, message: string, targetRole?: string) =>
    api<{ message: string }>("/admin/broadcast", { method: "POST", auth: true, body: JSON.stringify({ title, message, targetRole }) }),
};
