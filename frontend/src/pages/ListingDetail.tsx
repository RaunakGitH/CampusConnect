import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, Phone, Star, BadgeCheck, Clock, Crown, Share2, Check,
  Maximize2, X, ChevronLeft, ChevronRight, Box, Users,
  UtensilsCrossed, Home, AlertCircle, Send, PlayCircle,
  CheckCircle2, XCircle, Utensils, Package,
} from "lucide-react";
import Header from "@/components/Header";
import QASection from "@/components/QASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookmarkButton from "@/components/BookmarkButton";
import AuthModal from "@/components/AuthModal";
import { listingsApi, reviewsApi } from "@/services/api";
import type { Listing, Review } from "@/services/api";
import { AdSidebar } from "@/components/AdBanner";
import { useAuth } from "@/context/AuthContext";
import AIReviewSummary from "@/components/AIReviewSummary";
import AIPriceFairness from "@/components/AIPriceFairness";
import BookingWidget from "@/components/BookingWidget";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isYouTube = (url: string) =>
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
const ytEmbed = (url: string) => {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};
const isMP4 = (url: string) => /\.mp4(\?|$)/i.test(url);

// ─── Video Player ─────────────────────────────────────────────────────────────
const VideoPlayer = ({ url, title }: { url: string; title: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
        <PlayCircle className="h-5 w-5" />
        ▶ Watch Video Tour
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black">
          <div className="flex h-14 items-center justify-between bg-black/80 px-4">
            <span className="text-sm font-semibold text-white">▶ Video — {title}</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>
          {isMP4(url) ? (
            <video src={url} controls autoPlay className="flex-1 w-full" />
          ) : (
            <iframe src={ytEmbed(url)} title={`Video — ${title}`} className="flex-1 border-0"
              allow="autoplay; fullscreen" allowFullScreen />
          )}
        </div>
      )}
    </>
  );
};

// ─── 3D Tour Viewer ───────────────────────────────────────────────────────────
const TourViewer = ({ url, name }: { url: string; name: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-100">
        <Box className="h-5 w-5" /> 🔮 3D Virtual Tour
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black">
          <div className="flex h-14 items-center justify-between bg-black/80 px-4">
            <span className="text-sm font-semibold text-white">🔮 3D Tour — {name}</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>
          <iframe src={url} title={`3D Tour — ${name}`} className="flex-1 border-0"
            allow="xr-spatial-tracking; vr; fullscreen" allowFullScreen />
        </div>
      )}
    </>
  );
};

