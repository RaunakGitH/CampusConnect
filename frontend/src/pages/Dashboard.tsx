import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Plus, Pencil, Trash2, Crown, RefreshCw,
  Star, MapPin, BadgeCheck, AlertTriangle, ChevronRight, ChevronLeft,
  X, Save, Eye, EyeOff, Building2, TrendingUp, MessageSquare,
  BarChart2, Users, Phone, CheckCircle2, XCircle, CalendarCheck, Clock, UserCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Header from "@/components/Header";
import { listingsApi, subscriptionApi, bookingsApi } from "@/services/api";
import type { Listing, Subscription, Booking } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/mockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-muted-foreground/60">{icon}</span>
    </div>
    <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const SubBadge = ({ plan, expiresAt, isActive }: { plan?: string; expiresAt?: string; isActive: boolean }) => {
  if (!isActive) return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2.5 py-1 text-xs font-semibold"><EyeOff className="h-3 w-3" /> Inactive</span>;
  if (!expiresAt) return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">No subscription</span>;
  const expired = new Date() > new Date(expiresAt);
  const daysLeft = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
  if (expired) return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2.5 py-1 text-xs font-semibold"><AlertTriangle className="h-3 w-3" /> Expired</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${plan === "special" ? "bg-primary/10 text-primary" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
      {plan === "special" && <Crown className="h-3 w-3" />}
      {plan === "special" ? "Special" : "Normal"} · {daysLeft}d left
    </span>
  );
};

