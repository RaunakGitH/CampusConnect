import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare, Square, Sparkles, Loader2, MapPin,
  Calendar, Home, ArrowRight, ExternalLink, RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import { aiApi } from "@/services/api";

type Priority = "high" | "medium" | "low";
interface ChecklistItem {
  task: string;
  category: string;
  priority: Priority;
  tip: string;
  available_on_platform: boolean;
}

const PRIORITY_COLOR: Record<Priority, string> = {
  high:   "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  low:    "bg-muted text-muted-foreground",
};

const CATEGORIES_OPTIONS = [
  { id: "hostel", label: "🏠 Hostel" },
  { id: "pg",     label: "🏡 PG" },
  { id: "flat",   label: "🏢 Flat" },
  { id: "mess",   label: "🍽 Mess" },
  { id: "",       label: "🔍 Not sure yet" },
];

const RelocationChecklist = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields
  const [city, setCity]         = useState("");
  const [college, setCollege]   = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [category, setCategory] = useState("");

  // Result
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [cityName, setCityName]   = useState("");
  const [checked, setChecked]     = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!city && !college) { setError("Please enter your destination city or college name."); return; }
    setError("");
    setLoading(true);
    try {
      const { checklist: items, city: c } = await aiApi.relocationChecklist({ city, college, moveDate, category });
      setChecklist(items);
      setCityName(c);
      setChecked(new Set());
      setStep("result");
    } catch (e: any) {
      setError(e.message || "Failed to generate checklist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const doneCount    = checked.size;
  const totalCount   = checklist.length;
  const progress     = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const highPriority = checklist.filter((i) => i.priority === "high" && !checked.has(checklist.indexOf(i)));

  const inp = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10 max-w-2xl">

        {step === "form" && (
          <div className="animate-fade-in-up">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                AI Relocation Checklist
              </h1>
              <p className="mt-2 text-muted-foreground">
                Tell us where you're moving — we'll generate a personalised moving checklist powered by AI.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 space-y-5 shadow-[var(--shadow-card)]">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> Destination City *
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur, Pune, Bangalore…"
                  className={inp}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-primary" /> College / Institution (optional)
                </label>
                <input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT Jodhpur, BITS Pilani…"
                  className={inp}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> Moving Date (optional)
                </label>
                <input
                  type="month"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  What are you looking for?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {CATEGORIES_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`rounded-xl border-2 px-2 py-2.5 text-xs font-medium transition-all text-center ${
                        category === c.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || (!city && !college)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating checklist…</>
                  : <><Sparkles className="h-4 w-4" /> Generate My Checklist</>
                }
              </button>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="animate-fade-in-up">
            {/* Result header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Relocation Checklist
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Moving to <span className="font-semibold text-foreground">{cityName}</span>
                  {college && ` · ${college}`}
                </p>
              </div>
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" /> New
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {doneCount} of {totalCount} tasks done
                </span>
                <span className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-primary"}`}>
                  {progress}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <p className="mt-2 text-xs text-green-600 font-medium text-center">
                  🎉 You're all set for your move!
                </p>
              )}
            </div>

            {/* Urgent items callout */}
            {highPriority.length > 0 && (
              <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  🔴 {highPriority.length} high-priority task{highPriority.length > 1 ? "s" : ""} remaining
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {highPriority.slice(0, 2).map((i) => i.task).join(" · ")}
                  {highPriority.length > 2 && ` + ${highPriority.length - 2} more`}
                </p>
              </div>
            )}

            {/* Checklist items */}
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`rounded-2xl border bg-card p-4 cursor-pointer transition-all hover:shadow-sm ${
                    checked.has(i)
                      ? "opacity-60 border-border"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 transition-colors ${checked.has(i) ? "text-green-500" : "text-muted-foreground"}`}>
                      {checked.has(i)
                        ? <CheckSquare className="h-5 w-5" />
                        : <Square className="h-5 w-5" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${checked.has(i) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.task}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLOR[item.priority as Priority] || PRIORITY_COLOR.low}`}>
                          {item.priority}
                        </span>
                        {item.available_on_platform && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> On CampusConnect
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.tip}</p>

                      {item.available_on_platform && !checked.has(i) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/listings?category=${item.category}`); }}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Find on CampusConnect <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="font-display font-semibold text-foreground mb-1">
                Ready to find your accommodation?
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Browse broker-free listings near your campus
              </p>
              <button
                onClick={() => navigate(`/listings${category ? `?category=${category}` : ""}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Browse Listings <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelocationChecklist;