// ─── Image Gallery ────────────────────────────────────────────────────────────
const Gallery = ({ images, name }: { images: string[]; name: string }) => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const all = images.filter(Boolean);
  if (all.length <= 1) return null;
  const prev = () => setIdx((i) => (i - 1 + all.length) % all.length);
  const next = () => setIdx((i) => (i + 1) % all.length);
  return (
    <>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {all.slice(0, 6).map((url, i) => (
          <button key={i} onClick={() => { setIdx(i); setOpen(true); }}
            className="shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 border-transparent hover:border-primary/50 transition-all">
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {all.length > 6 && (
          <button onClick={() => { setIdx(6); setOpen(true); }}
            className="shrink-0 h-16 w-24 rounded-lg border border-border bg-muted text-xs text-muted-foreground flex items-center justify-center hover:bg-muted/70">
            +{all.length - 6}
          </button>
        )}
      </div>
      <button onClick={() => { setIdx(0); setOpen(true); }}
        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
        <Maximize2 className="h-3.5 w-3.5" /> View all photos
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90">
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white"><X className="h-7 w-7" /></button>
          <button onClick={prev} className="absolute left-4 text-white p-2"><ChevronLeft className="h-8 w-8" /></button>
          <img src={all[idx]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          <button onClick={next} className="absolute right-4 text-white p-2"><ChevronRight className="h-8 w-8" /></button>
          <p className="absolute bottom-4 text-sm text-gray-400">{idx + 1} / {all.length}</p>
        </div>
      )}
    </>
  );
};

// ─── Star Picker ──────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
        <Star className={`h-6 w-6 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

// ─── Review Form ──────────────────────────────────────────────────────────────
const ReviewForm = ({ listingId, onAdded }: { listingId: string; onAdded: (r: Review, rating: number, count: number) => void }) => {
  const { user } = useAuth();
  const [rating, setRating]     = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) return setError("Please select a star rating.");
    if (!comment.trim()) return setError("Please write a comment.");
    setSubmitting(true);
    try {
      const { review, listingRating, listingReviewCount } = await reviewsApi.create({ listingId, rating, comment: comment.trim() });
      onAdded(review, listingRating, listingReviewCount);
      setRating(0); setComment("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) { setError(e.message || "Failed to submit."); }
    finally { setSubmitting(false); }
  };

  if (!user) return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
      Sign in to leave a review
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h4 className="mb-4 font-display text-base font-semibold text-foreground">Write a Review</h4>
      {success && <div className="mb-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 px-4 py-2 text-sm text-green-700 dark:text-green-400">✅ Review submitted!</div>}
      {error && <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">{error}</div>}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Your Rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea rows={3} placeholder="Share your experience…" value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-4 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
      <button onClick={handleSubmit} disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
        <Send className="h-4 w-4" />
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [authOpen, setAuthOpen]   = useState(false);
  const [copied, setCopied]       = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.name, text: listing?.description, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      listingsApi.getById(id),
      reviewsApi.getByListing(id),
    ]).then(([{ listing: l }, { reviews: r }]) => {
      setListing(l); setReviews(r);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContactClick = () => {
    if (listing) listingsApi.recordContactClick(listing.id);
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <div className="mb-6 h-5 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 md:h-80 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
            <div className="mt-6 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-36 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (notFound || !listing) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Listing not found.</p>
        <Link to="/listings" className="mt-4 inline-block text-primary hover:underline">← Back to listings</Link>
      </div>
    </div>
  );

  const allImages = [listing.image, ...(listing.mediaUrls || [])].filter(Boolean) as string[];
  const videos = (listing.videoUrls || []).filter(Boolean);
  const isMess = listing.category === "mess";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/listings" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Main ── */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl">
              <img src={listing.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop"}
                alt={listing.name} className="h-64 w-full object-cover md:h-80" />
            </div>

            {/* Media bar */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Gallery images={allImages} name={listing.name} />
              {videos.map((v, i) => <VideoPlayer key={i} url={v} title={listing.name} />)}
              {listing.has3DTour && listing.tourUrl && <TourViewer url={listing.tourUrl} name={listing.name} />}
            </div>

            <div className="mt-6">
              {/* Title + badges */}
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{listing.name}</h1>
                {listing.verified && (
                  <span className="mt-1 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
                {listing.isFeatured && (
                  <span className="mt-1 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    <Crown className="h-3 w-3" /> Featured
                  </span>
                )}
                {/* Share button — correctly placed in title row */}
                <button
                  onClick={handleShare}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Share2 className="h-3.5 w-3.5" /> Share</>}
                </button>

                {/* Availability badge */}
                {listing.isAvailable !== undefined && (
                  listing.isAvailable ? (
                    <span className="mt-1 flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {listing.availableRooms != null ? `${listing.availableRooms} rooms available` : "Available"}
                    </span>
                  ) : (
                    <span className="mt-1 flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                      <XCircle className="h-3 w-3" /> Full
                    </span>
                  )
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.address}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {listing.distance} km from campus</span>
              </div>

              {/* Accommodation detail chips */}
              {(listing.sharingType || listing.bhk || listing.mealsIncluded || listing.capacity) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.sharingType && (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Users className="h-3.5 w-3.5" /> {listing.sharingType}
                    </span>
                  )}
                  {listing.bhk && (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Home className="h-3.5 w-3.5" /> {listing.bhk} · {listing.furnished || "unfurnished"}
                    </span>
                  )}
                  {listing.mealsIncluded && (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                      <UtensilsCrossed className="h-3.5 w-3.5" /> Meals included
                    </span>
                  )}
                  {listing.capacity != null && (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Users className="h-3.5 w-3.5" /> Capacity: {listing.capacity}
                    </span>
                  )}
                </div>
              )}

              {/* Mess-specific details */}
              {isMess && (listing.monthlyPackage || listing.perMealRate || listing.mealsPerDay) && (
                <div className="mt-5 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-orange-500" /> Mess Pricing
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {listing.monthlyPackage != null && (
                      <div>
                        <p className="text-lg font-bold text-foreground">₹{listing.monthlyPackage.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Package className="h-3 w-3" /> Monthly</p>
                      </div>
                    )}
                    {listing.perMealRate != null && (
                      <div>
                        <p className="text-lg font-bold text-foreground">₹{listing.perMealRate}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Utensils className="h-3 w-3" /> Per meal</p>
                      </div>
                    )}
                    {listing.mealsPerDay != null && (
                      <div>
                        <p className="text-lg font-bold text-foreground">{listing.mealsPerDay}×</p>
                        <p className="text-xs text-muted-foreground">Meals/day</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="mt-5 leading-relaxed text-foreground">{listing.description}</p>

              {/* Amenities */}
              <div className="mt-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="rounded-full border border-border bg-muted px-3 py-1 text-sm">{a}</span>
                  ))}
                </div>
              </div>

              {/* Rules */}
              {listing.rules && listing.rules.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-foreground">House Rules</h3>
                  <ul className="space-y-1.5">
                    {listing.rules.map((r) => (
                      <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews */}
              <div className="mt-8">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                  Reviews ({listing.reviewCount})
                </h3>
                <AIReviewSummary listingId={listing.id} reviewCount={listing.reviewCount} />
                <div className="mb-6">
                  <ReviewForm listingId={listing.id} onAdded={(r, newRating, newCount) => {
                    setReviews((prev) => [r, ...prev]);
                    setListing((prev) => prev ? { ...prev, rating: newRating, reviewCount: newCount } : prev);
                  }} />
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{review.userName}</span>
                          <span className="flex items-center gap-0.5 text-sm text-primary">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-primary" />)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-xl font-bold text-foreground">{listing.rating > 0 ? listing.rating : "New"}</span>
                  <span className="text-sm text-muted-foreground">({listing.reviewCount} reviews)</span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-display text-lg font-semibold text-foreground">{listing.priceRange}</p>
                </div>
                <div className="mb-4">
                  <AIPriceFairness
                    listingId={listing.id}
                    priceRange={listing.priceRange}
                    category={listing.category}
                  />
                </div>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <WhatsAppButton
                    contact={listing.contact}
                    listingName={listing.name}
                    listingId={listing.id}
                    size="md"
                    onContact={handleContactClick}
                  />
                  <a href={`tel:${listing.contact}`} onClick={handleContactClick}
                    className="flex items-center gap-2 font-medium text-primary hover:underline">
                    <Phone className="h-4 w-4" />{listing.contact}
                  </a>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  Get Directions
                </a>
              </div>

              {/* Booking widget — always shown, adapts per category */}
              <BookingWidget
                listingId={listing.id}
                listingName={listing.name}
                category={listing.category}
                priceRange={listing.priceRange}
                bookingEnabled={true}
                bookingPrice={listing.bookingPrice}
                onAuthRequired={() => setAuthOpen(true)}
              />

              {/* Availability card */}
              {listing.isAvailable !== undefined && (
                <div className={`rounded-xl border p-4 text-center ${
                  listing.isAvailable
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                    : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                }`}>
                  {listing.isAvailable ? (
                    <>
                      <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {listing.availableRooms != null ? `${listing.availableRooms} Rooms Available` : "Available Now"}
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="mx-auto mb-1 h-5 w-5 text-red-600" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Currently Full</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Check back later or set a price alert</p>
                    </>
                  )}
                </div>
              )}

              {listing.subscriptionPlan === "special" && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <Crown className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-primary">Premium Listed</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Priority placement</p>
                </div>
              )}

              {/* Sponsored ad */}
              <AdSidebar />
            </div>
          </div>
        </div>
        <QASection
          listingId={listing.id}
          listingOwnerId={listing.createdBy}
          onAuthRequired={() => setAuthOpen(true)}
        />
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default ListingDetail;