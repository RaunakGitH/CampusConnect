import { useState, useEffect } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { aiApi } from "@/services/api";

interface Props {
  listingId: string;
  reviewCount: number;
}

const AIReviewSummary = ({ listingId, reviewCount }: Props) => {
  const [summary, setSummary]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [fetched, setFetched]   = useState(false);

  useEffect(() => {
    if (reviewCount < 3 || fetched) return;
    setLoading(true);
    setFetched(true);
    aiApi.reviewSummary(listingId)
      .then(({ summary: s }) => setSummary(s))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [listingId, reviewCount]);

  if (reviewCount < 3) return null;
  if (!loading && !summary) return null;

  return (
    <div className="mb-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary">AI Review Summary</span>
          <span className="text-xs text-muted-foreground">· {reviewCount} reviews</span>
        </div>
        {summary && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Summarizing {reviewCount} reviews…
        </div>
      ) : expanded && summary ? (
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
      ) : null}
    </div>
  );
};

export default AIReviewSummary;
