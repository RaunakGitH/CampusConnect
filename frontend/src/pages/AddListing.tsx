import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, Box, Crown, Sparkles, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { listingsApi, aiApi, uploadApi } from "@/services/api";
import type { Category } from "@/services/api";
import { categories } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const FIELDS_BY_CATEGORY: Record<string, string[]> = {
  hostel: ["sharingType", "capacity", "mealsIncluded", "rules"],
  pg: ["sharingType", "capacity", "mealsIncluded", "rules"],
  flat: ["bhk", "furnished", "rules"],
  private_room: ["sharingType", "capacity", "rules"],
  dormitory: ["sharingType", "capacity", "mealsIncluded", "rules"],
  mess: [],
  movers_packers: [],
  rental_electronics: ["rentalDeposit", "rentalDuration", "itemCondition"],
  rental_furniture: ["rentalDeposit", "rentalDuration", "itemCondition"],
};

const FURNISHED_OPTIONS = ["furnished", "semi-furnished", "unfurnished"];

const TagInput = ({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      ) : null}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-destructive transition-colors ml-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";
const selectCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";


// ─── ImagePicker ──────────────────────────────────────────────────────────────
const ImagePicker = ({
  label, isCover = false, value, onAdd, onRemove, multiple = false,
  uploading, setUploading,
}: {
  label: string; isCover?: boolean; value: string[]; multiple?: boolean;
  onAdd: (urls: string[]) => void; onRemove: (i: number) => void;
  uploading: boolean; setUploading: (v: boolean) => void;
}) => {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 10);
    setUploading(true);
    try {
      const urls = await uploadApi.images(arr);
      onAdd(urls);
    } catch (e: any) {
      alert(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {label}
        {isCover && <span className="text-destructive">*</span>}
      </label>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-all
          ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Click to upload</span> or drag & drop
              <br />JPEG, PNG, WEBP · Max 5 MB each
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {value.map((url, i) => (
            <div key={i} className={`relative overflow-hidden rounded-lg border border-border ${isCover && i === 0 ? "h-32 w-full" : "h-20 w-28"}`}>
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              {isCover && i === 0 && (
                <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">COVER</div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddListing = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [error, setError] = useState("");

  // Core fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [address, setAddress] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // Accommodation extras
  const [sharingType, setSharingType] = useState("");
  const [bhk, setBhk] = useState("");
  const [furnished, setFurnished] = useState("");
  const [capacity, setCapacity] = useState("");
  const [mealsIncluded, setMealsIncluded] = useState(false);
  const [rules, setRules] = useState<string[]>([]);
  const [has3DTour, setHas3DTour] = useState(false);
  const [tourUrl, setTourUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableRooms, setAvailableRooms] = useState("");
  // Mess-specific
  const [monthlyPackage, setMonthlyPackage] = useState("");
  const [perMealRate, setPerMealRate] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");

  // Booking
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [bookingPrice, setBookingPrice]     = useState("");

  // Rental-specific
  const [rentalDeposit, setRentalDeposit]   = useState("");
  const [rentalDuration, setRentalDuration] = useState("");
  const [itemCondition, setItemCondition]   = useState("");

  const [uploading, setUploading] = useState(false);

  // Combines cover + additional into one array; first is always the cover
  const allPhotos = [image, ...mediaUrls].filter(Boolean);

  // No separate API call needed — AuthContext.isPremium is kept current by
  // refreshUser() which is called after every subscription activation.
  // A user can add a listing if: they are admin, OR they are an employee/owner
  // with an active premium subscription (isPremium=true from context).
  const hasOwnerSub = user?.role === "admin" || (
    (user?.role === "employee" || (user?.role === "student" && isPremium)) && isPremium
  );
  const subLoading = false; // no async check needed

  const extras = FIELDS_BY_CATEGORY[category] || [];

  const handleGenerateDescription = async () => {
    if (!name.trim() || !category) {
      setError("Please fill in Name and Category first.");
      return;
    }
    setGeneratingDesc(true);
    setError("");
    try {
      const { description: desc } = await aiApi.generateDescription({
        name, category, address, priceRange,
        amenities, sharingType, bhk, furnished,
        mealsIncluded, rules, capacity: capacity ? Number(capacity) : undefined,
      });
      setDescription(desc);
    } catch (e: any) {
      setError(e.message || "AI generation failed. Please write description manually.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) return setError("Name is required.");
    if (!category) return setError("Please select a category.");
    if (!address.trim()) return setError("Address is required.");
    if (!priceRange.trim()) return setError("Price range is required.");
    if (!contact.trim()) return setError("Contact is required.");
    if (!description.trim()) return setError("Description is required.");
    // Photos are required — at least one image
    if (!image.trim() && mediaUrls.length === 0)
      return setError("At least one photo is required. Please upload a cover photo.");

    setSubmitting(true);
    try {
      const isMess = category === "mess";
      const body: Record<string, unknown> = {
        name: name.trim(),
        category,
        address: address.trim(),
        distance: 0,
        priceRange: priceRange.trim(),
        contact: contact.trim(),
        description: description.trim(),
        amenities,
        image: image.trim(),
        mediaUrls,
      };
      if (extras.includes("sharingType") && sharingType)
        body.sharingType = sharingType;
      if (extras.includes("bhk") && bhk) body.bhk = bhk;
      if (extras.includes("furnished") && furnished) body.furnished = furnished;
      if (extras.includes("capacity") && capacity)
        body.capacity = Number(capacity);
      if (extras.includes("mealsIncluded")) body.mealsIncluded = mealsIncluded;
      if (extras.includes("rules")) body.rules = rules;
      if (has3DTour && tourUrl.trim()) {
        body.has3DTour = true;
        body.tourUrl = tourUrl.trim();
      }
      body.bookingEnabled = bookingEnabled;
      if (bookingEnabled && bookingPrice) body.bookingPrice = Number(bookingPrice);

      // Rental fields
      if (extras.includes("rentalDeposit") && rentalDeposit) body.rentalDeposit = Number(rentalDeposit);
      if (extras.includes("rentalDuration") && rentalDuration) body.rentalDuration = rentalDuration;
      if (extras.includes("itemCondition") && itemCondition) body.itemCondition = itemCondition;

      const { listing } = await listingsApi.create(body);
      navigate(`/listing/${listing.id}`);
    } catch (e: unknown) {
      // Backend returns requiresOwnerSubscription flag on 403
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (
        errorMessage?.includes("Owner Subscription") ||
        errorMessage?.includes("₹300")
      ) {
        setError("__SUBSCRIPTION_REQUIRED__");
      } else {
        setError(errorMessage || "Failed to create listing.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Please sign in to add a listing.</p>
        </div>
      </div>
    );

  // Students without premium cannot list (pure students)
  // If isPremium=true, a student just bought a plan — role will update shortly
  if (user.role === "student" && !isPremium)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl border border-border bg-card p-10 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Crown className="h-9 w-9 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Owner Account Required</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Listing a property or service requires an Owner account. Upgrade your plan to start reaching thousands of students.
                </p>
              </div>
              <div className="grid gap-2">
                <a
                  href="/subscription"
                  className="flex items-center justify-center gap-2 rounded-xl btn-glow py-3 text-sm font-semibold text-primary-foreground"
                >
                  Get Owner Plan — ₹299/month
                </a>
                <a
                  href="/listings"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Back to Listings
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Use coupon <span className="font-mono font-bold text-amber-400">FREEMONTH</span> for your first month free
              </p>
            </div>
          </div>
        </div>
      </div>
    );


  // Owner without active subscription — show gate before the form (admins always bypass)
  if (!subLoading && user && user.role === "employee" && !hasOwnerSub) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl border border-amber-500/20 bg-card p-10 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Crown className="h-9 w-9 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Subscription Required</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  You need an active <strong className="text-foreground">Owner subscription</strong> to publish listings. 
                  Plans start at <strong className="text-foreground">₹299/month</strong>.
                </p>
              </div>
              <div className="grid gap-2">
                <a href="/subscription?tab=owner"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Crown className="h-4 w-4" /> View Owner Plans
                </a>
                <a href="/listings"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                  ← Back to Listings
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                First month free with code{" "}
                <span className="font-mono font-bold text-amber-400">FREEMONTH</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subLoading && user && (user.role !== "student" || isPremium)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error === "__SUBSCRIPTION_REQUIRED__")
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Owner Subscription Required
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              You need an active <strong>Owner Plan (₹300/month)</strong> to
              publish listings on CampusConnect. New owners can use coupon{" "}
              <span className="font-mono font-bold text-primary">
                FREEMONTH
              </span>{" "}
              for their first month free!
            </p>
            <a
              href="/subscription"
              className="block w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground text-center hover:bg-primary/90 transition-colors"
            >
              Get Owner Subscription
            </a>
            <button
              onClick={() => setError("")}
              className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to form
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" /> Add New Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fields marked <span className="text-destructive font-semibold">*</span> are required. Photos are mandatory.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Core Info */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Basic Information
            </h2>

            <Field label="Listing Name *">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunrise Boys Hostel"
                className={inputCls}
              />
            </Field>

            <Field label="Category *">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={selectCls}
              >
                <option value="">Select a category</option>
                <optgroup label="🏠 Accommodation">
                  {categories.filter((c) => ["hostel","pg","flat","private_room","dormitory"].includes(c.id))
                    .map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </optgroup>
                <optgroup label="🍛 Food">
                  {categories.filter((c) => ["mess","food","tiffin","cook"].includes(c.id))
                    .map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </optgroup>
                <optgroup label="🔧 Services">
                  {categories.filter((c) => ["laundry","transport","movers_packers","stationery","medical","wifi","cyber_cafe","library"].includes(c.id))
                    .map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </optgroup>
                <optgroup label="📱 Rentals">
                  {categories.filter((c) => ["rental_electronics","rental_furniture"].includes(c.id))
                    .map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </optgroup>
              </select>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Description *</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc || !name || !category}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                >
                  {generatingDesc
                    ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                    : <><Sparkles className="h-3 w-3" /> ✨ AI Generate</>
                  }
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your listing in detail, or click ✨ AI Generate above..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Location and Contact */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Location & Contact
            </h2>

            <Field label="Full Address *">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12, MG Road, Near University Gate"
                className={inputCls}
              />
            </Field>

            <Field label="Contact Number *">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98765 43210"
                className={inputCls}
              />
            </Field>

            <Field label="Price Range *">
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="e.g. ₹4,000 - ₹7,000/month"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Photos & Media — REQUIRED */}
          <div className={`rounded-xl border-2 bg-card p-5 space-y-4 transition-colors ${
            allPhotos.length === 0
              ? "border-destructive/40 bg-destructive/[0.02]"
              : "border-green-500/40 bg-green-500/[0.02]"
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Photos & Media
                <span className="ml-1 rounded-md bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive uppercase tracking-wide">
                  Required
                </span>
              </h2>
              {allPhotos.length > 0 ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                  ✅ {allPhotos.length} photo{allPhotos.length > 1 ? "s" : ""} added
                </span>
              ) : (
                <span className="text-xs text-destructive font-medium">⚠ Add at least 1 photo</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground -mt-1">
              Listings with photos get <strong className="text-foreground">3× more enquiries</strong>. Upload from your device — JPEG, PNG or WEBP.
            </p>

            {/* Cover photo upload */}
            <ImagePicker
              label="Cover Photo"
              isCover
              value={image ? [image] : []}
              onAdd={(urls) => { setImage(urls[0]); if (urls.length > 1) setMediaUrls(prev => [...prev, ...urls.slice(1)]); }}
              onRemove={() => setImage("")}
              uploading={uploading}
              setUploading={setUploading}
            />

            {/* Additional photos upload */}
            <ImagePicker
              label="Additional Photos (up to 9 more)"
              multiple
              value={mediaUrls}
              onAdd={(urls) => setMediaUrls(prev => [...prev, ...urls].slice(0, 9))}
              onRemove={(i) => setMediaUrls(prev => prev.filter((_, j) => j !== i))}
              uploading={uploading}
              setUploading={setUploading}
            />

            {/* No photos yet — warning box */}
            {!image.trim() && mediaUrls.length === 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <span className="text-lg shrink-0">📷</span>
                <div>
                  <p className="text-xs font-semibold text-destructive">No photos added yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add a cover photo URL above. You can use free images from{" "}
                    <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      unsplash.com
                    </a>{" "}
                    — right-click an image → "Copy image address".
                  </p>
                </div>
              </div>
            )}

            {/* Video URLs */}
            <TagInput
              label="Video URLs (YouTube links or .mp4) — optional"
              values={videoUrls}
              onChange={setVideoUrls}
              placeholder="Paste YouTube link or direct video URL"
            />

            {/* 3D Tour */}
            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="has3d"
                  checked={has3DTour}
                  onChange={(e) => setHas3DTour(e.target.checked)}
                  className="rounded accent-primary"
                />
                <label
                  htmlFor="has3d"
                  className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <Box className="h-4 w-4 text-blue-600" /> This listing has a 3D virtual tour
                </label>
              </div>
              {has3DTour && (
                <input
                  type="url"
                  value={tourUrl}
                  onChange={(e) => setTourUrl(e.target.value)}
                  placeholder="Paste your 3D tour URL here"
                  className={inputCls}
                />
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-foreground">
              Amenities & Features
            </h2>
            <TagInput
              label="Add amenities (type and press Enter)"
              values={amenities}
              onChange={setAmenities}
              placeholder="e.g. Wi-Fi, AC, Parking..."
            />
          </div>

          {/* Accommodation Extras */}
          {extras.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-semibold text-foreground">
                Accommodation Details
              </h2>

              {extras.includes("sharingType") && (
                <Field label="Sharing Type">
                  <input
                    type="text"
                    value={sharingType}
                    onChange={(e) => setSharingType(e.target.value)}
                    placeholder="e.g. Single, Double, Triple"
                    className={inputCls}
                  />
                </Field>
              )}
              {extras.includes("bhk") && (
                <Field label="BHK Configuration">
                  <input
                    type="text"
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    placeholder="e.g. 1BHK, 2BHK"
                    className={inputCls}
                  />
                </Field>
              )}
              {extras.includes("furnished") && (
                <Field label="Furnished Status">
                  <select
                    value={furnished}
                    onChange={(e) => setFurnished(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select...</option>
                    {FURNISHED_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              {extras.includes("capacity") && (
                <Field label="Total Capacity (residents)">
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 60"
                    className={inputCls}
                  />
                </Field>
              )}
              {extras.includes("mealsIncluded") && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="meals"
                    checked={mealsIncluded}
                    onChange={(e) => setMealsIncluded(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <label
                    htmlFor="meals"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Meals included in rent
                  </label>
                </div>
              )}
              {extras.includes("rules") && (
                <TagInput
                  label="House Rules (type and press Enter)"
                  values={rules}
                  onChange={setRules}
                  placeholder="e.g. No smoking, Curfew 10 PM"
                />
              )}
            </div>
          )}

          {/* Rental Details — for rental_electronics and rental_furniture */}
          {(extras.includes("rentalDeposit") || extras.includes("itemCondition")) && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                🏷️ Rental Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Security Deposit (₹)">
                  <input
                    type="number"
                    min="0"
                    value={rentalDeposit}
                    onChange={(e) => setRentalDeposit(e.target.value)}
                    placeholder="e.g. 2000"
                    className={inputCls}
                  />
                </Field>

                <Field label="Minimum Rental Duration">
                  <select
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select minimum duration</option>
                    <option value="1 day">1 Day</option>
                    <option value="1 week">1 Week</option>
                    <option value="2 weeks">2 Weeks</option>
                    <option value="1 month">1 Month</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                    <option value="1 year">1 Year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </Field>
              </div>

              <Field label="Item Condition">
                <select
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select condition</option>
                  <option value="Brand New">🌟 Brand New</option>
                  <option value="Like New">✨ Like New (barely used)</option>
                  <option value="Good">👍 Good (minor wear)</option>
                  <option value="Fair">🔧 Fair (visible wear, fully functional)</option>
                  <option value="Refurbished">♻️ Refurbished</option>
                </select>
              </Field>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground">
                💡 <strong className="text-foreground">Tip:</strong> Set a fair deposit to protect your item. Most students prefer deposits under ₹3,000 for electronics and ₹2,000 for furniture.
              </div>
            </div>
          )}

          {/* Booking */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              📅 Direct Booking
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bookingEnabled"
                checked={bookingEnabled}
                onChange={(e) => setBookingEnabled(e.target.checked)}
                className="rounded accent-primary"
              />
              <label htmlFor="bookingEnabled" className="text-sm text-foreground cursor-pointer">
                Allow students to book a visit directly from your listing page
              </label>
            </div>
            {bookingEnabled && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Token Advance Amount (₹) — leave blank for free booking
                </label>
                <input
                  type="number"
                  min="0"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  placeholder="e.g. 200 (optional)"
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Students will pick a date & time slot. You'll get notified and can confirm or cancel.
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-border px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Creating listing..." : "Publish Listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;