// frontend/src/components/CollegeSelector.tsx
// Used in: AuthModal (on register), Dashboard (profile section)

import { useState, useEffect, useRef } from "react";
import { GraduationCap, Search, Check, ChevronDown, Loader2 } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface College { _id: string; name: string; shortName: string; city: string; state: string; }

interface Props {
  value?: string;         // college _id
  displayValue?: string;  // college name for display
  onChange: (college: College) => void;
  placeholder?: string;
}

const CollegeSelector = ({ value, displayValue, onChange, placeholder = "Search your college..." }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load colleges on open or search change
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`${BASE}/colleges${q}`)
      .then((r) => r.json())
      .then((d) => setColleges(d.data?.colleges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, search]);

  const handleSelect = (c: College) => {
    onChange(c);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors"
      >
        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
        <span className={`flex-1 truncate ${displayValue ? "text-foreground" : "text-muted-foreground"}`}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : colleges.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {search ? "No colleges found. Try a different name." : "No colleges available."}
              </p>
            ) : (
              colleges.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {(c.shortName || c.name)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.city}, {c.state}</p>
                  </div>
                  {value === c._id && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeSelector;
