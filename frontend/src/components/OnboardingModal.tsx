// OnboardingModal.tsx — 3-step onboarding for first-time users (homepage visitors)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, GraduationCap, Building2, Search, IndianRupee } from "lucide-react";

const CATEGORY_GROUPS = [
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
      { id: "mess",   label: "Mess",        icon: "🍛" },
      { id: "tiffin", label: "Tiffin",      icon: "🥡" },
      { id: "food",   label: "Food / Café", icon: "🍕" },
      { id: "cook",   label: "Private Cook",icon: "👨‍🍳" },
    ],
  },
  {
    label: "Services",
    options: [
      { id: "laundry",        label: "Laundry",          icon: "👕" },
      { id: "movers_packers", label: "Movers & Packers", icon: "📦" },
      { id: "transport",      label: "Transport",        icon: "🚌" },
      { id: "wifi",           label: "WiFi",             icon: "📶" },
      { id: "medical",        label: "Medical",          icon: "💊" },
    ],
  },
];

const BUDGETS = [
  { label: "Under ₹3,000",  max: 3000 },
  { label: "₹3–6k",         max: 6000 },
  { label: "₹6–10k",        max: 10000 },
  { label: "₹10k+",         max: 999999 },
];

interface Props {
  onClose: () => void;
}

const OnboardingModal = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [role, setRole]         = useState<"student" | "owner" | "">("");
  const [category, setCategory] = useState("");
  const [budget, setBudget]     = useState<number | null>(null);

  const handleDone = () => {
    localStorage.setItem("cc_onboarded", "1");
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (budget && budget < 999999) params.set("maxPrice", String(budget));
    navigate(`/listings?${params.toString()}`);
    onClose();
  };

  const skip = () => {
    localStorage.setItem("cc_onboarded", "1");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl glass-card shadow-2xl overflow-hidden glow-border animate-scale-in">

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Close */}
        <button onClick={skip} className="absolute right-4 top-5 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="p-7">
          {/* Step indicator */}
          <p className="mb-1 text-xs font-semibold text-primary uppercase tracking-widest">
            Step {step} of 3
          </p>

          {/* ── Step 1: Who are you? ── */}
          {step === 1 && (
            <>
              <h2 className="mb-1 font-display text-2xl font-bold text-foreground">Welcome to CampusConnect! 👋</h2>
              <p className="mb-6 text-sm text-muted-foreground">Let's personalise your experience. Who are you?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setRole("student"); setStep(2); }}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all hover:border-primary/50 ${role === "student" ? "border-primary bg-primary/5" : "border-white/[0.06] hover:bg-white/[0.03]"}`}
                >
                  <GraduationCap className="h-10 w-10 text-primary" />
                  <div className="text-center">
                    <p className="font-display font-bold text-foreground">Student</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Finding accommodation & services</p>
                  </div>
                </button>
                <button
                  onClick={() => { setRole("owner"); localStorage.setItem("cc_onboarded", "1"); navigate("/subscription"); onClose(); }}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all hover:border-primary/50 ${role === "owner" ? "border-primary bg-primary/5" : "border-white/[0.06] hover:bg-white/[0.03]"}`}
                >
                  <Building2 className="h-10 w-10 text-primary" />
                  <div className="text-center">
                    <p className="font-display font-bold text-foreground">Owner</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Listing my property or service</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: What are you looking for? (grouped) ── */}
          {step === 2 && (
            <>
              <h2 className="mb-1 font-display text-xl font-bold text-foreground">What are you looking for?</h2>
              <p className="mb-4 text-sm text-muted-foreground">Select your primary need.</p>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {group.options.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition-all ${
                            category === cat.id ? "border-primary bg-primary/5" : "border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-[10px] font-medium text-foreground leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!category}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-glow py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Budget ── */}
          {step === 3 && (
            <>
              <h2 className="mb-1 font-display text-2xl font-bold text-foreground">What's your budget?</h2>
              <p className="mb-5 text-sm text-muted-foreground">We'll show you listings in your range.</p>
              <div className="grid grid-cols-2 gap-3">
                {BUDGETS.map((b) => (
                  <button
                    key={b.max}
                    onClick={() => setBudget(b.max)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                      budget === b.max ? "border-primary bg-primary/5 text-primary" : "border-white/[0.06] text-foreground hover:border-primary/30 hover:bg-white/[0.03]"
                    }`}
                  >
                    <IndianRupee className="h-3.5 w-3.5 inline mr-0.5" />
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
                  Back
                </button>
                <button
                  onClick={handleDone}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-glow py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <Search className="h-4 w-4" /> Show me listings!
                </button>
              </div>
            </>
          )}

          {/* Skip */}
          {step !== 1 && (
            <button onClick={skip} className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
