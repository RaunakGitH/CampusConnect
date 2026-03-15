/**
 * AdBanner — Mock sponsored ads for Owner Priority subscribers
 * These simulate what real owners would see when they pay ₹799/month.
 * Three variants: hero banner, inline card, sidebar strip.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Megaphone, Star, MapPin, ExternalLink, Zap } from "lucide-react";

// ─── Mock ad data ─────────────────────────────────────────────────────────────
export const MOCK_ADS = [
  {
    id: "ad1",
    type: "accommodation",
    ownerName: "Sunrise Boys Hostel",
    headline: "🏠 Rooms Available Now — ₹4,000/mo",
    sub: "Walk to campus in 5 min · Wi-Fi · Meals · 24/7 Security",
    cta: "Book a Visit →",
    link: "/listings",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=300&fit=crop",
    badge: "⭐ 4.3 · Verified",
    accentColor: "#6366f1",
    tag: "SPONSORED",
    category: "hostel",
  },
  {
    id: "ad2",
    type: "food",
    ownerName: "Annapurna Student Mess",
    headline: "🍛 Monthly Mess — Only ₹2,200",
    sub: "Home-style food · 3 meals/day · Veg & Non-Veg · Near Engineering Block",
    cta: "Check Menu →",
    link: "/listings",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=300&fit=crop",
    badge: "⭐ 4.5 · 310 reviews",
    accentColor: "#f97316",
    tag: "PROMOTED",
    category: "mess",
  },
  {
    id: "ad3",
    type: "service",
    ownerName: "SwiftShift Movers",
    headline: "📦 Moving Soon? From ₹1,500",
    sub: "Same-day shifts · Packing included · Hostel, PG & flat moves",
    cta: "Get a Free Quote →",
    link: "/movers-packers",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop",
    badge: "⭐ 4.5 · Verified",
    accentColor: "#f59e0b",
    tag: "SPONSORED",
    category: "movers_packers",
  },
  {
    id: "ad4",
    type: "accommodation",
    ownerName: "Lakshmi Girls PG",
    headline: "🛋️ Girls PG — ₹5,500/mo All Inclusive",
    sub: "Single & double rooms · AC · CCTV · Meals · Study Room",
    cta: "View Rooms →",
    link: "/listings",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=300&fit=crop",
    badge: "⭐ 4.6 · 3D Tour",
    accentColor: "#ec4899",
    tag: "PROMOTED",
    category: "pg",
  },
  {
    id: "ad5",
    type: "food",
    ownerName: "Maa Tiffin Service",
    headline: "🥡 Home-cooked Tiffin — ₹80/meal",
    sub: "Lunch + Dinner delivery · Veg & Non-Veg · Monthly ₹2,500",
    cta: "Subscribe Now →",
    link: "/listings",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=300&fit=crop",
    badge: "⭐ 4.6 · 145 reviews",
    accentColor: "#10b981",
    tag: "SPONSORED",
    category: "tiffin",
  },
];

// ─── Rotating logic ───────────────────────────────────────────────────────────
function useRotatingAd(pool: typeof MOCK_ADS, intervalMs = 8000, seed = 0) {
  const [idx, setIdx] = useState(seed % pool.length);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % pool.length), intervalMs);
    return () => clearInterval(t);
  }, [pool.length, intervalMs]);
  return pool[idx];
}

// ─── VARIANT 1 — Hero / Banner (full-width, used in Listings page) ────────────
export function AdBannerHero({ filter }: { filter?: string }) {
  const [dismissed, setDismissed] = useState(false);
  const pool = filter
    ? MOCK_ADS.filter((a) => a.category === filter || a.type === filter)
    : MOCK_ADS;
  const ad = useRotatingAd(pool.length ? pool : MOCK_ADS, 10000, 0);
  if (dismissed) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] mb-5"
      style={{ background: `linear-gradient(135deg, ${ad.accentColor}18, ${ad.accentColor}08)` }}
    >
      {/* Background image strip */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${ad.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4">
        {/* Ad label */}
        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase border"
          style={{ color: ad.accentColor, borderColor: ad.accentColor + "50", background: ad.accentColor + "15" }}
        >
          {ad.tag}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-foreground text-sm sm:text-base leading-tight">{ad.headline}</p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{ad.sub}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{ad.badge}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5"><Megaphone className="h-2.5 w-2.5" /> {ad.ownerName}</span>
          </div>
        </div>

        <Link
          to={ad.link}
          className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5"
          style={{ background: ad.accentColor }}
        >
          {ad.cta} <ExternalLink className="h-3 w-3" />
        </Link>

        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── VARIANT 2 — Inline Card (fits in listing grids as a "sponsored" slot) ────
export function AdCardInline({ index = 0 }: { index?: number }) {
  const ad = useRotatingAd(MOCK_ADS, 12000, index);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/[0.1] flex flex-col"
      style={{ background: `linear-gradient(135deg, ${ad.accentColor}18, ${ad.accentColor}05)` }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={ad.image}
          alt={ad.ownerName}
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span
          className="absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase border"
          style={{ color: ad.accentColor, borderColor: ad.accentColor + "50", background: "rgba(0,0,0,0.6)" }}
        >
          {ad.tag}
        </span>
        <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">{ad.badge}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-display font-bold text-foreground text-sm leading-tight">{ad.headline}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ad.sub}</p>
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Megaphone className="h-2.5 w-2.5 shrink-0" /> {ad.ownerName}
        </p>
        <Link
          to={ad.link}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: ad.accentColor }}
        >
          {ad.cta}
        </Link>
      </div>
    </div>
  );
}

