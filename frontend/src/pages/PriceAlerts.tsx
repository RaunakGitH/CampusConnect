import { useEffect, useState } from "react";
import { Bell, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { alertsApi, PriceAlert, Listing } from "@/services/api";
import { categories } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

interface AlertMatch { alert: PriceAlert; listings: Listing[] }

const PriceAlerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [matches, setMatches] = useState<AlertMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // New alert form
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    alertsApi.getAll()
      .then(({ alerts }) => setAlerts(alerts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!category || !maxPrice) return alert("Please fill category and max price.");
    setCreating(true);
    try {
      const { alert } = await alertsApi.create({ category, maxPrice: Number(maxPrice), location });
      setAlerts((prev) => [alert, ...prev]);
      setCategory(""); setMaxPrice(""); setLocation("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await alertsApi.delete(id);
    setAlerts((prev) => prev.filter((a) => a._id !== id));
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const { matches: m } = await alertsApi.check();
      setMatches(m);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-7 w-7 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">Price Alerts</h1>
        </div>
        <p className="mb-8 text-muted-foreground">
          Set a budget and we'll find listings that match. Click "Check Now" to see current matches.
        </p>

        {/* Create alert form */}
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Create New Alert</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 8000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Location (optional)</label>
              <input
                type="text"
                placeholder="e.g. MG Road"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating..." : "Create Alert"}
          </button>
        </div>

        {/* Active alerts */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading alerts...</p>
        ) : alerts.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Your Alerts ({alerts.length})</h2>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
              >
                {checking ? "Checking..." : "Check Now"}
              </button>
            </div>
            <div className="space-y-3 mb-8">
              {alerts.map((alert) => (
                <div key={alert._id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {categories.find((c) => c.id === alert.category)?.icon} {alert.category.replace("_", " ")}
                    </span>
                    <span className="ml-3 text-sm text-muted-foreground">≤ ₹{alert.maxPrice.toLocaleString()}</span>
                    {alert.location && <span className="ml-2 text-xs text-muted-foreground">· {alert.location}</span>}
                  </div>
                  <button onClick={() => handleDelete(alert._id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No active alerts. Create your first one above!</p>
        )}

        {/* Matches */}
        {matches.length > 0 && (
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Matching Listings
            </h2>
            <div className="space-y-4">
              {matches.map(({ alert, listings }, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Alert: {alert.category.replace("_", " ")} ≤ ₹{alert.maxPrice.toLocaleString()}
                    {alert.location && ` · ${alert.location}`}
                  </p>
                  <div className="space-y-2">
                    {listings.map((l) => (
                      <Link
                        key={l.id}
                        to={`/listing/${l.id}`}
                        className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 hover:bg-muted/80 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">{l.name}</span>
                        <span className="text-sm text-primary font-semibold">{l.priceRange}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && !checking && alerts.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click "Check Now" to see listings matching your alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;
