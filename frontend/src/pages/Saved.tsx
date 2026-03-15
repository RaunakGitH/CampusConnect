// frontend/src/pages/Saved.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { savedApi } from "@/services/api";
import type { Listing } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Saved = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    savedApi.getAll()
      .then(({ listings: l }) => setListings(l))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Saved Listings</h1>
            <p className="text-sm text-muted-foreground">Your bookmarked places</p>
          </div>
        </div>

        {!user ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-border">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display font-semibold text-foreground mb-1">Sign in to see saved listings</p>
            <p className="text-sm text-muted-foreground">Bookmark listings to revisit them later.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-border">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display font-semibold text-foreground mb-1">No saved listings yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Hit the bookmark icon on any listing to save it here.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{listings.length} saved listing{listings.length !== 1 ? "s" : ""}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Saved;
