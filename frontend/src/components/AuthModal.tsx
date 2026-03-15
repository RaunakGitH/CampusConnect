import { useState, useEffect } from "react";
import { X, Eye, EyeOff, GraduationCap, Building2, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CollegeSelector from "./CollegeSelector";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

interface Props { open: boolean; onClose: () => void; }

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string; scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const LOOKING_FOR = [
  { id: "hostel",       icon: "🏠", label: "Hostel" },
  { id: "pg",           icon: "🛋️", label: "PG" },
  { id: "flat",         icon: "🏢", label: "Flat" },
  { id: "mess",         icon: "🍛", label: "Mess" },
  { id: "tiffin",       icon: "🥡", label: "Tiffin" },
  { id: "laundry",      icon: "👕", label: "Laundry" },
  { id: "wifi",         icon: "📶", label: "WiFi" },
  { id: "movers_packers", icon: "📦", label: "Movers" },
];

const BUDGETS = [
  { label: "< ₹3k",  max: 3000   },
  { label: "₹3–6k",  max: 6000   },
  { label: "₹6–10k", max: 10000  },
  { label: "₹10k+",  max: 999999 },
];

type ModalMode = "login" | "choice" | "student" | "owner" | "student-prefs" | "owner-done";

const AuthModal = ({ open, onClose }: Props) => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]           = useState<ModalMode>("login");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState("");
  const [college, setCollege]     = useState<{ _id: string; name: string } | null>(null);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [budget, setBudget]         = useState<number | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById("google-gsi")) return;
    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  if (!open) return null;

  const reset = () => {
    setMode("login"); setName(""); setEmail(""); setPassword("");
    setError(""); setCollege(null); setLookingFor([]); setBudget(null);
  };
  const handleClose = () => { reset(); onClose(); };

  const inp = "w-full rounded-xl glass-input px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground";

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields."); return; }
    setLoading(true);
    try { await login(email, password); handleClose(); }
    catch (e: any) { setError(e.message || "Login failed."); }
    finally { setLoading(false); }
  };

  const handleStudentRegister = async () => {
    setError("");
    if (!name || !email || !password) { setError("Please fill all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      if (college) {
        const token = localStorage.getItem("cc_token");
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/colleges/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ collegeId: college._id }),
        }).catch(() => {});
      }
      setMode("student-prefs");
    } catch (e: any) { setError(e.message || "Registration failed."); }
    finally { setLoading(false); }
  };

  const handlePrefsDone = () => {
    localStorage.setItem("cc_prefs", JSON.stringify({ role: "student", lookingFor, budget }));
    localStorage.setItem("cc_onboarded", "1");
    handleClose();
    const p = new URLSearchParams();
    if (lookingFor.length === 1) p.set("category", lookingFor[0]);
    if (budget && budget < 999999) p.set("maxPrice", String(budget));
    navigate(`/listings?${p.toString()}`);
  };

  const handleOwnerRegister = async () => {
    setError("");
    if (!name || !email || !password) { setError("Please fill all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      try { await authApi.setOwnerRole(); } catch {}
      localStorage.setItem("cc_prefs", JSON.stringify({ role: "owner" }));
      localStorage.setItem("cc_onboarded", "1");
      setMode("owner-done");
    } catch (e: any) { setError(e.message || "Registration failed."); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) { setError("Google login not configured."); return; }
    if (!window.google) { setError("Google SDK not loaded yet."); return; }
    setGoogleLoading(true); setError("");
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: "openid email profile",
      callback: async (resp) => {
        if (resp.error || !resp.access_token) {
          setError("Google sign-in cancelled."); setGoogleLoading(false); return;
        }
        try { await loginWithGoogle(resp.access_token); handleClose(); }
        catch (e: any) { setError(e.message || "Google sign-in failed."); }
        finally { setGoogleLoading(false); }
      },
    });
    client.requestAccessToken();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl glass-card shadow-2xl glow-border animate-scale-in"
        style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all">
          <X className="h-5 w-5" />
        </button>

        <div className="p-7">

          {/* ════ LOGIN ════ */}
          {mode === "login" && (<>
            <h2 className="mb-1 font-display text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mb-6 text-sm text-muted-foreground">Sign in to access all features.</p>
            {error && <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">{error}</div>}
            <button onClick={handleGoogle} disabled={googleLoading || loading}
              className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-medium text-foreground hover:bg-white/[0.06] disabled:opacity-60 transition-all">
              {googleLoading ? <span className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin" /> :
                <svg className="h-5 w-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.16 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.5-1.45-.79-3-.79-4.59s.29-3.14.79-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/></svg>}
              Continue with Google
            </button>
            <div className="mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.06]"/><span className="text-xs text-muted-foreground">or with email</span><div className="h-px flex-1 bg-white/[0.06]"/></div>
            <div className="space-y-3">
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label><input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative"><input type={showPw?"text":"password"} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&handleLogin()} className={`${inp} pr-10`}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                </div>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading} className="mt-5 w-full rounded-xl btn-glow py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <p className="mt-4 text-center text-sm text-muted-foreground">New to CampusConnect?{" "}
              <button onClick={() => {setMode("choice");setError("");}} className="font-semibold text-primary hover:underline">Create account</button></p>
          </>)}

          {/* ════ CHOICE ════ */}
          {mode === "choice" && (<>
            <h2 className="mb-1 font-display text-2xl font-bold text-foreground">Join CampusConnect</h2>
            <p className="mb-6 text-sm text-muted-foreground">How would you like to sign up?</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => {setMode("student");setError("");}}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center hover:border-primary/60 hover:bg-primary/10 transition-all group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 group-hover:bg-primary/25 transition-all">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">Student</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Find rooms, food & services near campus</p>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">FREE</span>
              </button>
              <button onClick={() => {setMode("owner");setError("");}}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-5 text-center hover:border-amber-500/60 hover:bg-amber-500/10 transition-all group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 transition-all">
                  <Building2 className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">Owner</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">List your property or service</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded-full px-2.5 py-0.5">FROM ₹299</span>
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">Already have an account?{" "}
              <button onClick={() => {setMode("login");setError("");}} className="font-semibold text-primary hover:underline">Sign in</button></p>
          </>)}

          {/* ════ STUDENT / OWNER FORM ════ */}
          {(mode === "student" || mode === "owner") && (<>
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setMode("choice")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${mode==="student"?"bg-primary/15":"bg-amber-500/15"}`}>
                {mode==="student" ? <GraduationCap className="h-4 w-4 text-primary"/> : <Building2 className="h-4 w-4 text-amber-400"/>}
              </div>
              <div>
                <p className="font-display text-base font-bold text-foreground">{mode==="student"?"Student Sign Up":"Owner Sign Up"}</p>
                <p className="text-[11px] text-muted-foreground">{mode==="student"?"Free forever · Preferences after signup":"From ₹299/month · Dashboard after signup"}</p>
              </div>
            </div>
            {error && <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">{error}</div>}
            <button onClick={handleGoogle} disabled={googleLoading || loading}
              className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-medium text-foreground hover:bg-white/[0.06] disabled:opacity-60 transition-all">
              {googleLoading ? <span className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin"/> :
                <svg className="h-5 w-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.16 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.5-1.45-.79-3-.79-4.59s.29-3.14.79-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/></svg>}
              Continue with Google
            </button>
            <div className="mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.06]"/><span className="text-xs text-muted-foreground">or with email</span><div className="h-px flex-1 bg-white/[0.06]"/></div>
            <div className="space-y-3">
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">{mode==="owner"?"Full Name / Business Name":"Full Name"}</label>
                <input type="text" placeholder={mode==="owner"?"Sunrise Hostel / Raj Kumar":"Your name"} value={name} onChange={(e)=>setName(e.target.value)} className={inp}/></div>
              {mode === "student" && (
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your College (optional)</label>
                  <CollegeSelector value={college?._id} displayValue={college?.name} onChange={(c)=>setCollege(c)} placeholder="Search your college..."/></div>
              )}
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className={inp}/></div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative"><input type={showPw?"text":"password"} placeholder="Min. 6 characters" value={password} onChange={(e)=>setPassword(e.target.value)} className={`${inp} pr-10`}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                </div></div>
            </div>
            <button onClick={mode==="student"?handleStudentRegister:handleOwnerRegister} disabled={loading}
              className="mt-5 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition-all hover:opacity-90"
              style={mode==="owner"?{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 4px 20px rgba(245,158,11,0.3)"}:{background:"linear-gradient(135deg,hsl(265 85% 60%),hsl(220 70% 55%))",boxShadow:"0 4px 20px hsl(265 85% 60% / 0.3)"}}>
              {loading?"Creating account…":mode==="student"?"Create Student Account →":"Create Owner Account →"}
            </button>
            <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account?{" "}
              <button onClick={()=>{setMode("login");setError("");}} className="font-semibold text-primary hover:underline">Sign in</button></p>
          </>)}

          {/* ════ STUDENT PREFERENCES ════ */}
          {mode === "student-prefs" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                  <CheckCircle className="h-6 w-6 text-green-400"/>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Account Created! 🎉</h2>
                  <p className="text-xs text-muted-foreground">Quick — what are you looking for?</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">I need… <span className="normal-case font-normal">(pick all that apply)</span></p>
                <div className="grid grid-cols-4 gap-2">
                  {LOOKING_FOR.map((opt) => (
                    <button key={opt.id} onClick={()=>setLookingFor((p)=>p.includes(opt.id)?p.filter((x)=>x!==opt.id):[...p,opt.id])}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${lookingFor.includes(opt.id)?"border-primary bg-primary/5":"border-white/[0.08] hover:border-primary/30"}`}>
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-[10px] font-medium text-foreground leading-tight text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Budget</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b.max} onClick={()=>setBudget(budget===b.max?null:b.max)}
                      className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${budget===b.max?"border-primary bg-primary/5 text-primary":"border-white/[0.08] text-foreground hover:border-primary/30"}`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handlePrefsDone} className="flex w-full items-center justify-center gap-2 rounded-xl btn-glow py-3 text-sm font-bold text-primary-foreground">
                <ArrowRight className="h-4 w-4"/> Show me listings!
              </button>
              <button onClick={()=>{handleClose();navigate("/listings");}} className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* ════ OWNER SUCCESS ════ */}
          {mode === "owner-done" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <CheckCircle className="h-9 w-9 text-green-400"/>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">You're in! 🎉</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Your owner account is ready. Go to your Dashboard to start listing, or subscribe to a plan first.</p>
              </div>
              <div className="text-left text-xs text-muted-foreground rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 space-y-1">
                <p className="font-semibold text-amber-400">What's next:</p>
                <p>1. Choose a plan (Basic ₹299/mo or Yearly ₹3,000)</p>
                <p>2. Add your first listing in the Dashboard</p>
                <p>3. Start receiving enquiries from students</p>
              </div>
              <div className="space-y-2">
                <button onClick={()=>{handleClose();navigate("/dashboard");}}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
                  style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 4px 20px rgba(245,158,11,0.25)"}}>
                  <Building2 className="h-4 w-4"/> Go to Dashboard
                </button>
                <button onClick={()=>{handleClose();navigate("/subscription?tab=owner");}}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-all">
                  View Plans & Subscribe →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