// ─── Analytics Modal ──────────────────────────────────────────────────────────
const AnalyticsModal = ({ listing, onClose }: { listing: Listing; onClose: () => void }) => {
  const [data, setData] = useState<{ total: { views: number; contacts: number }; daily: { date: string; views: number; contacts: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getAnalytics(listing.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [listing.id]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" /> Analytics — {listing.name}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">Loading analytics…</div>
          ) : data ? (
            <>
              {/* Totals */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                  <Eye className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="font-display text-2xl font-bold text-foreground">{data.total.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                  <Phone className="mx-auto mb-1 h-5 w-5 text-green-500" />
                  <p className="font-display text-2xl font-bold text-foreground">{data.total.contacts.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Contact Clicks</p>
                </div>
              </div>
              {/* Chart */}
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Last 14 Days</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.daily} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gContacts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [v, name === "views" ? "Views" : "Contact Clicks"]}
                  />
                  <Legend iconType="circle" formatter={(v) => v === "views" ? "Views" : "Contact Clicks"} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gViews)" />
                  <Area type="monotone" dataKey="contacts" stroke="#22c55e" strokeWidth={2} fill="url(#gContacts)" />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : <p className="text-center text-muted-foreground">Could not load analytics.</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ listing, onClose, onSaved }: { listing: Listing; onClose: () => void; onSaved: (l: Listing) => void }) => {
  const [form, setForm] = useState({
    name: listing.name, priceRange: listing.priceRange, contact: listing.contact,
    address: listing.address, description: listing.description, image: listing.image,
    isAvailable: listing.isAvailable !== false,
    availableRooms: listing.availableRooms != null ? String(listing.availableRooms) : "",
    monthlyPackage: listing.monthlyPackage != null ? String(listing.monthlyPackage) : "",
    perMealRate: listing.perMealRate != null ? String(listing.perMealRate) : "",
    mealsPerDay: listing.mealsPerDay != null ? String(listing.mealsPerDay) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isMess = listing.category === "mess";

  const upd = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setError("");
    if (!form.name.trim() || !form.priceRange.trim() || !form.contact.trim()) {
      setError("Name, price and contact required."); return;
    }
    setSaving(true);
    try {
      const body: Partial<Listing> = {
        name: form.name, priceRange: form.priceRange, contact: form.contact,
        address: form.address, description: form.description, image: form.image,
        isAvailable: form.isAvailable,
        ...(form.availableRooms !== "" ? { availableRooms: Number(form.availableRooms) } : {}),
        ...(isMess && form.monthlyPackage !== "" ? { monthlyPackage: Number(form.monthlyPackage) } : {}),
        ...(isMess && form.perMealRate !== "" ? { perMealRate: Number(form.perMealRate) } : {}),
        ...(isMess && form.mealsPerDay !== "" ? { mealsPerDay: Number(form.mealsPerDay) } : {}),
      };
      const { listing: updated } = await listingsApi.update(listing.id, body);
      onSaved(updated);
    } catch (e: any) { setError(e.message || "Save failed."); }
    finally { setSaving(false); }
  };

  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Edit — {listing.name}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">{error}</div>}
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label><input value={form.name} onChange={(e) => upd("name", e.target.value)} className={inp} /></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Address</label><input value={form.address} onChange={(e) => upd("address", e.target.value)} className={inp} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Price Range</label><input value={form.priceRange} onChange={(e) => upd("priceRange", e.target.value)} className={inp} /></div>
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Contact</label><input value={form.contact} onChange={(e) => upd("contact", e.target.value)} className={inp} /></div>
          </div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</label><input value={form.image} onChange={(e) => upd("image", e.target.value)} className={inp} placeholder="https://..." /></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label><textarea rows={3} value={form.description} onChange={(e) => upd("description", e.target.value)} className={`${inp} resize-none`} /></div>

          {/* Availability */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Availability</p>
            <div className="flex items-center gap-3">
              <button onClick={() => upd("isAvailable", true)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${form.isAvailable ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-400" : "bg-muted text-muted-foreground border border-border"}`}>
                <CheckCircle2 className="h-4 w-4" /> Available
              </button>
              <button onClick={() => upd("isAvailable", false)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!form.isAvailable ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-400" : "bg-muted text-muted-foreground border border-border"}`}>
                <XCircle className="h-4 w-4" /> Full
              </button>
            </div>
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Available Rooms (optional)</label>
              <input type="number" min="0" value={form.availableRooms} onChange={(e) => upd("availableRooms", e.target.value)} className={inp} placeholder="e.g. 3" /></div>
          </div>

          {/* Mess-specific */}
          {isMess && (
            <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Mess Pricing</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="mb-1 block text-xs text-muted-foreground">Monthly (₹)</label><input type="number" value={form.monthlyPackage} onChange={(e) => upd("monthlyPackage", e.target.value)} className={inp} /></div>
                <div><label className="mb-1 block text-xs text-muted-foreground">Per Meal (₹)</label><input type="number" value={form.perMealRate} onChange={(e) => upd("perMealRate", e.target.value)} className={inp} /></div>
                <div><label className="mb-1 block text-xs text-muted-foreground">Meals/Day</label><input type="number" min="1" max="5" value={form.mealsPerDay} onChange={(e) => upd("mealsPerDay", e.target.value)} className={inp} /></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Renew Modal ──────────────────────────────────────────────────────────────
const RenewModal = ({ listing, onClose, onRenewed }: { listing: Listing; onClose: () => void; onRenewed: (l: Listing) => void }) => {
  const [plan, setPlan] = useState<"normal" | "special">("normal");
  const [renewing, setRenewing] = useState(false);
  const expired = !listing.subscriptionExpiresAt || new Date() > new Date(listing.subscriptionExpiresAt);
  const base = !expired && listing.subscriptionExpiresAt ? new Date(listing.subscriptionExpiresAt) : new Date();
  const newExpiry = new Date(base); newExpiry.setMonth(newExpiry.getMonth() + 1);

  const go = async () => {
    setRenewing(true);
    try { const { listing: u } = await listingsApi.subscribe(listing.id, plan); onRenewed(u); }
    catch (e: any) { alert(e.message); setRenewing(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />{expired ? "Renew Listing" : "Extend Plan"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">New expiry: <span className="font-semibold text-foreground">{newExpiry.toLocaleDateString("en-IN")}</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["normal","special"] as const).map((p) => (
              <button key={p} onClick={() => setPlan(p)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${plan === p ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <div className="flex items-center gap-1 mb-1">
                  {p === "special" && <Crown className="h-4 w-4 text-primary" />}
                  <span className={`font-display font-bold text-sm ${p === "special" ? "text-primary" : "text-foreground"}`}>
                    {p === "special" ? "Special" : "Normal"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p === "special" ? "Featured + top placement" : "Standard visibility"}</p>
                <p className="text-sm font-bold text-foreground mt-1">{p === "special" ? "₹599" : "₹299"}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={go} disabled={renewing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${renewing ? "animate-spin" : ""}`} />{renewing ? "Processing…" : `Activate ${plan === "special" ? "Special" : "Normal"} Plan`}
          </button>
          <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Listing Card ─────────────────────────────────────────────────────────────
const ListingCard = ({ listing, onDelete, onEdit, onRenew, onAnalytics }: {
  listing: Listing; onDelete: (id: string) => void;
  onEdit: (l: Listing) => void; onRenew: (l: Listing) => void;
  onAnalytics: (l: Listing) => void;
}) => {
  const [deleting, setDeleting] = useState(false);
  const isExpired = listing.subscriptionExpiresAt ? new Date() > new Date(listing.subscriptionExpiresAt) : !listing.subscriptionExpiresAt;
  const catLabel = categories.find((c) => c.id === listing.category);

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden ${isExpired ? "border-destructive/40 opacity-80" : "border-border"}`}>
      <div className="flex">
        <div className="relative w-28 sm:w-36 shrink-0">
          <img src={listing.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&fit=crop"} alt={listing.name} className="h-full w-full object-cover" />
          {listing.isFeatured && (
            <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground flex items-center gap-0.5">
              <Crown className="h-2.5 w-2.5" /> Top
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <Link to={`/listing/${listing.id}`} target="_blank"
                className="font-display font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                {listing.name} <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {listing.address}</p>
            </div>
            <SubBadge plan={listing.subscriptionPlan} expiresAt={listing.subscriptionExpiresAt} isActive={!isExpired} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" />{listing.rating > 0 ? listing.rating : "New"}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{listing.reviewCount} reviews</span>
            {catLabel && <span>{catLabel.icon} {catLabel.label}</span>}
            <span className="font-medium text-foreground">{listing.priceRange}</span>
            {listing.verified && <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><BadgeCheck className="h-3 w-3" /> Verified</span>}
            {/* Availability */}
            {listing.isAvailable !== undefined && (
              listing.isAvailable
                ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="h-3 w-3" />{listing.availableRooms != null ? `${listing.availableRooms} avail.` : "Available"}</span>
                : <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" /> Full</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onEdit(listing)} className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => onAnalytics(listing)} className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors">
              <BarChart2 className="h-3.5 w-3.5" /> Analytics
            </button>
            <button onClick={() => onRenew(listing)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isExpired ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
              <RefreshCw className="h-3.5 w-3.5" />{isExpired ? "Renew Now" : "Extend"}
            </button>
            <button onClick={async () => {
              if (!confirm(`Delete "${listing.name}"?`)) return;
              setDeleting(true);
              try { await listingsApi.delete(listing.id); onDelete(listing.id); }
              catch (e: any) { alert(e.message); setDeleting(false); }
            }} disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-60">
              <Trash2 className="h-3.5 w-3.5" />{deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
      {isExpired && (
        <div className="bg-destructive/5 border-t border-destructive/20 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Inactive — hidden from students</span>
          <button onClick={() => onRenew(listing)} className="text-xs font-semibold text-primary hover:underline">Renew →</button>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [renewTarget, setRenewTarget] = useState<Listing | null>(null);
  const [analyticsTarget, setAnalyticsTarget] = useState<Listing | null>(null);
  const [tab, setTab]         = useState<"all" | "active" | "expired" | "bookings">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [dashPage, setDashPage] = useState(1);
  const DASH_PAGE_SIZE = 8;

  // ── Block students — Dashboard is owner-only ───────────────────────────────
  const isOwnerOrAdmin = user?.role === "employee" || user?.role === "admin";

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!isOwnerOrAdmin) return; // don't fetch for students
    Promise.all([
      listingsApi.getAll({ mine: true }),
      subscriptionApi.getMe(),
      bookingsApi.getMine(),
    ]).then(([{ listings: mine }, { subscription: sub }, { bookings: bkgs }]) => {
      setListings(mine);
      setSubscription(sub);
      setBookings(bkgs || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── Student redirect screen ────────────────────────────────────────────────
  if (user && !isOwnerOrAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl glass-card glow-border p-10 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Building2 className="h-9 w-9 text-primary/60" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Owner Dashboard</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  The dashboard is for property owners and service providers. As a student, you can browse listings, save favourites, set price alerts, and find roommates.
                </p>
              </div>
              <div className="grid gap-2">
                <Link to="/listings"
                  className="flex items-center justify-center gap-2 rounded-xl btn-glow py-3 text-sm font-semibold text-primary-foreground">
                  Browse Listings →
                </Link>
                <Link to="/saved"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all">
                  My Saved Listings
                </Link>
                <Link to="/roommates"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all">
                  Roommate Finder
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Want to list your property?{" "}
                <Link to="/subscription" className="text-primary hover:underline font-medium">
                  Upgrade to Owner plan →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string) => setListings((p) => p.filter((l) => l.id !== id));
  const handleSaved = (u: Listing) => { setListings((p) => p.map((l) => l.id === u.id ? u : l)); setEditTarget(null); };
  const handleRenewed = (u: Listing) => { setListings((p) => p.map((l) => l.id === u.id ? u : l)); setRenewTarget(null); };

  const isExpired = (l: Listing) => l.subscriptionExpiresAt ? new Date() > new Date(l.subscriptionExpiresAt) : true;
  const activeListings = listings.filter((l) => !isExpired(l));
  const expiredListings = listings.filter(isExpired);
  const totalViews = listings.reduce((s, l) => s + (l.viewCount || 0), 0);
  const totalContacts = listings.reduce((s, l) => s + (l.contactClicks || 0), 0);
  const avgRating = activeListings.length
    ? (activeListings.reduce((s, l) => s + l.rating, 0) / activeListings.length).toFixed(1) : "—";
  const isPremiumUser = subscription?.isActive && subscription.plan === "premium";

  const allTabListings = tab === "active" ? activeListings : tab === "expired" ? expiredListings : listings;
  const totalDashPages = Math.ceil(allTabListings.length / DASH_PAGE_SIZE);
  const tabListings = allTabListings.slice((dashPage - 1) * DASH_PAGE_SIZE, dashPage * DASH_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {editTarget && <EditModal listing={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {renewTarget && <RenewModal listing={renewTarget} onClose={() => setRenewTarget(null)} onRenewed={handleRenewed} />}
      {analyticsTarget && <AnalyticsModal listing={analyticsTarget} onClose={() => setAnalyticsTarget(null)} />}

      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, <span className="font-medium text-foreground">{user?.name}</span></p>
            </div>
          </div>
          <Link to="/listings/new" className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Listing
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl border border-border bg-card animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="My Listings" value={listings.length} sub={`${activeListings.length} active`} icon={<Building2 className="h-5 w-5" />} />
              <StatCard label="Avg Rating" value={avgRating} sub="active listings" icon={<TrendingUp className="h-5 w-5" />} color={avgRating !== "—" && Number(avgRating) >= 4 ? "text-green-600" : "text-foreground"} />
              <StatCard label="Total Views" value={totalViews.toLocaleString()} sub="all listings" icon={<Eye className="h-5 w-5" />} color="text-primary" />
              <StatCard label="Contact Clicks" value={totalContacts} sub="phone taps" icon={<Phone className="h-5 w-5" />} color="text-green-600" />
            </div>

            {/* Expired warning */}
            {expiredListings.length > 0 && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-destructive">{expiredListings.length} listing{expiredListings.length > 1 ? "s" : ""} need{expiredListings.length === 1 ? "s" : ""} renewal</p>
                  <p className="text-xs text-destructive/80 mt-0.5">Expired listings are hidden from students.</p>
                </div>
                <button onClick={() => setTab("expired")} className="shrink-0 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">View expired</button>
              </div>
            )}

            {/* Subscription card */}
            <div className="mb-6 rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPremiumUser ? "bg-primary/10" : "bg-muted"}`}>
                    <Crown className={`h-5 w-5 ${isPremiumUser ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{isPremiumUser ? "Premium Subscriber" : "Free Plan"}</p>
                    <p className="text-xs text-muted-foreground">{isPremiumUser && subscription?.expiresAt ? `Active until ${new Date(subscription.expiresAt).toLocaleDateString("en-IN")}` : "Upgrade for 200+ listings, alerts & partner deals"}</p>
                  </div>
                </div>
                <Link to="/subscription" className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${isPremiumUser ? "bg-muted text-muted-foreground hover:text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {isPremiumUser ? "Manage" : "Upgrade"}<ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Tab bar */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex gap-1 rounded-xl bg-muted p-1">
                {([["all","All",listings.length],["active","Active",activeListings.length],["expired","Expired",expiredListings.length]] as const).map(([key,label,count]) => (
                  <button key={key} onClick={() => { setTab(key); setDashPage(1); }}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${tab === key ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>{count}</span>
                  </button>
                ))}
                <button onClick={() => { setTab("bookings"); setDashPage(1); }}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === "bookings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  <CalendarCheck className="h-3.5 w-3.5" /> Bookings
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs ${tab === "bookings" ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>{bookings.filter(b => b.status === "pending").length}</span>
                </button>
              </div>
            </div>

            {/* Listing cards */}
            {tabListings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {tabListings.map((l) => (
                    <ListingCard key={l.id} listing={l}
                      onDelete={handleDelete} onEdit={setEditTarget}
                      onRenew={setRenewTarget} onAnalytics={setAnalyticsTarget}
                    />
                  ))}
                </div>
                {totalDashPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setDashPage(p => Math.max(1, p - 1))}
                      disabled={dashPage === 1}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{dashPage}</span> of <span className="font-semibold text-foreground">{totalDashPages}</span>
                    </span>
                    <button
                      onClick={() => setDashPage(p => Math.min(totalDashPages, p + 1))}
                      disabled={dashPage === totalDashPages}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center rounded-2xl border border-dashed border-border">
                <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-display font-semibold text-foreground mb-1">{tab === "all" ? "No listings yet" : `No ${tab} listings`}</p>
                {tab === "all" && (
                  <Link to="/listings/new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Add Your First Listing
                  </Link>
                )}
              </div>
            )}

            {/* ── Bookings Tab ── */}
            {tab === "bookings" && (
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-border">
                    <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="font-display font-semibold text-foreground mb-1">No bookings yet</p>
                    <p className="text-sm text-muted-foreground">Booking requests from students will appear here.</p>
                  </div>
                ) : bookings.map((b: Booking) => (
                  <div key={b._id} className={`rounded-2xl border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${b.status === "pending" ? "border-amber-500/30" : b.status === "confirmed" ? "border-green-500/30" : "border-border opacity-70"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{b.userName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.status === "pending" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : b.status === "confirmed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : b.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{b.date} at {b.time}{b.slotLabel ? ` — ${b.slotLabel}` : ""}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{b.userPhone}</p>
                      {b.message && <p className="text-xs text-muted-foreground mt-1 italic">"{b.message}"</p>}
                      {(b.listingId as any)?.name && <p className="text-xs text-primary mt-0.5">📍 {(b.listingId as any).name}</p>}
                    </div>
                    {b.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={async () => { await bookingsApi.updateStatus(b._id, "confirmed"); setBookings(prev => prev.map(x => x._id === b._id ? {...x, status: "confirmed"} : x)); }}
                          className="flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                        </button>
                        <button
                          onClick={async () => { await bookingsApi.updateStatus(b._id, "cancelled"); setBookings(prev => prev.map(x => x._id === b._id ? {...x, status: "cancelled"} : x)); }}
                          className="flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors">
                          <XCircle className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={async () => { await bookingsApi.updateStatus(b._id, "completed"); setBookings(prev => prev.map(x => x._id === b._id ? {...x, status: "completed"} : x)); }}
                        className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0">
                        <UserCheck className="h-3.5 w-3.5" /> Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
