import { useState, useRef } from "react";
import { Sparkles, Search, Loader2, X } from "lucide-react";
import { aiApi } from "@/services/api";
import type { Listing } from "@/services/api";

interface Props {
  onResults: (listings: Listing[], query: string) => void;
  onClear: () => void;
}

const EXAMPLES = [
  "AC single room under ₹6000 with meals",
  "2BHK flat within 1km furnished",
  "Girls PG with meals near gate",
  "Cheap mess with 3 meals",
];

const AISmartSearch = ({ onResults, onClear }: Props) => {
  const [query, setQuery]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [active, setActive]       = useState(false);
  const [error, setError]         = useState("");
  const [parsedFilters, setParsed] = useState<Record<string, unknown> | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const search = async (text?: string) => {
    const q = (text || query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError("");
    setParsed(null);
    setActive(true);

    try {
      const result = await aiApi.smartSearch(q);
      setParsed(result.parsedFilters);
      onResults(result.listings, q);
    } catch (err: any) {
      setError("AI search failed. Please try a regular search.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setActive(false);
    setParsed(null);
    setError("");
    onClear();
    inputRef.current?.focus();
  };

  const filterBadges = parsedFilters
    ? Object.entries(parsedFilters)
        .filter(([k, v]) => v !== undefined && v !== null && k !== "search")
        .map(([k, v]) => {
          const labels: Record<string, string> = {
            category: "Category", maxPrice: "Max ₹", maxDistance: "Within km",
            sharingType: "Sharing", mealsIncluded: "Meals incl.", furnished: "Furnished",
            bhk: "BHK", available: "Available",
          };
          return `${labels[k] || k}: ${v}`;
        })
    : [];

  return (
    <div className="w-full">
      {/* Search bar */}
      <div className={`flex items-center gap-2 rounded-xl border-2 bg-card px-3 py-1 transition-all ${
        active ? "border-primary shadow-lg shadow-primary/10" : "border-border"
      }`}>
        <div className="flex items-center gap-1.5 shrink-0">
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
            : <Sparkles className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
          }
          <span className="text-xs font-semibold text-primary hidden sm:inline">AI</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Try: 'AC single room under ₹6000 with meals near gate'"
          className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        {active && (
          <button onClick={clear} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => search()}
          disabled={loading || !query.trim()}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Parsed filter badges */}
      {filterBadges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">AI understood:</span>
          {filterBadges.map((b) => (
            <span key={b} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}

      {/* Example suggestions */}
      {!active && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => search(ex)}
              className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISmartSearch;