// ─── VARIANT 3 — Sidebar strip (used in ListingDetail sidebar) ─────────────────
export function AdSidebar() {
  const ad = useRotatingAd(MOCK_ADS, 15000, 2);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.1]"
      style={{ background: `linear-gradient(135deg, ${ad.accentColor}15, ${ad.accentColor}05)` }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img src={ad.image} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span
          className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase"
          style={{ color: ad.accentColor, background: "rgba(0,0,0,0.7)" }}
        >
          {ad.tag}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <p className="font-display font-semibold text-sm text-foreground leading-tight">{ad.headline}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{ad.sub}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Zap className="h-2.5 w-2.5" style={{ color: ad.accentColor }} /> {ad.ownerName} · {ad.badge}
        </p>
        <Link
          to={ad.link}
          className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: ad.accentColor }}
        >
          {ad.cta}
        </Link>
      </div>
    </div>
  );
}

// ─── VARIANT 4 — Homepage spotlight banner (wide, prominent) ──────────────────
export function AdSpotlight() {
  const [adIdx, setAdIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAdIdx((i) => (i + 1) % MOCK_ADS.length), 7000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;
  const ad = MOCK_ADS[adIdx];

  return (
    <section className="container pb-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-xl">
        {/* BG */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-700"
          style={{ backgroundImage: `url(${ad.image})` }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `linear-gradient(135deg, ${ad.accentColor}40, transparent)` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 p-5 md:p-6">
          {/* Thumbnail */}
          <div className="shrink-0 h-20 w-32 rounded-xl overflow-hidden border border-white/[0.1] hidden md:block">
            <img src={ad.image} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase border"
                style={{ color: ad.accentColor, borderColor: ad.accentColor + "50", background: ad.accentColor + "20" }}
              >
                {ad.tag}
              </span>
              <span className="text-xs text-muted-foreground">· {ad.ownerName}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">{ad.headline}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{ad.sub}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center md:justify-start">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {ad.badge}
              <span className="mx-1">·</span>
              <MapPin className="h-3 w-3 text-primary" /> Near Your Campus
            </p>
          </div>

          <Link
            to={ad.link}
            className="shrink-0 rounded-2xl px-6 py-3 text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 shadow-lg"
            style={{ background: ad.accentColor, boxShadow: `0 8px 24px ${ad.accentColor}40` }}
          >
            {ad.cta}
          </Link>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="relative z-10 flex justify-center gap-1.5 pb-3">
          {MOCK_ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setAdIdx(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === adIdx ? "20px" : "6px",
                background: i === adIdx ? ad.accentColor : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
