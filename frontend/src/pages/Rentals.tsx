import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Laptop, Armchair, Star, MapPin, BadgeCheck, Phone,
  ArrowRight, CheckCircle2, Shield, IndianRupee, Filter,
  Search, Clock, Package, X, MessageSquare, CalendarDays,
} from "lucide-react";
import Header from "@/components/Header";
import { listingsApi } from "@/services/api";
import type { Listing } from "@/services/api";
import BookingWidget from "@/components/BookingWidget";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ELECTRONICS: Listing[] = [
  { id:"re1", name:"Dell Inspiron 15 Laptop", category:"rental_electronics", address:"Hostel Zone, Near Gate 2", distance:0.3, priceRange:"₹1,200/month", contact:"+91 98765 43210", amenities:["i5 Processor","8GB RAM","256GB SSD","Free Delivery","Insurance Included"], rating:4.5, reviewCount:22, verified:true, image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop", description:"Well-maintained Dell laptop for semester rental. Free delivery within campus area. Monthly and semester packages available.", isFeatured:true, isAvailable:true } as any,
  { id:"re2", name:"MacBook Air M1 Rental", category:"rental_electronics", address:"PG Colony, Sector 5", distance:0.8, priceRange:"₹2,500/month", contact:"+91 87654 32109", amenities:["M1 Chip","8GB RAM","256GB SSD","Excellent Condition","Charger Included"], rating:4.8, reviewCount:15, verified:true, image:"https://images.unsplash.com/photo-1611186871525-28f9b34ef4ab?w=600&h=400&fit=crop", description:"MacBook Air M1 in excellent condition. Perfect for design students and developers. Security deposit ₹5,000 (refundable).", isFeatured:true, isAvailable:true } as any,
  { id:"re3", name:"iPad Air (5th Gen) Rental", category:"rental_electronics", address:"Library Road, Block A", distance:0.5, priceRange:"₹900/month", contact:"+91 76543 21098", amenities:["WiFi + Cellular","Apple Pencil Support","Smart Cover","64GB Storage"], rating:4.3, reviewCount:9, verified:false, image:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop", description:"Study tablet rental for students. Ideal for reading, note-taking and presentations. Minimum 1-month rental.", isAvailable:true } as any,
  { id:"re4", name:"HP Printer & Scanner", category:"rental_electronics", address:"Shop 4, Market Street", distance:0.4, priceRange:"₹400/month", contact:"+91 65432 10987", amenities:["Print","Scan","Copy","WiFi Printing","Ink Included (200 pages)"], rating:4.1, reviewCount:31, verified:true, image:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop", description:"Compact HP printer ideal for assignments and project reports. Ink refill included for up to 200 pages per month.", isAvailable:true } as any,
  { id:"re5", name:"Gaming Monitor 27\" (144Hz)", category:"rental_electronics", address:"Tech Park, Hostel Block C", distance:1.1, priceRange:"₹800/month", contact:"+91 54321 09876", amenities:["27 inch","144Hz","Full HD","HDMI + DisplayPort","Height Adjustable"], rating:4.6, reviewCount:7, verified:false, image:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop", description:"High-refresh-rate monitor for coding, gaming and design work. Free setup assistance.", isAvailable:true } as any,
  { id:"re6", name:"Sony Noise-Cancelling Headphones", category:"rental_electronics", address:"Near Central Library", distance:0.2, priceRange:"₹300/month", contact:"+91 43210 98765", amenities:["Sony WH-1000XM4","Noise Cancelling","30hr Battery","Carry Case"], rating:4.7, reviewCount:18, verified:true, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", description:"Premium Sony noise-cancelling headphones for focused study sessions. Minimum 2-week rental.", isAvailable:true } as any,
];

const MOCK_FURNITURE: Listing[] = [
  { id:"rf1", name:"Study Table & Chair Set", category:"rental_furniture", address:"Furniture Hub, Industrial Area", distance:1.8, priceRange:"₹350/month", contact:"+91 91234 56789", amenities:["Large Tabletop","Ergonomic Chair","Drawer Storage","Free Delivery","Assembly Included"], rating:4.4, reviewCount:44, verified:true, image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop", description:"Spacious study table with ergonomic chair. Free assembly and delivery within 5km.", isFeatured:true, isAvailable:true } as any,
  { id:"rf2", name:"Single Bed + Mattress", category:"rental_furniture", address:"Furniture Zone, Ring Road", distance:2.1, priceRange:"₹600/month", contact:"+91 80987 65432", amenities:["Single Bed Frame","5-inch Mattress","Pillow Included","Easy Assembly"], rating:4.2, reviewCount:28, verified:true, image:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop", description:"Complete bed setup including frame and mattress. Minimum 3-month rental.", isAvailable:true } as any,
  { id:"rf3", name:"Mini Fridge (165L)", category:"rental_furniture", address:"Electronics & Appliances Hub", distance:2.4, priceRange:"₹500/month", contact:"+91 72345 67890", amenities:["165L Capacity","Energy Efficient","Freezer Compartment","Free Delivery"], rating:4.5, reviewCount:19, verified:true, image:"https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=400&fit=crop", description:"Compact fridge perfect for hostel rooms and small apartments. Energy-efficient model.", isFeatured:true, isAvailable:true } as any,
  { id:"rf4", name:"Full Room Furniture Package", category:"rental_furniture", address:"Furniture Hub, Industrial Area", distance:1.8, priceRange:"₹1,200/month", contact:"+91 91234 56789", amenities:["Bed + Mattress","Study Table","Chair","Wardrobe","Free Delivery"], rating:4.6, reviewCount:12, verified:true, image:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop", description:"Complete room furniture package — best value for students moving into bare rooms.", isFeatured:true, isAvailable:true } as any,
  { id:"rf5", name:"Washing Machine (6kg)", category:"rental_furniture", address:"Appliances Corner, Sector 7", distance:2.9, priceRange:"₹700/month", contact:"+91 63456 78901", amenities:["6kg Capacity","Semi-Automatic","Free Installation","Maintenance Included"], rating:4.0, reviewCount:8, verified:false, image:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop", description:"Semi-automatic washing machine rental. Maintenance and repair covered.", isAvailable:true } as any,
  { id:"rf6", name:"Wardrobe (3-door)", category:"rental_furniture", address:"Furniture Zone, Ring Road", distance:2.1, priceRange:"₹300/month", contact:"+91 80987 65432", amenities:["3 Doors","Mirror Included","Hanging Rail","Shelves","Free Assembly"], rating:4.3, reviewCount:16, verified:true, image:"https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop", description:"Spacious 3-door wardrobe with mirror. Minimum 2-month rental.", isAvailable:true } as any,
];

const ELECTRONICS_ITEMS = [
  { icon:"💻", label:"Laptops" },{ icon:"📱", label:"Phones & Tablets" },
  { icon:"🖨️", label:"Printers" },{ icon:"🖥️", label:"Monitors" },
  { icon:"🎧", label:"Headphones" },{ icon:"📷", label:"Cameras" },
];
const FURNITURE_ITEMS = [
  { icon:"🛏️", label:"Beds & Mattresses" },{ icon:"🪑", label:"Study Tables" },
  { icon:"🚪", label:"Wardrobes" },{ icon:"❄️", label:"Fridges" },
  { icon:"🫧", label:"Washing Machines" },{ icon:"📦", label:"Full Room Packages" },
];

const WHY_RENT = [
  { icon:"💰", title:"Save Big",         desc:"Avoid one-time purchase costs. Rent for a semester and return." },
  { icon:"🚚", title:"Free Delivery",    desc:"Most providers deliver and pick up from your doorstep." },
  { icon:"🛡️", title:"Insured Items",    desc:"Accidental damage coverage included on most rentals." },
  { icon:"🔄", title:"Upgrade Anytime",  desc:"Switch to a better model mid-rental if you need to." },
];

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0e0e14] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img src={listing.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"}
            alt={listing.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
            <X className="h-4 w-4" />
          </button>
          {listing.isFeatured && (
            <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">⭐ FEATURED</span>
          )}
          <div className="absolute bottom-3 left-3">
            <p className="font-display font-bold text-white text-lg leading-tight">{listing.name}</p>
            <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{listing.address}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Rating + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{listing.rating}</span>
              <span className="text-xs text-muted-foreground">({listing.reviewCount} reviews)</span>
              {listing.verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-green-400 ml-1">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-lg font-bold text-primary">
              <IndianRupee className="h-4 w-4" />
              {listing.priceRange.replace("₹", "")}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.map((a) => (
              <span key={a} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-muted-foreground">{a}</span>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="flex gap-2">
            <a href={`tel:${listing.contact}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-semibold text-foreground hover:bg-white/[0.08] transition-all">
              <Phone className="h-4 w-4" /> Call Owner
            </a>
            <a href={`https://wa.me/${listing.contact.replace(/\D/g,"")}?text=Hi, I found your rental listing on CampusConnect. I'm interested in renting "${listing.name}".`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-all">
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {/* Booking widget */}
          <BookingWidget
            listingId={listing.id}
            listingName={listing.name}
            category={listing.category}
            priceRange={listing.priceRange}
            bookingEnabled={true}
            onAuthRequired={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Rental Card ──────────────────────────────────────────────────────────────
function RentalCard({ listing, onViewDetails }: { listing: Listing; onViewDetails: (l: Listing) => void }) {
  return (
    <div className={`rounded-2xl glass-card overflow-hidden flex flex-col transition-all hover:shadow-xl group ${listing.isFeatured ? "glow-border" : ""}`}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => onViewDetails(listing)}>
        <img src={listing.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"}
          alt={listing.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {listing.isFeatured && (
          <div className="absolute top-2 left-2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">⭐ FEATURED</div>
        )}
        {listing.verified && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-green-400">
            <BadgeCheck className="h-3 w-3" /> Verified
          </div>
        )}
        {!listing.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold text-white">Currently Rented Out</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-display font-bold text-foreground text-sm leading-tight line-clamp-2">{listing.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {listing.address}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-foreground">{listing.rating > 0 ? listing.rating : "New"}</span>
            <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
          </div>
          <div className="flex items-center gap-0.5 text-sm font-bold text-primary">
            <IndianRupee className="h-3.5 w-3.5" />
            {listing.priceRange.replace("₹", "")}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {listing.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{a}</span>
          ))}
        </div>

        <div className="mt-auto pt-1 flex gap-2">
          <a href={`tel:${listing.contact}`} onClick={(e) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 text-xs font-semibold text-foreground hover:bg-white/[0.08] transition-all">
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <button onClick={() => onViewDetails(listing)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

const Skeleton = () => (
  <div className="rounded-2xl glass-card overflow-hidden animate-pulse">
    <div className="h-44 bg-white/[0.04]" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/[0.06] rounded w-3/4" />
      <div className="h-3 bg-white/[0.06] rounded w-1/2" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Rentals = () => {
  const [tab, setTab]           = useState<"electronics" | "furniture">("electronics");
  const [search, setSearch]     = useState("");
  const [electronics, setElectronics] = useState<Listing[]>([]);
  const [furniture, setFurniture]     = useState<Listing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Listing | null>(null);

  useEffect(() => {
    Promise.all([
      listingsApi.getAll({ category: "rental_electronics", limit: 20 }).catch(() => ({ listings: [] as Listing[], pagination: null as any })),
      listingsApi.getAll({ category: "rental_furniture",   limit: 20 }).catch(() => ({ listings: [] as Listing[], pagination: null as any })),
    ]).then(([{ listings: el }, { listings: fu }]) => {
      setElectronics(el.length > 0 ? el : MOCK_ELECTRONICS);
      setFurniture(fu.length   > 0 ? fu : MOCK_FURNITURE);
    }).finally(() => setLoading(false));
  }, []);

  const activeList = tab === "electronics" ? electronics : furniture;
  const filtered = search.trim()
    ? activeList.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.amenities.some((a) => a.toLowerCase().includes(search.toLowerCase()))
      )
    : activeList;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {selected && <DetailModal listing={selected} onClose={() => setSelected(null)} />}

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="orb orb-purple w-[400px] h-[400px] -left-32 -top-32 opacity-60" />
        <div className="orb orb-blue   w-[350px] h-[350px] -right-24 top-10 opacity-50" />
        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300 mb-5 animate-fade-in-up">
            <Package className="h-4 w-4" /> Rent Electronics & Furniture Near Campus
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl animate-fade-in-up">
            Why buy when you can <span className="text-gradient">rent?</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Laptops, tablets, printers, beds, desks & more — rent for a semester and return.
          </p>
          <div className="mt-8 grid grid-cols-6 gap-3 max-w-sm mx-auto">
            {[...ELECTRONICS_ITEMS.slice(0,3),...FURNITURE_ITEMS.slice(0,3)].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[9px] text-muted-foreground font-medium leading-tight text-center">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-400" /> Insurance Included</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Free Delivery</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-400" /> Flexible Duration</span>
          </div>
        </div>
      </section>

      {/* Why Rent */}
      <section className="container pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_RENT.map((w) => (
            <div key={w.title} className="rounded-2xl glass-card p-5 text-center hover:glow-border transition-all">
              <span className="text-3xl">{w.icon}</span>
              <h3 className="mt-2 font-semibold text-foreground text-sm">{w.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="container pb-16">
        {/* Tab switcher */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 gap-1">
            <button onClick={() => setTab("electronics")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tab==="electronics"?"bg-white/[0.08] text-foreground":"text-muted-foreground hover:text-foreground"}`}>
              <Laptop className="h-4 w-4" /> Electronics
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab==="electronics"?"bg-primary/20 text-primary":"bg-white/[0.06] text-muted-foreground"}`}>{electronics.length}</span>
            </button>
            <button onClick={() => setTab("furniture")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tab==="furniture"?"bg-white/[0.08] text-foreground":"text-muted-foreground hover:text-foreground"}`}>
              <Armchair className="h-4 w-4" /> Furniture
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab==="furniture"?"bg-primary/20 text-primary":"bg-white/[0.06] text-muted-foreground"}`}>{furniture.length}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl glass-card px-4 max-w-xs w-full">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input type="text" placeholder={`Search ${tab}…`} value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(tab === "electronics" ? ELECTRONICS_ITEMS : FURNITURE_ITEMS).map((item) => (
            <button key={item.label} onClick={() => setSearch(item.label)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                search === item.label
                  ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                  : "border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:text-foreground hover:border-white/[0.16]"
              }`}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          {search && (
            <button onClick={() => setSearch("")}
              className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
              Clear ✕
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> {tab} available for rent
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_,i)=><Skeleton key={i}/>)}</div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => <RentalCard key={l.id} listing={l} onViewDetails={setSelected} />)}
          </div>
        ) : (
          <div className="rounded-2xl glass-card p-12 text-center">
            <span className="text-4xl">{tab==="electronics"?"💻":"🪑"}</span>
            <p className="mt-3 font-semibold text-foreground">No items match</p>
            <button onClick={()=>setSearch("")} className="mt-2 text-sm text-primary hover:underline">Clear filter</button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl glass-card glow-border p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-4xl">🏪</span>
            <h3 className="mt-4 font-display text-2xl font-bold text-foreground">Have something to rent out?</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm">
              Earn passive income by renting your laptop, furniture, appliances to fellow students.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/listings/new" className="inline-flex items-center gap-2 rounded-xl btn-glow px-6 py-3 text-sm font-semibold text-primary-foreground">
                <Package className="h-4 w-4" /> List Your Item for Rent
              </Link>
              <Link to="/subscription" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
                View Owner Plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground">CampusConnect</p>
          <p className="mt-1">Built with ❤️ for college students everywhere</p>
        </div>
      </footer>
    </div>
  );
};

export default Rentals;
