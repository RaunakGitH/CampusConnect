import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Gift, Crown, Zap, Loader2, CheckSquare, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import CategoryCard from "@/components/CategoryCard";
import ListingCard from "@/components/ListingCard";
import Header from "@/components/Header";
import { categories, accommodationCategories } from "@/data/mockData";
import { listingsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import OnboardingModal from "@/components/OnboardingModal";
import { AdSpotlight } from "@/components/AdBanner";
import type { Listing } from "@/services/api";

// ── Floating particle dot ─────────────────────────────────────────────────────
const Particle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <div
    className="pointer-events-none absolute bottom-0 rounded-full opacity-0"
    style={{
      left: `${x}%`,
      width: Math.random() * 4 + 2 + "px",
      height: Math.random() * 4 + 2 + "px",
      background: color,
      "--drift": `${(Math.random() - 0.5) * 60}px`,
      animation: `particle-rise ${3 + Math.random() * 4}s ease-out ${delay}s infinite`,
    } as React.CSSProperties}
  />
);

// ── Scrolling category ticker ─────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🏠 Hostels", "🛋️ PG Rooms", "🏢 Flats", "🍛 Mess", "🥡 Tiffin",
  "👕 Laundry", "📦 Movers", "🚌 Transport", "📶 WiFi", "💊 Medical",
  "📚 Library", "🍕 Cafés", "👨‍🍳 Private Cook", "💻 Cyber Café", "📖 Stationery",
];

