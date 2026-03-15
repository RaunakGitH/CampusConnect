import { Link } from "react-router-dom";
import { MapPin, Star, BadgeCheck, Crown } from "lucide-react";
import type { Listing } from "@/services/api";
import BookmarkButton from "./BookmarkButton";
import { useState } from "react";
import AuthModal from "./AuthModal";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Link
        to={`/listing/${listing.id}`}
        className="group overflow-hidden rounded-2xl glass-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={listing.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"}
            alt={listing.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-1.5">
            {listing.verified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-300">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            {listing.isFeatured && (
              <span className="flex items-center gap-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <Crown className="h-3 w-3" /> Featured
              </span>
            )}
          </div>
          {/* Bookmark button — top right */}
          <div className="absolute right-3 top-3">
            <BookmarkButton
              listingId={listing.id}
              size="sm"
              onAuthRequired={() => setAuthOpen(true)}
            />
          </div>

          {/* Price overlay on image */}
          <div className="absolute bottom-3 left-3">
            <span className="text-sm font-bold text-white drop-shadow-lg">{listing.priceRange}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {listing.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              <Star className="h-3 w-3 fill-primary" />
              {listing.rating || "New"}
            </span>
          </div>
          <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {listing.distance} km away
          </p>
          {listing.sharingType && (
            <p className="mb-1 text-xs text-muted-foreground">Sharing: {listing.sharingType}</p>
          )}
          {listing.bhk && (
            <p className="mb-1 text-xs text-muted-foreground">{listing.bhk} · {listing.furnished || "unfurnished"}</p>
          )}
          {listing.has3DTour && (
            <span className="mb-2 inline-block rounded-full bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 text-xs font-medium text-secondary">
              🔮 3D Tour
            </span>
          )}
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{listing.reviewCount} reviews</span>
          </div>
        </div>
      </Link>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default ListingCard;
