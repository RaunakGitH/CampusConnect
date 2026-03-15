import { useEffect, useState } from "react";
import { Tag, Gift, Phone, Calendar, Copy, Check } from "lucide-react";
import Header from "@/components/Header";
import { partnersApi, PartnerOffer } from "@/services/api";

const OFFER_CATEGORIES = [
  { id: "all", label: "All Offers", icon: "🎁" },
  { id: "laundry", label: "Laundry", icon: "👕" },
  { id: "mess", label: "Mess", icon: "🍛" },
  { id: "tiffin", label: "Tiffin", icon: "🥡" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "stationery", label: "Stationery", icon: "📚" },
  { id: "library", label: "Library", icon: "📖" },
  { id: "cook", label: "Cook", icon: "👨‍🍳" },
  { id: "other", label: "Other", icon: "✨" },
];

const CouponBadge = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-mono font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary/60"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {code}
    </button>
  );
};

const OfferCard = ({ offer }: { offer: PartnerOffer }) => (
  <div className="overflow-hidden rounded-2xl glass-card p-5 flex flex-col gap-3 transition-all hover:shadow-[var(--shadow-card-hover)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="inline-block mb-2 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
          {offer.category}
        </span>
        <h3 className="font-display text-base font-bold text-foreground">{offer.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
      </div>
      <span className="shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-bold text-emerald-400">
        {offer.discountText}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {offer.partnerName}</span>
      {offer.partnerContact && (
        <a href={`tel:${offer.partnerContact}`} className="flex items-center gap-1 text-primary hover:underline">
          <Phone className="h-3 w-3" /> {offer.partnerContact}
        </a>
      )}
      {offer.validUntil && (
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Valid till {new Date(offer.validUntil).toLocaleDateString("en-IN")}
        </span>
      )}
    </div>

    {offer.couponCode && (
      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Use coupon code:</p>
        <CouponBadge code={offer.couponCode} />
      </div>
    )}
  </div>
);

const Partners = () => {
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    partnersApi
      .getAll(activeCategory === "all" ? undefined : activeCategory)
      .then(({ offers }) => setOffers(offers))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        {/* Hero banner */}
        <div className="mb-8 rounded-2xl glass-card glow-border p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Partner Offers</h1>
          </div>
          <p className="relative z-10 text-muted-foreground max-w-xl">
            Exclusive discounts on laundry, mess, tiffin, WiFi and more — curated for campus life. Show your coupon code at the partner outlet to redeem.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {OFFER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "btn-glow text-primary-foreground"
                  : "bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading offers...</div>
        ) : offers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No offers available right now. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