const Index = () => {
  const [searchQuery, setSearchQuery]     = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("cc_onboarded");
    if (!seen) {
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
  }, []);
  const [topListings, setTopListings] = useState<Listing[]>([]);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await login("student@campusconnect.com", "Student@1234");
      navigate("/listings");
    } catch (err: any) {
      console.warn("Demo login failed:", err.message);
      alert("Demo login failed. Run: npm run seed in the backend to create demo accounts. Going to listings anyway.");
      navigate("/listings");
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    listingsApi.getAll().then(({ listings }) => {
      setTopListings(listings.filter((l) => l.rating >= 4.4).slice(0, 4));
    }).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
  };

  const featuredCategories = categories.filter((c) =>
    ["hostel", "pg", "flat", "food", "laundry", "tiffin", "movers_packers", "mess", "transport", "rental_electronics", "rental_furniture"].includes(c.id)
  );

  // Particles config
  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.6,
    x: 5 + (i * 4.7) % 90,
    color: i % 3 === 0 ? "hsl(265 85% 60%)" : i % 3 === 1 ? "hsl(220 70% 55%)" : "hsl(320 70% 60%)",
  }));

  return (
    <div className="min-h-screen bg-background">
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <Header />

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">

        {/* Background orbs */}
        <div className="orb orb-purple w-[600px] h-[600px] -left-48 -top-48 opacity-70" />
        <div className="orb orb-blue   w-[500px] h-[500px] -right-40 top-10 opacity-60" />
        <div className="orb orb-pink   w-[350px] h-[350px] left-1/3 bottom-0 opacity-50" />

        {/* Rising particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        {/* Subtle scan line */}
        <div
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          style={{ animation: "scan-line 8s ease-in-out infinite" }}
        />

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">

            {/* Trust pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] backdrop-blur-sm px-5 py-2 text-sm text-muted-foreground mb-8 animate-badge-float opacity-0"
              style={{ animation: "counter-up 0.5s ease forwards 0.1s, badge-float 3s ease-in-out 0.6s infinite" }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                <Zap className="h-3 w-3 text-primary" />
              </span>
              <span>Trusted by <strong className="text-foreground">10,000+</strong> students across India</span>
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Headline with word-by-word animation */}
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {"Everything your campus life needs,".split(" ").map((word, i) => (
                <span
                  key={i}
                  className="inline-block opacity-0 mr-[0.25em]"
                  style={{ animation: `word-slide-up 0.5s ease forwards ${0.3 + i * 0.07}s` }}
                >
                  {word}
                </span>
              ))}
              {" "}
              <span
                className="text-gradient inline-block opacity-0"
                style={{ animation: "word-slide-up 0.5s ease forwards 1.1s" }}
              >
                one tap away
              </span>
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground opacity-0"
              style={{ animation: "counter-up 0.6s ease forwards 1.2s" }}
            >
              Find hostels, PGs, flats, food joints, laundry, mess & more — all near your campus. Broker-free.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-2xl glass-card shadow-xl shadow-primary/10 opacity-0"
              style={{ animation: "counter-up 0.6s ease forwards 1.35s" }}
            >
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search hostels, PG, food, laundry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <button type="submit" className="btn-glow px-6 text-sm font-semibold text-primary-foreground m-1.5 rounded-xl animate-glow-ring">
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div
              className="mt-5 flex flex-wrap items-center justify-center gap-3 opacity-0"
              style={{ animation: "counter-up 0.6s ease forwards 1.5s" }}
            >
              <button
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-white/[0.06] disabled:opacity-60"
              >
                {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary" />}
                {demoLoading ? "Loading demo…" : "⚡ Try Demo"}
              </button>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
              >
                Browse Listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scrolling category ticker */}
        <div className="mt-14 overflow-hidden border-y border-white/[0.05] bg-white/[0.02] py-3 opacity-0" style={{ animation: "counter-up 0.5s ease forwards 2.1s" }}>
          <div className="animate-ticker flex gap-8 whitespace-nowrap" style={{ width: "max-content" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Browse by Category</h2>
        <p className="mb-8 text-muted-foreground">Accommodation, food, utilities — all in one place</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.id} id={cat.id} icon={cat.icon} label={cat.label} description={cat.description} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/listings" className="text-sm text-primary hover:underline transition-colors">
            View all 16 categories →
          </Link>
        </div>
      </section>

      {/* Sponsored spotlight — rotating owner ads */}
      <AdSpotlight />

      {/* Partner Offers Banner */}
      <section className="container pb-12">
        <div className="rounded-2xl glass-card glow-border p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
            <Gift className="h-6 w-6 text-amber-400" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-lg font-bold text-foreground">🤝 Exclusive Partner Offers</h3>
            <p className="text-sm text-muted-foreground">Get discounts on laundry, mess, tiffin, WiFi & more — curated for students.</p>
          </div>
          <Link
            to="/partners"
            className="shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20"
          >
            View Offers
          </Link>
        </div>
      </section>

      {/* Movers & Packers Banner */}
      <section className="container pb-12">
        <div className="rounded-2xl glass-card glow-border p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 shrink-0">
            <Truck className="h-6 w-6 text-orange-400" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-lg font-bold text-foreground">📦 Movers & Packers</h3>
            <p className="text-sm text-muted-foreground">
              Planning to shift? Find verified movers for home, hostel &amp; intercity relocations — student-budget friendly.
            </p>
          </div>
          <Link
            to="/movers-packers"
            className="shrink-0 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20"
          >
            Find Movers →
          </Link>
        </div>
      </section>

      {/* Rentals Banner */}
      <section className="container pb-12">
        <div className="rounded-2xl glass-card glow-border p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 shrink-0">
            <span className="text-2xl">📱</span>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-lg font-bold text-foreground">🪑 Rent Electronics & Furniture</h3>
            <p className="text-sm text-muted-foreground">
              Laptops, tablets, printers, beds, desks & more — rent for a semester without buying. Save big.
            </p>
          </div>
          <Link
            to="/rentals"
            className="shrink-0 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20"
          >
            Browse Rentals →
          </Link>
        </div>
      </section>

      {/* AI Relocation Checklist */}
      <section className="container pb-12">
        <div className="rounded-2xl glass-card glow-border p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <CheckSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-lg font-bold text-foreground">✨ AI Relocation Checklist</h3>
            <p className="text-sm text-muted-foreground">Moving to a new city? Get a personalised moving checklist in seconds — powered by AI.</p>
          </div>
          <Link
            to="/relocation-checklist"
            className="shrink-0 rounded-xl btn-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Generate Checklist
          </Link>
        </div>
      </section>

      {/* Roommate Finder Banner */}
      <section className="container pb-12">
        <div className="rounded-2xl glass-card glow-border p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 shrink-0">
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-lg font-bold text-foreground">✨ Roommate Compatibility Finder</h3>
            <p className="text-sm text-muted-foreground">Match with students who share your sleep schedule, diet, cleanliness habits & more. Find your ideal flatmate.</p>
          </div>
          <Link
            to="/roommates"
            className="shrink-0 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-400 transition-all hover:bg-violet-500/20"
          >
            Find Roommates →
          </Link>
        </div>
      </section>

      {/* Top Rated */}
      <section className="container pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-1 font-display text-2xl font-bold text-foreground">Top Rated</h2>
            <p className="text-muted-foreground">Student favorites around campus</p>
          </div>
          <Link to="/listings" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topListings.length > 0
            ? topListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl glass-card animate-pulse shimmer" />
              ))
          }
        </div>
      </section>

      {/* Premium CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl glass-card glow-border p-8 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Unlock Premium Access</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              See 200+ listings, set price alerts, get early access to new listings, and unlock exclusive partner deals.
            </p>
            <Link
              to="/subscription"
              className="mt-6 inline-block rounded-xl btn-glow px-8 py-3 text-sm font-semibold text-primary-foreground"
            >
              Get Premium — Only ₹59/month
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground">CampusConnect</p>
          <p className="mt-1">Built with ❤️ for college students everywhere</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
