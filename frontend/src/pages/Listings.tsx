import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Crown, X, ChevronLeft, ChevronRight, Map, LayoutList, Truck } from "lucide-react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { categories, accommodationCategories, foodCategories, serviceCategories, rentalCategories } from "@/data/mockData";
import { listingsApi } from "@/services/api";
import type { Listing, Category, Pagination } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AISmartSearch from "@/components/AISmartSearch";
import ListingsMap from "@/components/ListingsMap";
import { AdBannerHero, AdCardInline } from "@/components/AdBanner";

const FREE_LIMIT = 50;
const PREMIUM_LIMIT = 200;
const ACCOMMODATION_CATS = new Set(accommodationCategories);

const FURNISHED_OPTIONS = ["furnished", "semi-furnished", "unfurnished"] as const;
const SHARING_OPTIONS = ["Single", "Double", "Triple", "Dormitory"];

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="rounded-2xl glass-card overflow-hidden animate-pulse">
    <div className="h-44 bg-white/[0.04]" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/[0.06] rounded w-3/4" />
      <div className="h-3 bg-white/[0.06] rounded w-1/2" />
      <div className="h-3 bg-white/[0.06] rounded w-1/3" />
    </div>
  </div>
);

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory  = searchParams.get("category") as Category | null;
  const initialSearch   = searchParams.get("search") || "";
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const { isPremium } = useAuth();

  // Basic filters
  const [search, setSearch]           = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice]               = useState<number | null>(initialMaxPrice);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [maxDistance, setMaxDistance] = useState(5);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  // Advanced filters (premium)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [furnished, setFurnished] = useState("");
  const [bhk, setBhk] = useState("");
  const [sharingType, setSharingType] = useState("");
  const [mealsIncluded, setMealsIncluded] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [aiResults, setAiResults] = useState<Listing[] | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const isAccommodationCat = !activeCategory || ACCOMMODATION_CATS.has(activeCategory);
  const hasAdvancedFilters = furnished || bhk || sharingType || mealsIncluded;

  const fetchListings = useCallback(() => {
    setLoading(true);
    const params: Parameters<typeof listingsApi.getAll>[0] = {
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      maxDistance,
      ...(onlyAvailable ? { available: true } : {}),
      page,
      limit: isPremium ? PREMIUM_LIMIT : FREE_LIMIT,
    };
    if (isPremium && isAccommodationCat) {
      if (furnished) params.furnished = furnished;
      if (bhk) params.bhk = bhk;
      if (sharingType) params.sharingType = sharingType;
      if (mealsIncluded) params.mealsIncluded = true;
    }
    listingsApi.getAll(params)
      .then(({ listings: l, pagination: p }) => {
        const filtered = maxPrice
          ? l.filter((listing) => {
              const nums = listing.priceRange.match(/\d[\d,]*/g);
              if (!nums) return true;
              return Number(nums[0].replace(/,/g, "")) <= maxPrice;
            })
          : l;
        setListings(filtered);
        setPagination(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch, maxDistance, onlyAvailable, furnished, bhk, sharingType, mealsIncluded, page, isPremium]);

  useEffect(() => { setPage(1); }, [activeCategory, debouncedSearch, maxDistance, onlyAvailable, furnished, bhk, sharingType, mealsIncluded]);
  useEffect(() => { fetchListings(); }, [fetchListings]);

  const setCategory = (cat: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set("category", cat); else params.delete("category");
    setSearchParams(params);
    setFurnished(""); setBhk(""); setSharingType(""); setMealsIncluded(false);
  };

  const clearAdvanced = () => { setFurnished(""); setBhk(""); setSharingType(""); setMealsIncluded(false); };

  const activeLabel = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.label || "Listings"
    : "All Listings";

  // Stay = hostel/pg/flat/private_room/dormitory. Mess is Food, NOT Stay.
  const accommodationCats = categories.filter((c) => accommodationCategories.includes(c.id as Category));
  const foodCats = categories.filter((c) => foodCategories.includes(c.id as Category));
  const serviceCats = categories.filter((c) => serviceCategories.includes(c.id as Category));
  const rentalCats = categories.filter((c) => rentalCategories.includes(c.id as Category));

  const sel = "w-full rounded-xl glass-input px-3 py-2 text-sm text-foreground outline-none";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">{activeLabel}</h1>

        {/* ── Sponsored ad banner ── */}
        <AdBannerHero filter={activeCategory || undefined} />

        {/* ── AI Smart Search ── */}
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4" style={{ boxShadow: "0 0 20px hsl(265 85% 60% / 0.08)" }}>
          <AISmartSearch
            onResults={(results, query) => { setAiResults(results); setAiQuery(query); }}
            onClear={() => { setAiResults(null); setAiQuery(""); }}
          />
        </div>

        {/* ── Search + basic filters ── */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 shadow-sm" style={{ boxShadow: "0 0 12px hsl(265 85% 60% / 0.06)" }}>
            <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search listings by name, area…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Distance slider */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">≤</span>
              <input type="range" min="0.1" max="5" step="0.1" value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-24 accent-primary" />
              <span className="text-sm font-medium text-foreground w-12">{maxDistance} km</span>
            </div>

            {/* Available only toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded accent-primary" />
              <span className="text-sm text-muted-foreground">Available only</span>
            </label>

            {/* View mode toggle: grid / map */}
            <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${viewMode === "grid" ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid view"
              >
                <LayoutList className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${viewMode === "map" ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Map view"
              >
                <Map className="h-3.5 w-3.5" /> Map
              </button>
            </div>

            {/* Advanced filters toggle */}
            {isAccommodationCat && (
              <button
                onClick={() => { if (!isPremium) return; setShowAdvanced(!showAdvanced); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  isPremium
                    ? showAdvanced || hasAdvancedFilters
                      ? "btn-glow text-primary-foreground"
                      : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                    : "bg-white/[0.02] text-muted-foreground/50 cursor-not-allowed"
                }`}
                title={!isPremium ? "Advanced filters require Premium" : undefined}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Advanced
                {!isPremium && <Crown className="h-3.5 w-3.5 text-primary" />}
                {hasAdvancedFilters && <span className="ml-1 flex h-2 w-2 rounded-full bg-primary-foreground" />}
              </button>
            )}
          </div>
        </div>

        {/* ── Advanced filters panel ── */}
        {showAdvanced && isPremium && isAccommodationCat && (
          <div className="mb-5 rounded-2xl glass-card glow-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-primary" /> Advanced Filters
              </h3>
              {hasAdvancedFilters && (
                <button onClick={clearAdvanced} className="text-xs text-destructive hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Furnished</label>
                <select value={furnished} onChange={(e) => setFurnished(e.target.value)} className={sel}>
                  <option value="">Any</option>
                  {FURNISHED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">BHK</label>
                <select value={bhk} onChange={(e) => setBhk(e.target.value)} className={sel}>
                  <option value="">Any</option>
                  {["1BHK","2BHK","3BHK","4BHK+"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Sharing Type</label>
                <select value={sharingType} onChange={(e) => setSharingType(e.target.value)} className={sel}>
                  <option value="">Any</option>
                  {SHARING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mealsIncluded}
                    onChange={(e) => setMealsIncluded(e.target.checked)}
                    className="rounded accent-primary" />
                  <span className="text-sm text-foreground">Meals included</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade prompt */}
        {!isPremium && isAccommodationCat && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl glass-card px-4 py-3 text-sm">
            <Crown className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Filter by furnished status, BHK, sharing type and meals with </span>
            <Link to="/subscription" className="font-semibold text-primary hover:underline">Premium</Link>
          </div>
        )}

        {/* ── Category pills ── */}
        <div className="mb-6 space-y-3">
          {/* All */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all border ${
                !activeCategory
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-white/[0.06] text-muted-foreground border-white/[0.1] hover:text-foreground hover:bg-white/[0.1]"
              }`}>
              All
            </button>
          </div>

          {/* Stay — violet */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest w-10">Stay</span>
            {accommodationCats.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                  activeCategory === cat.id
                    ? "bg-violet-500 border-violet-400 text-white shadow-md shadow-violet-500/40"
                    : "bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/25 hover:border-violet-400/50"
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Food — orange */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest w-10">Food</span>
            {foodCats.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                  activeCategory === cat.id
                    ? "bg-orange-500 border-orange-400 text-white shadow-md shadow-orange-500/40"
                    : "bg-orange-500/10 border-orange-500/25 text-orange-300 hover:bg-orange-500/25 hover:border-orange-400/50"
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Services — blue */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest w-10">Svcs</span>
            {serviceCats.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                  activeCategory === cat.id
                    ? "bg-blue-500 border-blue-400 text-white shadow-md shadow-blue-500/40"
                    : "bg-blue-500/10 border-blue-500/25 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/50"
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Rentals — cyan */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest w-10">Rent</span>
            {rentalCats.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                  activeCategory === cat.id
                    ? "bg-cyan-500 border-cyan-400 text-white shadow-md shadow-cyan-500/40"
                    : "bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400/50"
                }`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Movers & Packers highlight banner ── */}
        {(!activeCategory || activeCategory === "movers_packers") && (
          <div className="mb-6 rounded-2xl glass-card glow-border p-5 flex flex-col md:flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 shrink-0">
              <Truck className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-base font-bold text-foreground">📦 Movers & Packers Near You</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Planning to shift? Find verified movers for local &amp; intercity relocation — packing, loading, transport &amp; unpacking.
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {["Home Shifting","Office Relocation","Packing Only","Intercity Move"].map((tag) => (
                  <span key={tag} className="rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 text-xs text-orange-300">{tag}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setCategory("movers_packers")}
              className="shrink-0 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              Browse Movers →
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {viewMode === "map" && aiResults === null && (
          <div className="mb-6">
            <ListingsMap
              listings={listings}
              onSelect={(l) => window.open(`/listing/${l.id}`, "_blank")}
            />
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Click a pin to preview · Geocoding in progress for new pins
            </p>
          </div>
        )}

        {aiResults !== null ? (
          aiResults.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">🤖 AI found <span className="font-semibold text-foreground">{aiResults.length}</span> listings for "{aiQuery}"</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {aiResults.map((listing) => (<ListingCard key={listing.id} listing={listing} />))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center"><p className="text-lg text-muted-foreground">No listings found for "{aiQuery}".</p></div>
          )
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : listings.length > 0 ? (
          <>
            {pagination && (
              <p className="mb-4 text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{listings.length}</span> of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span> listings
              </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.flatMap((listing, i) => {
                const cards = [<ListingCard key={listing.id} listing={listing} />];
                // Insert an ad card after every 6th listing
                if ((i + 1) % 6 === 0) {
                  cards.push(<AdCardInline key={`ad-${i}`} index={Math.floor(i / 6)} />);
                }
                return cards;
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button disabled={!pagination.hasPrev} onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1 rounded-xl border border-white/[0.06] px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = pagination.totalPages <= 5 ? i + 1
                      : page <= 3 ? i + 1
                      : page >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i
                      : page - 2 + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                          p === pagination.page ? "btn-glow text-primary-foreground" : "border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button disabled={!pagination.hasNext} onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1 rounded-xl border border-white/[0.06] px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Premium upgrade prompt */}
            {!isPremium && pagination && pagination.total > FREE_LIMIT && (
              <div className="mt-8 rounded-2xl glass-card glow-border p-6 text-center">
                <Crown className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="font-display font-semibold text-foreground">
                  {pagination.total - FREE_LIMIT} more listings available
                </p>
                <p className="mb-4 text-sm text-muted-foreground">Upgrade to Premium to see all {pagination.total} listings</p>
                <Link to="/subscription"
                  className="inline-block rounded-xl btn-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                  Upgrade — ₹59/month
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No listings found.</p>
            <button onClick={() => { setSearch(""); setMaxDistance(5); setOnlyAvailable(false); clearAdvanced(); setPage(1); }}
              className="mt-3 text-sm text-primary hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
