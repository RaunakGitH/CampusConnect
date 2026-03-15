import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck, Package, ShieldCheck, MapPin, Star,
  ArrowRight, CheckCircle2, PhoneCall, Clock,
  Phone, BadgeCheck, IndianRupee, Filter,
} from "lucide-react";
import Header from "@/components/Header";

// ─── Rich mock movers data ────────────────────────────────────────────────────
const MOCK_MOVERS = [
  {
    id: "1",
    name: "SwiftShift Movers & Packers",
    address: "12, Industrial Area, Near Bus Stand, Jaipur",
    priceRange: "₹1,500 – ₹6,000 per shift",
    contact: "+91 91234 56789",
    rating: 4.5,
    reviews: 34,
    verified: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    tags: ["Home Shifting", "Intercity", "Same Day", "Fragile Handling"],
    badge: "⭐ Top Rated",
    badgeColor: "amber",
    desc: "Trusted student-friendly movers serving campus relocations for 5+ years. Same-day availability for small room shifts.",
  },
  {
    id: "2",
    name: "SafeMove Relocation Services",
    address: "22, Transport Nagar, Ring Road, Jaipur",
    priceRange: "₹2,000 – ₹9,000 per shift",
    contact: "+91 72345 67890",
    rating: 4.7,
    reviews: 56,
    verified: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop",
    tags: ["GPS Tracked", "Insurance Included", "Office Shifting", "Pan-India"],
    badge: "🛡️ Insured",
    badgeColor: "green",
    desc: "Premium relocation with GPS-tracked trucks and full goods insurance. Zero damage record across 500+ moves.",
  },
  {
    id: "3",
    name: "Campus Cargo Packers",
    address: "88, Shivaji Nagar, Opp. Railway Station, Jaipur",
    priceRange: "₹999 – ₹4,500 per shift",
    contact: "+91 80987 65432",
    rating: 4.3,
    reviews: 19,
    verified: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop",
    tags: ["Mini Truck", "Tempo Available", "Budget-Friendly", "Packing Boxes"],
    badge: "💰 Budget Pick",
    badgeColor: "blue",
    desc: "Budget movers for students relocating hostels, PGs and flats. Mini trucks and tempos on short notice.",
  },
  {
    id: "4",
    name: "QuickPack Express",
    address: "7, Vidhyadhar Nagar, Near College Road, Jaipur",
    priceRange: "₹800 – ₹3,000 per shift",
    contact: "+91 63456 78901",
    rating: 4.1,
    reviews: 28,
    verified: true,
    featured: false,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    tags: ["Hostel Shifting", "Bike Transport", "Same Day", "Short Notice"],
    badge: "⚡ Quick",
    badgeColor: "orange",
    desc: "Specialised in hostel and PG room shifting. Perfect for students moving mid-semester. Short notice welcome.",
  },
  {
    id: "5",
    name: "EcoMove Student Packers",
    address: "3, Govind Marg, Jagatpura, Jaipur",
    priceRange: "₹699 – ₹2,500 per shift",
    contact: "+91 45678 90123",
    rating: 4.4,
    reviews: 22,
    verified: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=600&h=400&fit=crop",
    tags: ["Eco-Friendly Packing", "Student Discount", "Bike Transport", "Weekend Slots"],
    badge: "🌱 Eco-Friendly",
    badgeColor: "emerald",
    desc: "Budget movers using eco-friendly packing materials. Special student discount. Also transport bikes and scooters.",
  },
  {
    id: "6",
    name: "Bharat Cargo Solutions",
    address: "45, Malviya Nagar, Near Overbridge, Jaipur",
    priceRange: "₹3,500 – ₹15,000 per shift",
    contact: "+91 54567 89012",
    rating: 4.2,
    reviews: 41,
    verified: true,
    featured: false,
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop",
    tags: ["Heavy Goods", "Warehouse Storage", "Intercity", "Wooden Crating"],
    badge: "🏭 Full-Service",
    badgeColor: "purple",
    desc: "Full-service cargo for home shifting, office moves and heavy machinery. Warehouse storage for gap periods.",
  },
];

const BADGE_COLORS: Record<string, string> = {
  amber:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
  green:   "bg-green-500/10 text-green-400 border-green-500/30",
  blue:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  orange:  "bg-orange-500/10 text-orange-400 border-orange-500/30",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  purple:  "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const TAG_COLORS = [
  "bg-orange-500/10 text-orange-300 border-orange-500/20",
  "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "bg-primary/10 text-primary border-primary/20",
  "bg-green-500/10 text-green-300 border-green-500/20",
];

const FEATURES = [
  { icon: "🏠", title: "Home Shifting",     desc: "Complete packing, loading, transport & unpacking for residences." },
  { icon: "🏢", title: "Office Relocation", desc: "Minimal downtime moves for offices, labs & commercial setups." },
  { icon: "📦", title: "Packing Only",      desc: "Professional packing service — we bring all materials." },
  { icon: "🚛", title: "Intercity Moves",   desc: "Safe, insured transport across cities at student-friendly rates." },
  { icon: "🛡️", title: "Insured Transport", desc: "Goods insurance included so your belongings are always protected." },
  { icon: "🔧", title: "Assembly Help",     desc: "Furniture disassembly and reassembly at your new place." },
];

const STEPS = [
  { step: "01", title: "Browse Listings",   desc: "Find verified movers near your campus with ratings & reviews." },
  { step: "02", title: "Compare & Contact", desc: "Check prices, services offered, and call or WhatsApp directly." },
  { step: "03", title: "Book Your Move",    desc: "Schedule a date, confirm the quote, and relax." },
  { step: "04", title: "Track & Review",    desc: "Watch your move happen and leave a review to help others." },
];

