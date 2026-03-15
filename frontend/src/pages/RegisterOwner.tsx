/**
 * RegisterOwner — Owner / Provider sign-up (2 steps)
 * Step 1: credentials
 * Step 2: promote role to employee → redirect to /subscription
 * Students → /register
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, Building2, GraduationCap,
  CheckCircle, Crown, Star, ShieldCheck, Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

const OWNER_PERKS = [
  { icon: <Building2 className="h-4 w-4" />,  text: "List unlimited properties & services" },
  { icon: <Star className="h-4 w-4" />,        text: "Verified badge on all your listings" },
  { icon: <ShieldCheck className="h-4 w-4" />, text: "Analytics — views, contacts, ratings" },
  { icon: <Crown className="h-4 w-4" />,       text: "Priority placement with Owner Priority plan" },
  { icon: <Zap className="h-4 w-4" />,         text: "Reach 10,000+ students every month" },
];

const RegisterOwner = () => {
  const { register, refreshUser } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<1 | 2>(1);

  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-colors";

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      // Promote to owner role immediately, then refresh in-memory user so
      // Dashboard and Header reflect role="employee" without a page reload.
      try {
        await authApi.setOwnerRole();
        await refreshUser();
      } catch { /* non-critical — user can refresh manually */ }
      localStorage.setItem("cc_prefs", JSON.stringify({ role: "owner" }));
      localStorage.setItem("cc_onboarded", "1");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <img src="/cc-logo.png" alt="CampusConnect" className="h-11 w-11 rounded-xl shadow-lg shadow-primary/25 object-cover" />
            CampusConnect
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 ? "Create your owner account and start listing." : "Account created! Choose your plan to go live."}
          </p>
          {/* Student link */}
          {step === 1 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Looking for accommodation?</span>
              <Link to="/register" className="text-xs font-bold text-primary hover:underline">
                Sign up as Student →
              </Link>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full transition-all duration-500"
            style={{
              width: step === 1 ? "50%" : "100%",
              background: "linear-gradient(90deg, #f59e0b, #f97316)",
            }} />
        </div>
        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-center text-amber-400">
          Step {step} of 2 — {step === 1 ? "Create Account" : "Choose Plan"}
        </p>

        <div className="rounded-2xl border border-amber-500/20 bg-card p-7 shadow-[var(--shadow-card)]">

          {/* ═══ STEP 1: Credentials ═══ */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Owner Sign Up</h1>
                  <p className="text-xs text-muted-foreground">List your property or service to thousands of students</p>
                </div>
              </div>

              {/* Perks */}
              <ul className="mb-6 space-y-2 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
                {OWNER_PERKS.map((p, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-amber-400 shrink-0">{p.icon}</span>
                    {p.text}
                  </li>
                ))}
              </ul>

              {error && (
                <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name / Business Name</label>
                  <input type="text" required placeholder="Sunrise Hostel / Raj Kumar"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <input type="email" required placeholder="you@example.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} required placeholder="Min. 6 characters"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inp} pr-10`} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
                  <input type="password" required placeholder="••••••••"
                    value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inp} />
                </div>

                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
                  {loading
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <ArrowRight className="h-4 w-4" />}
                  {loading ? "Creating account…" : "Create Owner Account →"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-amber-400 hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ═══ STEP 2: Choose Plan ═══ */}
          {step === 2 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <CheckCircle className="h-9 w-9 text-green-400" />
              </div>

              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Account Created! 🎉</h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Your owner account is ready. Choose a subscription plan to start publishing your listings to thousands of students.
                </p>
              </div>

              {/* Plan preview cards */}
              <div className="grid gap-3 text-left">
                {[
                  { name: "Owner Yearly",    price: "₹3,000/year",  tag: "BEST VALUE 🎉", color: "border-green-500/40 bg-green-500/5",  text: "text-green-400",  desc: "Save ₹588 vs monthly — list all year" },
                  { name: "Owner Basic",     price: "₹299/month",   tag: "STANDARD",      color: "border-amber-500/30 bg-amber-500/5",  text: "text-amber-400",  desc: "Publish & manage unlimited listings" },
                  { name: "Owner Priority",  price: "₹799/month",   tag: "MAX VISIBILITY",color: "border-violet-500/30 bg-violet-500/5", text: "text-violet-400", desc: "Priority placement + ad banners" },
                ].map((plan) => (
                  <div key={plan.name} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${plan.color}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{plan.name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wide ${plan.text}`}>{plan.tag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                    </div>
                    <span className={`text-sm font-bold ${plan.text}`}>{plan.price}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => navigate("/subscription?tab=owner")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
                  <Crown className="h-4 w-4" /> View Plans & Subscribe →
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                  Skip for now — go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterOwner;
