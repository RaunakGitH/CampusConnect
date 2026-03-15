import { useEffect, useState } from "react";
import {
  Crown,
  Check,
  X,
  Zap,
  Bell,
  Filter,
  Star,
  Shield,
  Gift,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  Building2,
  GraduationCap,
  Loader2,
  Megaphone,
  ArrowUp,
} from "lucide-react";
import Header from "@/components/Header";
import { subscriptionApi, authApi } from "@/services/api";
import CashfreeCheckout from "@/components/CashfreeCheckout";
import type { Subscription, CouponValidation } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

const STUDENT_FEATURES = [
  { icon: <Star className="h-4 w-4" />, text: "Browse up to 200 listings" },
  {
    icon: <Filter className="h-4 w-4" />,
    text: "Advanced filters — BHK, furnished, sharing type",
  },
  {
    icon: <Bell className="h-4 w-4" />,
    text: "Price alerts — notified on budget matches",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    text: "Early access to newly added listings",
  },
  { icon: <Gift className="h-4 w-4" />, text: "Exclusive partner discounts" },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "Priority support & notifications",
  },
];
const OWNER_BASIC_FEATURES = [
  {
    icon: <Building2 className="h-4 w-4" />,
    text: "Publish & manage unlimited listings",
  },
  {
    icon: <Star className="h-4 w-4" />,
    text: "Listing analytics — views & contact clicks",
  },
  {
    icon: <Bell className="h-4 w-4" />,
    text: "Instant notifications on reviews & enquiries",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "Verified badge on your listings",
  },
  {
    icon: <Gift className="h-4 w-4" />,
    text: "Use FREEMONTH for your first month free!",
  },
];
const OWNER_PRIORITY_FEATURES = [
  {
    icon: <Crown className="h-4 w-4" />,
    text: "Everything in Basic — plus priority placement",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    text: "Listings appear at the TOP of search results",
  },
  {
    icon: <Megaphone className="h-4 w-4" />,
    text: "Ad banner on homepage & listings page",
  },
  {
    icon: <Star className="h-4 w-4" />,
    text: "Featured badge on all your listings",
  },
  {
    icon: <ArrowUp className="h-4 w-4" />,
    text: "Priority ranking in AI Smart Search",
  },
  { icon: <Shield className="h-4 w-4" />, text: "Dedicated priority support" },
];

const OWNER_YEARLY_FEATURES = [
  {
    icon: <Building2 className="h-4 w-4" />,
    text: "Everything in Owner Basic — for a full year",
  },
  {
    icon: <Star className="h-4 w-4" />,
    text: "Save ₹588 vs monthly (₹299 × 12 = ₹3,588)",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "Verified badge on all your listings",
  },
  {
    icon: <Bell className="h-4 w-4" />,
    text: "Analytics, review & enquiry notifications",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    text: "12 months uninterrupted — no renewal hassle",
  },
  {
    icon: <Crown className="h-4 w-4" />,
    text: "Best value for serious property owners",
  },
];
const FREE_FEATURES = [
  "Browse up to 50 listings",
  "Basic category filters",
  "View contact details",
  "Post & manage reviews",
];
const FAQS = [
  {
    q: "What is the Owner Yearly plan?",
    a: "The Owner Yearly plan gives you all the features of Owner Basic (publish listings, analytics, verified badge) for a full 12 months at ₹3,000 — saving you ₹588 compared to paying ₹299 each month. Pay once, list all year without worrying about renewals.",
  },
  {
    q: "What's the difference between Basic and Priority?",
    a: "Owner Basic (₹299/month or ₹3,000/year) lets you publish and manage listings with analytics and a verified badge. Owner Priority (₹799/month) adds priority placement at the top of search results, an ad banner on the homepage, and a Featured badge — maximum visibility.",
  },
  {
    q: "Can I upgrade from Basic to Priority?",
    a: "Yes. Subscribe to Owner Priority and it will replace your current plan, with time credit carried over.",
  },
  {
    q: "Are there student discount coupons?",
    a: "Yes! Use code STUDENT10 for 10% off the student premium plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime — access continues until end of your billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, credit/debit cards, net banking, and wallets via Cashfree.",
  },
  {
    q: "Is the owner subscription per listing or per account?",
    a: "Per account — one subscription covers all listings you manage.",
  },
];

