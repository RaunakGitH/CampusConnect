import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { savedApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Props {
  listingId: string;
  initialSaved?: boolean;
  size?: "sm" | "md";
  onAuthRequired?: () => void;
}

const BookmarkButton = ({ listingId, initialSaved = false, size = "md", onAuthRequired }: Props) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  // Sync from localStorage for instant UI (before API confirms)
  useEffect(() => {
    const stored = localStorage.getItem("cc_saved");
    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        setSaved(ids.includes(listingId));
      } catch { /* ignore */ }
    }
  }, [listingId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    if (loading) return;

    // Optimistic update
    const next = !saved;
    setSaved(next);

    // Update localStorage immediately
    try {
      const stored = localStorage.getItem("cc_saved");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      const updated = next ? [...ids, listingId] : ids.filter((id) => id !== listingId);
      localStorage.setItem("cc_saved", JSON.stringify(updated));
    } catch { /* ignore */ }

    setLoading(true);
    try {
      const { saved: serverSaved } = await savedApi.toggle(listingId);
      setSaved(serverSaved);
    } catch {
      setSaved(!next); // revert on error
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove bookmark" : "Save listing"}
      className={`
        flex items-center justify-center rounded-full
        ${btnSize}
        ${saved
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground"
        }
        transition-all duration-200 hover:scale-110 active:scale-95
        disabled:opacity-60
      `}
    >
      {saved
        ? <BookmarkCheck className={iconSize} />
        : <Bookmark className={iconSize} />
      }
    </button>
  );
};

export default BookmarkButton;
