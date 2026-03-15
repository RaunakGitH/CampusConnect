import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: string })?.from || "/";

  const [form, setForm]             = useState({ email: "", password: "" });
  const [showPassword, setShowPw]   = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full rounded-xl glass-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-purple w-[400px] h-[400px] -left-40 top-20" />
      <div className="orb orb-blue w-[300px] h-[300px] -right-20 -bottom-20" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <img src="/cc-logo.png" alt="CampusConnect" className="h-11 w-11 rounded-xl shadow-lg shadow-primary/25 object-cover" />
            CampusConnect
          </Link>
          <p className="mt-2 text-muted-foreground text-sm">Welcome back! Sign in to your account.</p>
        </div>

        <div className="rounded-2xl glass-card glow-border p-8">
          <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Sign In</h1>

          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inp} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inp} pr-10`} />
                <button type="button" onClick={() => setShowPw(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl btn-glow px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                : <LogIn className="h-4 w-4" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">Don't have an account?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/register"
                className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-primary/30 bg-primary/5 px-3 py-3 text-center transition-all hover:border-primary/60 hover:bg-primary/10">
                <span className="text-xl">🎓</span>
                <span className="text-xs font-bold text-primary">Sign up as Student</span>
                <span className="text-[10px] text-muted-foreground">Find rooms & services</span>
              </Link>
              <Link to="/register/owner"
                className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 px-3 py-3 text-center transition-all hover:border-amber-500/60 hover:bg-amber-500/10">
                <span className="text-xl">🏠</span>
                <span className="text-xs font-bold text-amber-400">Sign up as Owner</span>
                <span className="text-[10px] text-muted-foreground">List your property</span>
              </Link>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Demo credentials:</p>
            <p>Student: student@campusconnect.com / Student@1234</p>
            <p>Admin: admin@campusconnect.com / Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