const TIPS = [
  "Book at least 1–2 weeks in advance, especially during semester start/end.",
  "Ask for a written quote covering packing materials, labour, and transport.",
  "Prefer movers with ★4+ ratings and at least 5 reviews on CampusConnect.",
  "Always check if insurance is included or available as an add-on.",
  "Declutter before the move — donate or sell items you no longer need.",
];

// ─── Mover Card ───────────────────────────────────────────────────────────────
const MoverCard = ({ m }: { m: typeof MOCK_MOVERS[0] }) => {
  const badgeCls = BADGE_COLORS[m.badgeColor] || BADGE_COLORS.blue;

  return (
    <div className={`rounded-2xl glass-card overflow-hidden flex flex-col transition-all hover:shadow-xl ${m.featured ? "glow-border" : ""}`}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={m.image}
          alt={m.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Featured ribbon */}
        {m.featured && (
          <div className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
            ⭐ FEATURED
          </div>
        )}

        {/* Badge */}
        <div className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm ${badgeCls}`}>
          {m.badge}
        </div>

        {/* Verified */}
        {m.verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-green-400">
            <BadgeCheck className="h-3 w-3" /> Verified
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <h3 className="font-display font-bold text-foreground leading-tight">{m.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {m.address}
          </p>
        </div>

        {/* Rating + price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-foreground">{m.rating}</span>
            <span className="text-xs text-muted-foreground">({m.reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <IndianRupee className="h-3.5 w-3.5 text-primary" />
            {m.priceRange.replace("₹", "")}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {m.tags.map((tag, i) => (
            <span
              key={tag}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action */}
        <div className="mt-auto pt-1 flex gap-2">
          <a
            href={`tel:${m.contact}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/[0.08] transition-all"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${m.contact.replace(/\D/g, "")}?text=Hi, I found your listing on CampusConnect. I need help with shifting.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-all"
          >
            <span>💬</span> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const MoversPackers = () => {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const ALL_TAGS = ["All", "Home Shifting", "Intercity", "Budget-Friendly", "Insured", "Same Day", "Hostel Shifting"];

  const filtered = MOCK_MOVERS.filter((m) => {
    const matchSearch = search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.address.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === "All" || m.tags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()));
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="orb orb-purple w-[400px] h-[400px] -left-32 -top-32" />
        <div className="orb orb-blue   w-[350px] h-[350px] -right-24 top-12" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground mb-5 animate-fade-in-up">
              <Truck className="h-4 w-4 text-orange-400" />
              <span>Verified Movers & Packers near your campus</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl animate-fade-in-up">
              Stress-free shifting,{" "}
              <span className="text-gradient">done right</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Find trusted movers for home shifting, office relocation, and intercity moves — broker-free and student-budget friendly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <button
                onClick={() => document.getElementById("movers-section")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-glow rounded-xl px-7 py-3 text-sm font-semibold text-primary-foreground flex items-center gap-2"
              >
                <Truck className="h-4 w-4" /> Browse {MOCK_MOVERS.length} Movers
              </button>
              <Link
                to="/relocation-checklist"
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-7 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.08] transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" /> Relocation Checklist
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-400" /> Verified Providers</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" /> Rated by Students</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Near Your Campus</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-400" /> Available on Demand</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="container pb-16">
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">What's Covered</h2>
        <p className="mb-8 text-muted-foreground">From single-room shifts to full office relocations</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl glass-card p-5 flex gap-4 items-start hover:glow-border transition-all">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-16">
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">How It Works</h2>
        <p className="mb-8 text-muted-foreground">4 simple steps to your next home</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.step} className="rounded-2xl glass-card p-6 relative overflow-hidden">
              <span className="absolute -top-3 -right-3 text-[5rem] font-display font-black text-white/[0.03] leading-none select-none">
                {s.step}
              </span>
              <div className="relative z-10">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-bold text-orange-400">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MOVERS SECTION ═══ */}
      <section id="movers-section" className="container pb-16">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Movers Near You</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {filtered.length} verified service{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 rounded-2xl glass-card px-4 max-w-md">
            <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by name or area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  filterTag === tag
                    ? "btn-glow text-primary-foreground"
                    : "border border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => <MoverCard key={m.id} m={m} />)}
          </div>
        ) : (
          <div className="rounded-2xl glass-card p-12 text-center">
            <Truck className="mx-auto mb-3 h-12 w-12 text-orange-400 opacity-40" />
            <p className="font-semibold text-foreground">No movers match your search</p>
            <button onClick={() => { setSearch(""); setFilterTag("All"); }} className="mt-3 text-sm text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Tips */}
      <section className="container pb-16">
        <div className="rounded-2xl glass-card glow-border p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Package className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Tips Before You Move</h2>
              <p className="text-xs text-muted-foreground">Make your shift smooth and stress-free</p>
            </div>
          </div>
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl glass-card glow-border p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
              <PhoneCall className="h-7 w-7 text-orange-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Are You a Mover or Packer?</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              List your service on CampusConnect and reach hundreds of students planning to shift every semester.
            </p>
            <Link
              to="/listings/new"
              className="mt-6 inline-block rounded-xl btn-glow px-8 py-3 text-sm font-semibold text-primary-foreground"
            >
              List My Moving Service
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

export default MoversPackers;
