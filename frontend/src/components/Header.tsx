import { Link, useLocation } from "react-router-dom";
import { MapPin, Menu, X, Crown, Bell, LogIn, LogOut, LayoutDashboard, Plus, Bookmark, Gift, Loader2, ShieldCheck, CheckSquare, Users, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import NotificationBell from "./NotificationBell";

// ── Geolocation hook ──────────────────────────────────────────────────────────
function useUserLocation() {
  const [label, setLabel] = useState<string>("Locating…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("cc_location");
    if (cached) {
      setLabel(cached);
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setLabel("Near Campus");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const place =
            addr.neighbourhood ||
            addr.suburb ||
            addr.village ||
            addr.town ||
            addr.city_district ||
            addr.city ||
            "Near Campus";
          const city = addr.city || addr.town || addr.state_district || "";
          const locationLabel = city && city !== place ? `${place}, ${city}` : place;
          setLabel(locationLabel);
          sessionStorage.setItem("cc_location", locationLabel);
        } catch {
          setLabel("Near Campus");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLabel("Near Campus");
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return { label, loading };
}

// ── Header ────────────────────────────────────────────────────────────────────
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);
  const location                    = useLocation();
  const { user, logout, isPremium } = useAuth();
  const { label: locationLabel, loading: locLoading } = useUserLocation();

  const storedUser = (() => {
    try { const s = localStorage.getItem("cc_user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  })();
  const collegeName = (user as any)?.collegeName || storedUser?.collegeName || "";

  const navItems = [
    { label: "Home",       path: "/" },
    { label: "Listings",   path: "/listings" },
    { label: "Offers",     path: "/partners",             icon: <Gift        className="h-3.5 w-3.5" /> },
    { label: "Saved",      path: "/saved",                icon: <Bookmark    className="h-3.5 w-3.5" /> },
    { label: "Alerts",     path: "/alerts",               icon: <Bell        className="h-3.5 w-3.5" />, authOnly: true },
    { label: "Roommates",  path: "/roommates",            icon: <Users       className="h-3.5 w-3.5" /> },
    { label: "Rentals",    path: "/rentals",              icon: <Package     className="h-3.5 w-3.5" /> },
    { label: "Relocate",   path: "/relocation-checklist", icon: <CheckSquare className="h-3.5 w-3.5" /> },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-foreground group shrink-0">
            <img
              src="/cc-logo.png"
              alt="CampusConnect"
              className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-primary/25 transition-all duration-300 group-hover:shadow-primary/50 group-hover:scale-105"
            />
            <span className="hidden lg:inline text-base">CampusConnect</span>
            <span className="hidden sm:inline lg:hidden text-base">CC</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems
              .filter((item) => !(item as any).authOnly || user)
              .map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white/[0.08] text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}>
                  {item.icon}{item.label}
                </Link>
              ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-1.5 md:flex">

            {/* ── Live location display ── */}
            <button
              onClick={() => {
                sessionStorage.removeItem("cc_location");
                window.location.reload();
              }}
              title="Click to refresh location"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1 max-w-[160px] rounded-lg px-2.5 py-1.5 hover:bg-white/[0.04]"
            >
              {locLoading
                ? <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                : <MapPin  className="h-4 w-4 text-primary shrink-0" />
              }
              <span className="truncate">{locationLabel}</span>
            </button>

            {user ? (
              <>
                {/* Add listing — only owners/admin */}
                {(user.role === "employee" || user.role === "admin") && (
                  <Link to="/listings/new" title="Add Listing"
                    className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
                    <Plus className="h-5 w-5" />
                  </Link>
                )}

                <NotificationBell />

                {/* Dashboard — owners and admin only */}
                {(user.role === "employee" || user.role === "admin") && (
                  <Link to="/dashboard"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive("/dashboard") ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link to="/admin"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive("/admin") ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}>
                    <ShieldCheck className="h-4 w-4" /> Admin
                  </Link>
                )}

                <Link to="/subscription"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isPremium ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}>
                  <Crown className="h-4 w-4" />
                  {isPremium ? "Premium" : "Upgrade"}
                </Link>

                <button onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
                  <LogOut className="h-4 w-4" />
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                </button>
              </>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-lg btn-glow px-5 py-2 text-sm font-semibold text-primary-foreground">
                <LogIn className="h-4 w-4" /> Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-foreground hover:bg-white/[0.04] md:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/[0.06] bg-black/60 backdrop-blur-xl px-4 py-3 md:hidden space-y-1 animate-fade-in-up" style={{ animationDuration: "0.2s" }}>

            {/* Location in mobile */}
            <div className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground">
              {locLoading
                ? <Loader2 className="h-4 w-4 text-primary animate-spin" />
                : <MapPin  className="h-4 w-4 text-primary" />
              }
              <span className="truncate">{locationLabel}</span>
            </div>

            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(item.path) ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {item.icon}{item.label}
              </Link>
            ))}

            {user ? (
              <>
                {(user.role === "employee" || user.role === "admin") && (
                  <Link to="/listings/new" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4" /> Add Listing
                  </Link>
                )}
                {(user.role === "employee" || user.role === "admin") && (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                    <LayoutDashboard className="h-4 w-4" /> Owner Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary">
                    <ShieldCheck className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <Link to="/alerts" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                  <Bell className="h-4 w-4" /> Price Alerts
                </Link>
                <div className="px-3 py-1"><NotificationBell /></div>
                <Link to="/subscription" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                  <Crown className="h-4 w-4" /> {isPremium ? "Premium ✓" : "Upgrade"}
                </Link>
                <button onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" /> Sign Out ({user.name.split(" ")[0]})
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary">
                <LogIn className="h-4 w-4" /> Sign In
              </button>
            )}
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
