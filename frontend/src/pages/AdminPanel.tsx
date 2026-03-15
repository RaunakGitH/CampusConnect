import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BarChart3, Users, Building2, BadgeCheck, Trash2, ToggleLeft,
  ToggleRight, Crown, Search, RefreshCw, Bell, Send, Shield,
  TrendingUp, Eye, Star, Gift, Plus, X, ChevronLeft, ChevronRight,
  Loader2, LayoutDashboard,
} from "lucide-react";
import Header from "@/components/Header";
import { adminApi } from "@/services/api";
import type { AdminStats, User, Listing, PartnerOffer } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const StatCard = ({ label, value, sub, icon, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-muted-foreground/50">{icon}</span>
    </div>
    <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
      active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
    }`}>
    {icon} {label}
  </button>
);

const Confirm = ({ msg, onYes, onNo }: { msg: string; onYes: () => void; onNo: () => void }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <p className="mb-5 text-sm text-foreground">{msg}</p>
      <div className="flex gap-3">
        <button onClick={onYes} className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:bg-destructive/90">Confirm</button>
        <button onClick={onNo}  className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  </div>
);

// ── Overview ──────────────────────────────────────────────────────────────────
const OverviewTab = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [breakdown, setBreakdown] = useState<{_id:string;count:number}[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(({ stats: s, categoryBreakdown: cb, recentUsers: ru, recentListings: rl }) => {
        setStats(s); setBreakdown(cb); setRecentUsers(ru); setRecentListings(rl);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="h-28 rounded-2xl border border-border bg-card animate-pulse"/>)}</div>;
  if (!stats) return <p className="text-muted-foreground">Could not load stats.</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={stats.totalUsers}          sub={`+${stats.newUsersThisWeek} this week`}  icon={<Users      className="h-5 w-5"/>}/>
        <StatCard label="Total Listings"  value={stats.totalListings}       sub={`${stats.activeListings} active`}        icon={<Building2  className="h-5 w-5"/>} color="text-primary"/>
        <StatCard label="Premium Users"   value={stats.premiumUsers}        sub="active subscriptions"                    icon={<Crown      className="h-5 w-5"/>} color="text-amber-500"/>
        <StatCard label="Total Reviews"   value={stats.totalReviews}        sub="all time"                                icon={<Star       className="h-5 w-5"/>}/>
        <StatCard label="Active Listings" value={stats.activeListings}      sub="visible to users"                        icon={<Eye        className="h-5 w-5"/>} color="text-green-600"/>
        <StatCard label="Inactive"        value={stats.inactiveListings}    sub="expired / hidden"                        icon={<LayoutDashboard className="h-5 w-5"/>} color="text-destructive"/>
        <StatCard label="Partner Offers"  value={stats.totalOffers}         sub="active deals"                            icon={<Gift       className="h-5 w-5"/>}/>
        <StatCard label="New Listings"    value={stats.newListingsThisWeek} sub="this week"                               icon={<TrendingUp className="h-5 w-5"/>}/>
      </div>

      {breakdown.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary"/> Listings by Category
          </h3>
          <div className="space-y-2">
            {breakdown.map((b) => {
              const pct = stats.activeListings ? Math.round((b.count/stats.activeListings)*100) : 0;
              return (
                <div key={b._id} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-muted-foreground capitalize shrink-0">{b._id.replace("_"," ")}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{width:`${pct}%`}}/>
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-foreground">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">Recent Users</h3>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div><p className="text-sm font-medium text-foreground">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role==="admin"?"bg-destructive/10 text-destructive":u.role==="employee"?"bg-blue-100 text-blue-700":"bg-muted text-muted-foreground"}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">Recent Listings</h3>
          <div className="space-y-2">
            {recentListings.map((l) => (
              <div key={l._id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{l.name}</p><p className="text-xs text-muted-foreground capitalize">{l.category}</p></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {l.verified && <BadgeCheck className="h-4 w-4 text-green-500"/>}
                  <span className={`rounded-full w-2 h-2 ${l.isActive?"bg-green-500":"bg-destructive"}`}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Users ─────────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRole] = useState("");
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{msg:string;fn:()=>void}|null>(null);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUsers({page, limit:LIMIT, role:roleFilter||undefined, search:search||undefined})
      .then(({users:u,pagination:p}) => {setUsers(u);setTotal(p.total);})
      .catch(console.error).finally(()=>setLoading(false));
  }, [page, roleFilter, search]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{setPage(1);},[search,roleFilter]);

  const sel = "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";
  const totalPages = Math.ceil(total/LIMIT);

  return (
    <div>
      {confirm && <Confirm msg={confirm.msg} onYes={confirm.fn} onNo={()=>setConfirm(null)}/>}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name or email…" className="flex-1 bg-transparent py-2.5 text-sm outline-none"/>
        </div>
        <select value={roleFilter} onChange={(e)=>setRole(e.target.value)} className={sel}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} className="rounded-xl border border-border px-3 py-2 text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4"/></button>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{total} users</p>
      {loading ? <div className="space-y-2">{[...Array(8)].map((_,i)=><div key={i} className="h-14 rounded-xl bg-muted animate-pulse"/>)}</div> : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{u.name}</p><p className="text-xs text-muted-foreground sm:hidden">{u.email}</p></td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e)=>setConfirm({msg:`Change role to "${e.target.value}"?`,fn:async()=>{setConfirm(null);await adminApi.updateUserRole(u._id,e.target.value);load();}})} className={`${sel} py-1 text-xs`}>
                      <option value="student">Student</option>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={()=>setConfirm({msg:`Delete "${u.name}"? Cannot be undone.`,fn:async()=>{setConfirm(null);await adminApi.deleteUser(u._id);load();}})}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages>1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"><ChevronLeft className="h-4 w-4"/> Prev</button>
          <span className="text-sm text-muted-foreground">Page <span className="font-semibold text-foreground">{page}</span> / {totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Next <ChevronRight className="h-4 w-4"/></button>
        </div>
      )}
    </div>
  );
};

// ── Listings ──────────────────────────────────────────────────────────────────
const ListingsTab = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [catFilter, setCat]     = useState("");
  const [verFilter, setVer]     = useState("");
  const [activeFilter, setAct]  = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState<{msg:string;fn:()=>void}|null>(null);
  const LIMIT = 12;
  const CATS  = ["hostel","pg","flat","private_room","dormitory","mess","food","stationery","medical","transport","laundry","tiffin","cyber_cafe","library","wifi","cook"];

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getListings({page,limit:LIMIT,category:catFilter||undefined,verified:verFilter===""?undefined:verFilter==="true",isActive:activeFilter===""?undefined:activeFilter==="true",search:search||undefined})
      .then(({listings:l,pagination:p})=>{setListings(l);setTotal(p.total);})
      .catch(console.error).finally(()=>setLoading(false));
  },[page,catFilter,verFilter,activeFilter,search]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{setPage(1);},[search,catFilter,verFilter,activeFilter]);

  const sel = "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none";
  const totalPages = Math.ceil(total/LIMIT);

  return (
    <div>
      {confirm && <Confirm msg={confirm.msg} onYes={confirm.fn} onNo={()=>setConfirm(null)}/>}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search listings…" className="flex-1 bg-transparent py-2.5 text-sm outline-none"/>
        </div>
        <select value={catFilter} onChange={(e)=>setCat(e.target.value)} className={sel}><option value="">All categories</option>{CATS.map(c=><option key={c} value={c}>{c.replace("_"," ")}</option>)}</select>
        <select value={verFilter} onChange={(e)=>setVer(e.target.value)} className={sel}><option value="">All verified</option><option value="true">Verified</option><option value="false">Unverified</option></select>
        <select value={activeFilter} onChange={(e)=>setAct(e.target.value)} className={sel}><option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option></select>
        <button onClick={load} className="rounded-xl border border-border px-3 py-2 text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4"/></button>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{total} listings</p>
      {loading ? <div className="grid gap-3 sm:grid-cols-2">{[...Array(6)].map((_,i)=><div key={i} className="h-24 rounded-xl bg-muted animate-pulse"/>)}</div> : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l._id||l.id} className={`rounded-xl border bg-card p-4 flex gap-3 ${!l.isActive?"opacity-60 border-destructive/20":"border-border"}`}>
              <img src={l.image||"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&fit=crop"} alt={l.name} className="h-16 w-20 rounded-lg object-cover shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link to={`/listing/${l._id||l.id}`} target="_blank" className="font-display font-bold text-foreground hover:text-primary">{l.name}</Link>
                    <p className="text-xs text-muted-foreground capitalize">{l.category} · {l.priceRange}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {l.verified ? <span className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400"><BadgeCheck className="h-3 w-3"/> Verified</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Unverified</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.isActive?"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400":"bg-destructive/10 text-destructive"}`}>{l.isActive?"Active":"Inactive"}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={()=>setConfirm({msg:`${l.verified?"Unverify":"Verify"} "${l.name}"?`,fn:async()=>{setConfirm(null);await adminApi.verifyListing(l._id||l.id,!l.verified);load();}})}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${l.verified?"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200":"bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"}`}>
                    <BadgeCheck className="h-3.5 w-3.5"/> {l.verified?"Unverify":"Verify"}
                  </button>
                  <button onClick={()=>setConfirm({msg:`${l.isActive?"Deactivate":"Reactivate"} "${l.name}"?`,fn:async()=>{setConfirm(null);await adminApi.toggleListing(l._id||l.id);load();}})}
                    className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {l.isActive?<ToggleRight className="h-3.5 w-3.5 text-green-500"/>:<ToggleLeft className="h-3.5 w-3.5"/>} {l.isActive?"Deactivate":"Reactivate"}
                  </button>
                  <button onClick={()=>setConfirm({msg:`Permanently delete "${l.name}"?`,fn:async()=>{setConfirm(null);await adminApi.deleteListing(l._id||l.id);load();}})}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-3.5 w-3.5"/> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages>1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"><ChevronLeft className="h-4 w-4"/> Prev</button>
          <span className="text-sm text-muted-foreground">Page <span className="font-semibold text-foreground">{page}</span> / {totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Next <ChevronRight className="h-4 w-4"/></button>
        </div>
      )}
    </div>
  );
};

// ── Partner Offers ────────────────────────────────────────────────────────────
const OffersTab = () => {
  const [offers, setOffers]     = useState<PartnerOffer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({title:"",description:"",category:"laundry",discountText:"",partnerName:"",partnerContact:"",couponCode:"",validUntil:""});

  const load = () => { setLoading(true); adminApi.getPartnerOffers().then(({offers:o})=>setOffers(o)).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);

  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{offers.length} active offers</p>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {showForm?<X className="h-4 w-4"/>:<Plus className="h-4 w-4"/>} {showForm?"Cancel":"Add Offer"}
        </button>
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-card p-5 space-y-3">
          <h3 className="font-display font-bold text-foreground">New Partner Offer</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Title *</label><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="20% off laundry" className={inp}/></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Partner Name *</label><input value={form.partnerName} onChange={(e)=>setForm({...form,partnerName:e.target.value})} placeholder="QuickWash" className={inp}/></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Discount Text *</label><input value={form.discountText} onChange={(e)=>setForm({...form,discountText:e.target.value})} placeholder="20% OFF" className={inp}/></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className={inp}>
                {["laundry","food","tiffin","wifi","library","transport","medical","stationery"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Coupon Code</label><input value={form.couponCode} onChange={(e)=>setForm({...form,couponCode:e.target.value})} placeholder="CAMPUS20" className={inp}/></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Valid Until</label><input type="date" value={form.validUntil} onChange={(e)=>setForm({...form,validUntil:e.target.value})} className={inp}/></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-xs text-muted-foreground">Description</label><input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Short description" className={inp}/></div>
          </div>
          <button onClick={async()=>{if(!form.title||!form.partnerName||!form.discountText)return;setSaving(true);try{await adminApi.createPartnerOffer(form as any);setShowForm(false);setForm({title:"",description:"",category:"laundry",discountText:"",partnerName:"",partnerContact:"",couponCode:"",validUntil:""});load();}catch(e:any){alert(e.message);}finally{setSaving(false);}}}
            disabled={saving||!form.title||!form.partnerName||!form.discountText}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Plus className="h-4 w-4"/>} {saving?"Creating…":"Create Offer"}
          </button>
        </div>
      )}
      {loading ? <div className="grid gap-3 sm:grid-cols-2">{[...Array(4)].map((_,i)=><div key={i} className="h-24 rounded-xl bg-muted animate-pulse"/>)}</div> : offers.length===0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border"><Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><p className="font-display font-semibold text-foreground mb-1">No partner offers yet</p><p className="text-sm text-muted-foreground">Add your first offer above.</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {offers.map((o)=>(
            <div key={o.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{o.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{o.partnerName} · {o.category}</p>
                <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{o.discountText}</span>
                {o.couponCode && <p className="mt-1 text-xs font-mono text-muted-foreground">Code: {o.couponCode}</p>}
              </div>
              <button onClick={async()=>{await adminApi.deletePartnerOffer(o.id);load();}} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"><Trash2 className="h-4 w-4"/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Broadcast ─────────────────────────────────────────────────────────────────
const BroadcastTab = () => {
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget]   = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState("");
  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";

  const send = async () => {
    if (!title.trim()||!message.trim()) return;
    setSending(true); setResult("");
    try { const {message:msg} = await adminApi.broadcast(title,message,target||undefined); setResult(msg); setTitle(""); setMessage(""); setTarget(""); }
    catch(e:any){setResult(`Error: ${e.message}`);}
    finally{setSending(false);}
  };

  return (
    <div className="max-w-lg">
      <p className="mb-5 text-sm text-muted-foreground">Send a push notification to users in their notification bell.</p>
      <div className="space-y-4">
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Target Audience</label>
          <select value={target} onChange={(e)=>setTarget(e.target.value)} className={inp}><option value="">All users</option><option value="student">Students only</option><option value="employee">Employees only</option><option value="admin">Admins only</option></select>
        </div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Title *</label><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. 🎉 New listings added!" className={inp}/></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Message *</label><textarea rows={4} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write your message…" className={`${inp} resize-none`}/></div>
        {result && <div className={`rounded-lg px-4 py-3 text-sm ${result.startsWith("Error")?"bg-destructive/10 text-destructive":"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>{result}</div>}
        <button onClick={send} disabled={sending||!title.trim()||!message.trim()} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {sending?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>} {sending?"Sending…":"Send Notification"}
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
type AdminTab = "overview"|"users"|"listings"|"offers"|"broadcast";

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate          = useNavigate();
  const [tab, setTab]     = useState<AdminTab>("overview");

  useEffect(()=>{
    if (!loading && (!user||user.role!=="admin")) navigate("/");
  },[user,loading,navigate]);

  if (loading||!user) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  if (user.role!=="admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      <div className="container py-8 max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive"/>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage users, listings, offers & notifications</p>
            </div>
          </div>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">🔒 Admin Only</span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <TabBtn active={tab==="overview"}  onClick={()=>setTab("overview")}  icon={<BarChart3 className="h-4 w-4"/>}    label="Overview"/>
          <TabBtn active={tab==="users"}     onClick={()=>setTab("users")}     icon={<Users    className="h-4 w-4"/>}    label="Users"/>
          <TabBtn active={tab==="listings"}  onClick={()=>setTab("listings")}  icon={<Building2 className="h-4 w-4"/>}   label="Listings"/>
          <TabBtn active={tab==="offers"}    onClick={()=>setTab("offers")}    icon={<Gift     className="h-4 w-4"/>}    label="Partner Offers"/>
          <TabBtn active={tab==="broadcast"} onClick={()=>setTab("broadcast")} icon={<Bell     className="h-4 w-4"/>}    label="Broadcast"/>
        </div>

        {tab==="overview"  && <OverviewTab/>}
        {tab==="users"     && <UsersTab/>}
        {tab==="listings"  && <ListingsTab/>}
        {tab==="offers"    && <OffersTab/>}
        {tab==="broadcast" && <BroadcastTab/>}
      </div>
    </div>
  );
};

export default AdminPanel;
