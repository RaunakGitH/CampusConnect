// AIPriceFairness.tsx
// Shows a price fairness badge on listing detail page.
// Compares the listing's price against similar listings in the same category.
import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Minus, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { aiApi } from "@/services/api";

interface Props {
  listingId: string;
  priceRange: string;
  category: string;
}

const VERDICT_CONFIG = {
  great: {
    icon: <TrendingDown className="h-4 w-4" />,
    label: "Great Value",
    color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  fair: {
    icon: <Minus className="h-4 w-4" />,
    label: "Fair Price",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  above: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: "Slightly Above Avg",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  high: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: "Above Market",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  neutral: {
    icon: <Minus className="h-4 w-4" />,
    label: "New Listing",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

const AIPriceFairness = ({ listingId, priceRange, category }: Props) => {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched) return;
    setFetched(true);
    setLoading(true);
    aiApi.priceFairness(listingId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground w-fit">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <Sparkles className="h-3 w-3 text-primary" />
        Analyzing price…
      </div>
    );
  }

  if (!data) return null;

  const config = VERDICT_CONFIG[data.verdict as keyof typeof VERDICT_CONFIG] || VERDICT_CONFIG.neutral;

  return (
    <div className={`rounded-xl border px-4 py-3 ${config.color}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
          <span className="text-xs font-semibold">AI Price Analysis</span>
          <span className={`flex h-2 w-2 rounded-full ${config.dot}`} />
          <span className="text-xs font-bold">{config.label}</span>
          {data.percentile !== null && (
            <span className="text-xs opacity-70">· {data.percentile}th percentile</span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 opacity-60 shrink-0" />
          : <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-xs opacity-80">
          <p>{data.reason}</p>
          {data.median && data.avg && (
            <div className="flex gap-4 pt-1">
              <span>Median: <strong>₹{data.median.toLocaleString()}</strong></span>
              <span>Average: <strong>₹{data.avg.toLocaleString()}</strong></span>
              <span>This listing: <strong>₹{data.listingPrice?.toLocaleString()}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPriceFairness;
