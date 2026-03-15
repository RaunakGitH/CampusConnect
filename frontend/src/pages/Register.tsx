/**
 * Register — Student sign-up (3 steps)
 * Step 1: credentials
 * Step 2: what are you looking for + budget
 * Step 3: lifestyle profile for roommate matching
 * Owners → /register/owner
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, UserPlus, ArrowRight, GraduationCap,
  Cigarette, Moon, Wind, Utensils, Music, Users,
  BookOpen, Cat, Wine, Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { roommateApi } from "@/services/api";

// ─── What students are looking for ───────────────────────────────────────────
const LOOKING_FOR_GROUPS = [
  {
    label: "Stay",
    options: [
      { id: "hostel",       label: "Hostel",       icon: "🏠" },
      { id: "pg",           label: "PG",           icon: "🛋️" },
      { id: "flat",         label: "Flat / Room",  icon: "🏢" },
      { id: "private_room", label: "Private Room", icon: "🚪" },
      { id: "dormitory",    label: "Dormitory",    icon: "🛏️" },
    ],
  },
  {
    label: "Food",
    options: [
      { id: "mess",   label: "Mess",         icon: "🍛" },
      { id: "tiffin", label: "Tiffin",       icon: "🥡" },
      { id: "food",   label: "Food / Café",  icon: "🍕" },
      { id: "cook",   label: "Private Cook", icon: "👨‍🍳" },
    ],
  },
  {
    label: "Services",
    options: [
      { id: "laundry",        label: "Laundry",   icon: "👕" },
      { id: "movers_packers", label: "Movers",    icon: "📦" },
      { id: "transport",      label: "Transport", icon: "🚌" },
      { id: "wifi",           label: "WiFi",      icon: "📶" },
      { id: "medical",        label: "Medical",   icon: "💊" },
    ],
  },
];

const BUDGETS = [
  { label: "Under ₹3k",  max: 3000   },
  { label: "₹3k – 6k",   max: 6000   },
  { label: "₹6k – 10k",  max: 10000  },
  { label: "₹10k+",      max: 999999 },
];

// ─── Lifestyle questions ──────────────────────────────────────────────────────
const LIFESTYLE_QUESTIONS = [
  {
    key: "smoking", label: "Do you smoke?", icon: <Cigarette className="h-4 w-4" />,
    options: [{ v: "no", l: "Non-smoker", e: "🚭" }, { v: "occasionally", l: "Occasionally", e: "🌬️" }, { v: "yes", l: "Smoker", e: "🚬" }, { v: "no_preference", l: "No pref", e: "🤷" }],
  },
  {
    key: "drinking", label: "Do you drink?", icon: <Wine className="h-4 w-4" />,
    options: [{ v: "no", l: "Never", e: "🚫" }, { v: "occasionally", l: "Occasionally", e: "🥂" }, { v: "yes", l: "Regularly", e: "🍺" }, { v: "no_preference", l: "No pref", e: "🤷" }],
  },
  {
    key: "sleepSchedule", label: "Sleep schedule?", icon: <Moon className="h-4 w-4" />,
    options: [{ v: "early_bird", l: "Early bird", e: "🐦" }, { v: "flexible", l: "Flexible", e: "💤" }, { v: "night_owl", l: "Night owl", e: "🦉" }],
  },
  {
    key: "cleaniness", label: "How tidy?", icon: <Wind className="h-4 w-4" />,
    options: [{ v: "very_clean", l: "Very tidy", e: "✨" }, { v: "moderate", l: "Moderate", e: "🧹" }, { v: "relaxed", l: "Relaxed", e: "😌" }],
  },
  {
    key: "diet", label: "Diet?", icon: <Utensils className="h-4 w-4" />,
    options: [{ v: "veg", l: "Veg", e: "🥦" }, { v: "non_veg", l: "Non-veg", e: "🍗" }, { v: "vegan", l: "Vegan", e: "🌱" }, { v: "no_preference", l: "No pref", e: "🍽️" }],
  },
  {
    key: "noise", label: "Noise level?", icon: <Music className="h-4 w-4" />,
    options: [{ v: "quiet", l: "Quiet", e: "🤫" }, { v: "moderate", l: "Moderate", e: "🎵" }, { v: "lively", l: "Lively", e: "🎉" }],
  },
  {
    key: "guests", label: "Guests at home?", icon: <Users className="h-4 w-4" />,
    options: [{ v: "never", l: "Never", e: "🚪" }, { v: "rarely", l: "Rarely", e: "🙋" }, { v: "sometimes", l: "Sometimes", e: "👥" }, { v: "often", l: "Often", e: "🎊" }],
  },
  {
    key: "studying", label: "Where do you study?", icon: <BookOpen className="h-4 w-4" />,
    options: [{ v: "at_home", l: "At home", e: "🏠" }, { v: "library", l: "Library", e: "📚" }, { v: "both", l: "Both", e: "🔄" }],
  },
  {
    key: "pets", label: "Pets?", icon: <Cat className="h-4 w-4" />,
    options: [{ v: "love", l: "Love them", e: "🐾" }, { v: "okay", l: "Fine with it", e: "🙂" }, { v: "allergic", l: "Allergic", e: "🤧" }, { v: "no_preference", l: "No pref", e: "🤷" }],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [budget, setBudget]         = useState<number | null>(null);
  const [lifestyle, setLifestyle]   = useState<Record<string, string>>({});
  const [openToRoommate, setOpenToRoommate] = useState(false);

  const toggleLookingFor = (id: string) =>
    setLookingFor((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLifestyle = async () => {
    localStorage.setItem("cc_prefs", JSON.stringify({ role: "student", lookingFor, budget }));
    localStorage.setItem("cc_onboarded", "1");
    try { await roommateApi.updatePrefs({ ...lifestyle, openToRoommate, lookingFor, budget } as any); } catch {}
    const p = new URLSearchParams();
    if (lookingFor.length === 1) p.set("category", lookingFor[0]);
    if (budget && budget < 999999) p.set("maxPrice", String(budget));
    navigate(`/listings?${p.toString()}`);
  };

  const stepPct  = step === 1 ? "33%" : step === 2 ? "66%" : "100%";
  const stepLabel = step === 1 ? "Account Details" : step === 2 ? "Your Preferences" : "Lifestyle Profile";
  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

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
            {step === 1 ? "Create your free student account." : "Almost done — personalise your experience."}
          </p>
          {/* Owner link — shown on step 1 only */}
          {step === 1 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Listing a property or service?</span>
              <Link to="/register/owner" className="text-xs font-bold text-amber-400 hover:underline">
                Sign up as Owner →
              </Link>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: stepPct }} />
        </div>
        <p className="mb-5 text-xs font-semibold text-primary uppercase tracking-widest text-center">
          Step {step} of 3 — {stepLabel}
        </p>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">

          {/* ═══ STEP 1: Credentials ═══ */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Student Sign Up</h1>
                  <p className="text-xs text-muted-foreground">Find accommodation & services near your campus</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                  <input type="text" required placeholder="Raunak Gupta"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <ArrowRight className="h-4 w-4" />}
                  {loading ? "Creating account…" : "Continue →"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ═══ STEP 2: What are you looking for + Budget ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">What are you looking for?</h1>
                <p className="mt-1 text-sm text-muted-foreground">Pick all that apply — we'll filter listings for you.</p>
              </div>

              {LOOKING_FOR_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.label}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {group.options.map((opt) => (
                      <button key={opt.id} onClick={() => toggleLookingFor(opt.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all ${
                          lookingFor.includes(opt.id) ? "border-primary bg-primary/5" : "border-white/[0.08] hover:border-primary/30 hover:bg-white/[0.03]"
                        }`}>
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-[10px] font-medium text-foreground leading-tight text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Budget</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b.max} onClick={() => setBudget(budget === b.max ? null : b.max)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                        budget === b.max ? "border-primary bg-primary/5 text-primary" : "border-white/[0.08] text-foreground hover:border-primary/30"
                      }`}>{b.label}</button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(3)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                <ArrowRight className="h-4 w-4" /> Continue →
              </button>
              <button onClick={() => setStep(3)} className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors pt-1">
                Skip this step
              </button>
            </div>
          )}

          {/* ═══ STEP 3: Lifestyle ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Your Lifestyle</h1>
                <p className="mt-1 text-sm text-muted-foreground">Powers AI-based roommate matching. Takes ~60 seconds.</p>
              </div>

              {LIFESTYLE_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="text-primary">{q.icon}</span> {q.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button key={opt.v} onClick={() => setLifestyle((p) => ({ ...p, [q.key]: opt.v }))}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                          lifestyle[q.key] === opt.v ? "border-primary bg-primary/10 text-foreground" : "border-white/[0.06] text-muted-foreground hover:border-primary/30 hover:bg-white/[0.03]"
                        }`}>
                        <span className="text-base">{opt.e}</span>
                        <span className="text-xs font-medium leading-tight">{opt.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <input type="checkbox" id="openToRoommate" checked={openToRoommate}
                  onChange={(e) => setOpenToRoommate(e.target.checked)} className="rounded accent-primary" />
                <label htmlFor="openToRoommate" className="text-sm text-foreground cursor-pointer">
                  👥 Show my profile on the Roommate Finder
                </label>
              </div>

              <button onClick={handleLifestyle}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                <UserPlus className="h-4 w-4" /> Done — Show me listings!
              </button>
              <button onClick={() => { localStorage.setItem("cc_onboarded", "1"); navigate("/listings"); }}
                className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors pt-1">
                Skip lifestyle questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