const CouponInput = ({
  subscriptionType,
  onApplied,
}: {
  subscriptionType: string;
  onApplied: (v: CouponValidation | null) => void;
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidation | null>(null);
  const [error, setError] = useState("");
  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await subscriptionApi.validateCoupon(
        code.trim(),
        subscriptionType as any,
      );
      setResult(data);
      onApplied(data);
    } catch (e: any) {
      setError(e.message || "Invalid coupon");
      onApplied(null);
    } finally {
      setLoading(false);
    }
  };
  const handleRemove = () => {
    setCode("");
    setResult(null);
    setError("");
    onApplied(null);
  };
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" /> Coupon Code
      </label>
      {result ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-emerald-400">
              {result.code}
            </span>{" "}
            {result.isFree ? (
              <span className="text-emerald-400">— 1 month FREE!</span>
            ) : (
              <span className="text-emerald-400">
                — ₹{result.originalPrice} → ₹{result.finalPrice}
              </span>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="e.g. FREEMONTH"
            className="flex-1 rounded-xl glass-input px-3 py-2.5 text-sm text-foreground outline-none font-mono tracking-wider placeholder:text-muted-foreground"
          />
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{" "}
            Apply
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
};

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {q}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
};

type PlanKey = "student" | "owner_basic" | "owner_priority" | "owner_yearly";
type Tab = "student" | "owner";

const SubscriptionPage = () => {
  const { user, loading, isPremium, setIsPremium, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("student");
  const [coupons, setCoupons] = useState<
    Record<PlanKey, CouponValidation | null>
  >({
    student: null,
    owner_basic: null,
    owner_priority: null,
    owner_yearly: null,
  });
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState<PlanKey | null>(null);
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeType = subscription?.subscriptionType as PlanKey | undefined;
  const isActive = subscription?.isActive && subscription.plan === "premium";

  useEffect(() => {
    if (!user) return;
    subscriptionApi
      .getMe()
      .then(({ subscription: s }) => {
        setSubscription(s);
        setIsPremium(s.isActive && s.plan === "premium");
      })
      .catch(console.error)
      .finally(() => setSubLoading(false));
  }, [user]);

  // ── FIX: Persist redirect params in sessionStorage so they survive the
  //         AuthContext loading delay. Clear URL immediately to prevent double-verify.
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const success = searchParams.get("success");
    if (orderId && success) {
      const subType = searchParams.get("subType") || "student";
      const couponC = searchParams.get("coupon") || "";
      sessionStorage.setItem(
        "cc_pending_order",
        JSON.stringify({ orderId, subType, couponC }),
      );
      setSearchParams({}, { replace: true }); // clean URL immediately
    }
  }, []); // run once on mount only

  useEffect(() => {
    if (!user || loading) return; // wait for auth to settle
    const raw = sessionStorage.getItem("cc_pending_order");
    if (!raw) return;
    sessionStorage.removeItem("cc_pending_order");

    let parsed: { orderId: string; subType: string; couponC: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const { orderId, subType, couponC } = parsed;

    subscriptionApi
      .verifyOrder(orderId, couponC || undefined)
      .then(async ({ subscription: s }) => {
        setSubscription(s);
        setIsPremium(true);
        setPaySuccess(subType as PlanKey);
        await ensureOwnerRole(subType);
        // Re-fetch from server to make sure UI reflects the live state
        subscriptionApi
          .getMe()
          .then(({ subscription: fresh }) => setSubscription(fresh))
          .catch(() => {});

      })
      .catch((e: any) =>
        setPayError(
          e.message || "Could not verify payment. Please contact support.",
        ),
      );
  }, [user, loading]);

  const handleApplyCouponFree = async (planKey: PlanKey) => {
    const coupon = coupons[planKey];
    if (!coupon?.isFree || !user) return;
    setApplying(true);
    setPayError("");
    try {
      const { subscription: s } = await subscriptionApi.applyCouponFree(
        coupon.code,
        planKey as any,
      );
      setSubscription(s);
      setIsPremium(true);
      setPaySuccess(planKey);
      await ensureOwnerRole(planKey);
      subscriptionApi
        .getMe()
        .then(({ subscription: fresh }) => setSubscription(fresh))
        .catch(() => {});

    } catch (e: any) {
      setPayError(e.message);
    } finally {
      setApplying(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Cancel your subscription? Access continues until end of billing period.",
      )
    )
      return;
    setCancelling(true);
    try {
      await subscriptionApi.cancel();
      setSubscription((prev) => (prev ? { ...prev, isActive: false } : null));
      setIsPremium(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCancelling(false);
    }
  };

  // After buying any owner plan: upgrade role if needed, then always refresh
  // the in-memory user so Dashboard, Header, and AddListing see updated role + subscription.
  const ensureOwnerRole = async (planKey: string) => {
    const OWNER_PLANS = ["owner_basic", "owner_priority", "owner_yearly", "owner"];
    if (!OWNER_PLANS.includes(planKey)) return;
    // Step 1: promote role (separate try so step 2 always runs)
    if (user?.role === "student") {
      try { await authApi.setOwnerRole(); } catch { /* non-critical */ }
    }
    // Step 2: always refresh user so role + subscription are current in memory
    try { await refreshUser(); } catch { /* non-critical */ }
  };

  const isThisPlanActive = (planKey: PlanKey) =>
    isActive &&
    (activeType === planKey ||
      (planKey === "owner_basic" && activeType === "owner"));

  const planMeta: Record<
    PlanKey,
    {
      label: string;
      price: number;
      period: string;
      badge: string;
      badgeColor: string;
      features: { icon: React.ReactNode; text: string }[];
      highlight: boolean;
      hint?: string;
    }
  > = {
    student: {
      label: "Student Premium",
      price: 59,
      period: "/month",
      badge: "MOST POPULAR",
      badgeColor: "from-primary to-secondary",
      features: STUDENT_FEATURES,
      highlight: true,
    },
    owner_basic: {
      label: "Owner Basic",
      price: 299,
      period: "/month",
      badge: "STANDARD",
      badgeColor: "from-amber-500 to-orange-500",
      features: OWNER_BASIC_FEATURES,
      highlight: false,
    },
    owner_priority: {
      label: "Owner Priority",
      price: 799,
      period: "/month",
      badge: "MAX VISIBILITY",
      badgeColor: "from-violet-500 to-purple-600",
      features: OWNER_PRIORITY_FEATURES,
      highlight: false,
    },
    owner_yearly: {
      label: "Owner Yearly",
      price: 3000,
      period: "/year",
      badge: "BEST VALUE 🎉",
      badgeColor: "from-green-500 to-emerald-600",
      features: OWNER_YEARLY_FEATURES,
      highlight: true,
      hint: "Save ₹588 vs monthly — pay once, list all year!",
    },
  };

  // Owner tab shows all 3 owner plans (no Free card); student tab shows student plan with free card
  const visiblePlans: PlanKey[] =
    tab === "owner"
      ? ["owner_yearly", "owner_basic", "owner_priority"]
      : ["student"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative overflow-hidden border-b border-white/[0.06] py-14">
        <div className="orb orb-purple w-[400px] h-[400px] -left-40 -top-20" />
        <div className="orb orb-blue w-[300px] h-[300px] -right-20 -bottom-20" />
        <div className="container text-center max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Sparkles className="h-4 w-4" /> CampusConnect Plans
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
            The right plan for <span className="text-gradient">everyone</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Students find their perfect stay. Owners reach thousands of
            students.
          </p>
          {!subLoading && isActive && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 text-sm font-semibold text-emerald-400">
              <Check className="h-4 w-4" />{" "}
              {planMeta[activeType as PlanKey]?.label || "Premium"} Active
              {subscription?.expiresAt &&
                ` · Until ${new Date(subscription.expiresAt).toLocaleDateString("en-IN")}`}
            </div>
          )}
        </div>
      </section>

      <div className="container py-10 max-w-5xl">
        {/* Tab */}
        <div className="flex justify-center mb-10">
          <div className="flex w-full max-w-sm rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 gap-1">
            {(["student", "owner"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPayError("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${tab === t ? "bg-white/[0.08] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "student" ? (
                  <GraduationCap className="h-4 w-4 shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 shrink-0" />
                )}{" "}
                I'm a {t === "student" ? "Student" : "Owner / Provider"}
              </button>
            ))}
          </div>
        </div>

        {/* Cards — owner tab: 3 plan cards, no Free card; student tab: Free + Student */}
        <div
          className={`grid gap-5 mb-12 ${tab === "owner" ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {/* Free card — student tab only */}
          {tab === "student" && (
            <div className="rounded-2xl glass-card p-5 sm:p-7 flex flex-col">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Free
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Get started at no cost
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">₹0</span>
                <span className="text-muted-foreground text-sm"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      <Check className="h-3 w-3 text-muted-foreground" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {!isActive && !subLoading && (
                <div className="rounded-xl border border-white/[0.06] px-4 py-2.5 text-center text-sm text-muted-foreground">
                  {user ? "Your current plan" : "Always free"}
                </div>
              )}
            </div>
          )}

          {visiblePlans.map((planKey) => {
            const meta = planMeta[planKey];
            const coupon = coupons[planKey];
            const finalPrice = coupon ? coupon.finalPrice : meta.price;
            const thisActive = isThisPlanActive(planKey);
            return (
              <div
                key={planKey}
                className={`rounded-2xl glass-card p-5 sm:p-7 flex flex-col relative overflow-hidden ${meta.highlight ? "glow-border shadow-lg shadow-primary/10" : ""}`}
              >
                <div
                  className={`absolute top-0 right-0 rounded-bl-2xl bg-gradient-to-r ${meta.badgeColor} px-4 py-1.5 text-xs font-bold text-white`}
                >
                  {meta.badge}
                </div>
                <div className="mb-5">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    {meta.label}
                  </h2>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    {coupon && coupon.finalPrice !== meta.price ? (
                      <>
                        <span className="line-through text-muted-foreground text-2xl mr-2">
                          ₹{meta.price}
                        </span>
                        ₹{coupon.finalPrice}
                      </>
                    ) : (
                      `₹${meta.price}`
                    )}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    {meta.period}
                  </span>
                  {meta.hint && !coupon && (
                    <p className="mt-0.5 text-xs text-primary font-medium">
                      {meta.hint}
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-5 flex-1">
                  {meta.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-foreground"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        {f.icon}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                {user && !subLoading && !thisActive && (
                  <CouponInput
                    subscriptionType={planKey}
                    onApplied={(v) =>
                      setCoupons((prev) => ({ ...prev, [planKey]: v }))
                    }
                  />
                )}
                <div className="mt-4">
                  {subLoading ? (
                    <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                  ) : thisActive ? (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4" /> Active!
                      </div>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1 py-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        {cancelling ? "Cancelling..." : "Cancel subscription"}
                      </button>
                    </div>
                  ) : (
                    <>
                      {payError && (
                        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 mb-2">
                          {payError}
                        </p>
                      )}
                      {paySuccess === planKey ? (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-center space-y-3">
                          <p className="font-semibold text-emerald-400">🎉 {meta.label} Activated!</p>
                          {["owner_basic","owner_priority","owner_yearly"].includes(planKey) ? (
                            <Link to="/listings/new" className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                              Add Your First Listing →
                            </Link>
                          ) : (
                            <Link to="/listings" className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                              Browse Listings →
                            </Link>
                          )}
                        </div>
                      ) : user ? (
                        coupon?.isFree ? (
                          <button
                            onClick={() => handleApplyCouponFree(planKey)}
                            disabled={applying}
                            className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-all"
                          >
                            {applying ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Gift className="h-4 w-4" />
                            )}
                            {applying
                              ? "Activating..."
                              : "Activate Free Month →"}
                          </button>
                        ) : (
                          <CashfreeCheckout
                            onSuccess={async (sub) => {
                              setSubscription(sub);
                              setIsPremium(true);
                              setPaySuccess(planKey);
                              await ensureOwnerRole(planKey);
                              // Re-fetch to confirm server state
                              subscriptionApi
                                .getMe()
                                .then(({ subscription: fresh }) =>
                                  setSubscription(fresh),
                                )
                                .catch(() => {});

                            }}
                            onError={setPayError}
                            label={`Subscribe — ₹${finalPrice}${meta.period}`}
                            subscriptionType={planKey as any}
                            couponCode={coupon?.code}
                          />
                        )
                      ) : (
                        <Link
                          to="/register"
                          className="block w-full rounded-xl btn-glow py-3.5 text-sm font-bold text-primary-foreground text-center"
                        >
                          Sign up to get started
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Owner comparison table */}
        {tab === "owner" && (
          <div className="mb-10 rounded-2xl glass-card p-6">
            <h3 className="font-display text-base font-bold text-foreground mb-4 text-center">
              Plan Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-2 text-left text-muted-foreground font-medium">
                      Feature
                    </th>
                    <th className="py-2 text-center text-green-400 font-semibold">
                      Yearly ₹3,000
                    </th>
                    <th className="py-2 text-center text-amber-400 font-semibold">
                      Basic ₹299/mo
                    </th>
                    <th className="py-2 text-center text-violet-400 font-semibold">
                      Priority ₹799/mo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Publish listings", true, true, true],
                    ["Verified badge", true, true, true],
                    ["Analytics dashboard", true, true, true],
                    ["Review notifications", true, true, true],
                    ["Duration", "12 months", "1 month", "1 month"],
                    ["Priority in search", false, false, true],
                    ["Homepage ad banner", false, false, true],
                    ["Featured badge", false, false, true],
                    ["AI Smart Search boost", false, false, true],
                  ].map(([feat, yearly, basic, priority]) => (
                    <tr key={feat as string}>
                      <td className="py-2.5 text-foreground">{feat}</td>
                      <td className="py-2.5 text-center">
                        {typeof yearly === "boolean" ? (
                          yearly ? (
                            <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-semibold text-green-400">
                            {yearly}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {typeof basic === "boolean" ? (
                          basic ? (
                            <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {basic}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {typeof priority === "boolean" ? (
                          priority ? (
                            <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {priority}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl glass-card px-6">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
