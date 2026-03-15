/**
 * BookingWidget — Smart in-platform booking/ordering system
 * Adapts its UI based on the listing category:
 *   🏠 Accommodation  → Schedule a site visit (date + time slot)
 *   🍛 Food/Mess      → Subscribe / place a meal order
 *   📦 Services       → Submit a service request (movers, laundry, etc.)
 */
import { useState } from "react";
import {
  Calendar, Clock, Phone, MessageSquare, CheckCircle,
  X, Loader2, CalendarDays, ShoppingCart, Truck,
  UtensilsCrossed, Home, Zap, Star, IndianRupee,
  Package, Wifi, BookOpen, Heart, ChevronRight,
} from "lucide-react";
import { bookingsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

// ── Category groups ───────────────────────────────────────────────────────────
const ACCOMMODATION = ["hostel", "pg", "flat", "private_room", "dormitory"];
const FOOD          = ["mess", "tiffin", "food", "cook"];
const RENTAL        = ["rental_electronics", "rental_furniture"];
const SERVICE       = ["laundry", "movers_packers", "transport", "wifi", "medical",
                       "stationery", "cyber_cafe", "library"];

type Mode = "visit" | "order" | "rental" | "service";

function getMode(category: string): Mode {
  if (ACCOMMODATION.includes(category)) return "visit";
  if (FOOD.includes(category))          return "order";
  if (RENTAL.includes(category))        return "rental";
  return "service";
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

const next7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];

const MEAL_PLANS = [
  { id: "lunch",        label: "Lunch only",         price: null },
  { id: "dinner",       label: "Dinner only",         price: null },
  { id: "both",         label: "Lunch + Dinner",      price: null },
  { id: "all3",         label: "3 meals / day",        price: null },
  { id: "monthly",      label: "Monthly subscription", price: null },
];

const LAUNDRY_PLANS = [
  { id: "wash_fold",  label: "Wash & Fold",         price: "₹30–80/kg" },
  { id: "dry_clean",  label: "Dry Cleaning",         price: "₹80–200" },
  { id: "monthly",    label: "Monthly Plan",          price: "₹499–999/mo" },
];

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Props {
  listingId: string;
  listingName: string;
  category: string;
  priceRange?: string;
  bookingEnabled?: boolean;
  bookingPrice?: number | null;
  onAuthRequired: () => void;
}

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ mode, date, time, plan, onReset }: {
  mode: Mode; date?: string; time?: string; plan?: string; onReset: () => void;
}) => (
  <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center space-y-3">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
      <CheckCircle className="h-8 w-8 text-green-400" />
    </div>
    <div>
      <p className="font-display font-bold text-foreground text-base">
        {mode === "visit"   ? "Visit Booked! 🎉"
       : mode === "order"   ? "Order Placed! 🍛"
       : mode === "rental"  ? "Rental Request Sent! 📦"
       :                      "Request Sent! 📬"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "visit"
          ? `Scheduled for ${date} at ${time}. Owner will confirm shortly.`
          : mode === "order"
          ? `${plan || "Your order"} has been placed. Owner will confirm & reach out.`
          : mode === "rental"
          ? `${plan || "Rental"} request sent. The owner will confirm availability and arrange delivery.`
          : "Your service request has been sent. Expect a call/WhatsApp soon."}
      </p>
    </div>
    <button onClick={onReset} className="text-xs text-primary hover:underline">
      {mode === "visit" ? "Book another slot" : "Place another request"}
    </button>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const BookingWidget = ({
  listingId, listingName, category,
  priceRange, bookingEnabled = true,
  bookingPrice, onAuthRequired,
}: Props) => {
  const { user } = useAuth();
  const mode = getMode(category);

  // Shared
  const [phone, setPhone]     = useState(user?.email ? "" : "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [successMeta, setSuccessMeta] = useState<{ date?: string; time?: string; plan?: string }>({});

  // Visit-specific
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedTime, setSelectedTime] = useState("");

  // Order-specific
  const [selectedPlan, setSelectedPlan] = useState("");
  const [quantity, setQuantity]         = useState(1);
  const [startDate, setStartDate]       = useState(todayStr());

  // Rental-specific
  const [rentalDuration, setRentalDuration] = useState("1 month");
  const [rentalStart, setRentalStart]       = useState(todayStr());

  // Service-specific
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState(todayStr());
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");

  const days = next7Days();

  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }

    if (mode === "visit") {
      if (!selectedTime) { setError("Please select a time slot."); return; }
    }
    if (mode === "order" && !selectedPlan) { setError("Please select a plan."); return; }
    if (mode === "service" && !serviceType) { setError("Please select a service type."); return; }
    if (mode === "rental" && !rentalDuration) { setError("Please select a rental duration."); return; }

    setError(""); setSubmitting(true);

    const msgParts = [];
    if (mode === "visit")   msgParts.push(`Visit request for ${selectedDate} at ${selectedTime}.`);
    if (mode === "order")   msgParts.push(`Order: ${selectedPlan} × ${quantity}. Start: ${startDate}.`);
    if (mode === "rental")  msgParts.push(`Rental request: ${rentalDuration} starting ${rentalStart}.`);
    if (mode === "service") msgParts.push(`Service type: ${serviceType}. Date: ${preferredDate}. ${urgency === "urgent" ? "URGENT." : ""}`);
    if (message) msgParts.push(message);

    try {
      await bookingsApi.create({
        listingId,
        date:      mode === "visit" ? selectedDate : mode === "rental" ? rentalStart : (mode === "order" ? startDate : preferredDate),
        time:      mode === "visit" ? selectedTime : "10:00",
        slotLabel: mode === "order" ? selectedPlan : mode === "service" ? serviceType : mode === "rental" ? rentalDuration : undefined,
        userPhone: phone.trim(),
        message:   msgParts.join(" "),
      });
      setSuccessMeta({
        date: selectedDate,
        time: selectedTime,
        plan: selectedPlan || serviceType,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSuccess(false); setError("");
    setSelectedTime(""); setSelectedPlan("");
    setServiceType(""); setMessage("");
  };

  // ── Icon + title per mode ───────────────────────────────────────────────────
  const modeIcon = mode === "visit"
    ? <CalendarDays className="h-5 w-5 text-primary" />
    : mode === "order"
    ? <ShoppingCart className="h-5 w-5 text-orange-400" />
    : mode === "rental"
    ? <Package className="h-5 w-5 text-cyan-400" />
    : <Zap className="h-5 w-5 text-blue-400" />;

  const modeTitle = mode === "visit"
    ? "Book a Visit"
    : mode === "order"
    ? category === "mess" || category === "tiffin" ? "Subscribe / Order"
      : category === "cook" ? "Hire a Cook"
      : "Place an Order"
    : mode === "rental"
    ? category === "rental_electronics" ? "Rent This Item"
      : "Rent This Furniture"
    : category === "movers_packers" ? "Request Movers"
      : category === "laundry" ? "Request Laundry"
      : category === "transport" ? "Book Transport"
      : "Request Service";

  const modeColor = mode === "visit"
    ? "border-primary/20 bg-primary/5"
    : mode === "order"
    ? "border-orange-500/20 bg-orange-500/5"
    : mode === "rental"
    ? "border-cyan-500/20 bg-cyan-500/5"
    : "border-blue-500/20 bg-blue-500/5";

  const btnColor = mode === "visit"
    ? "bg-primary hover:bg-primary/90"
    : mode === "order"
    ? "bg-orange-500 hover:bg-orange-600"
    : mode === "rental"
    ? "bg-cyan-600 hover:bg-cyan-700"
    : "bg-blue-600 hover:bg-blue-700";

  if (success) return (
    <SuccessScreen
      mode={mode}
      date={successMeta.date}
      time={successMeta.time}
      plan={successMeta.plan}
      onReset={reset}
    />
  );

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${modeColor}`}>

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          mode === "visit" ? "bg-primary/10" : mode === "order" ? "bg-orange-500/10" : "bg-blue-500/10"
        }`}>
          {modeIcon}
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">{modeTitle}</h3>
          <p className="text-xs text-muted-foreground">
            {mode === "visit"
              ? bookingPrice ? `Token advance: ₹${bookingPrice}` : "Free to book — no advance needed"
              : mode === "order"
              ? `${priceRange || "Contact for pricing"}`
              : "Direct request to provider"}
          </p>
        </div>
      </div>

      {/* ── VISIT: date + time ── */}
      {mode === "visit" && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Pick a date
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {days.map((d) => {
                const dt = new Date(d + "T00:00:00");
                const isToday = d === todayStr();
                return (
                  <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime(""); }}
                    className={`shrink-0 flex flex-col items-center rounded-xl border px-3 py-2 min-w-[54px] transition-all ${
                      selectedDate === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}>
                    <span className="text-[9px] font-semibold uppercase">{dt.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                    <span className="text-sm font-bold">{dt.getDate()}</span>
                    {isToday && <span className="text-[8px] font-semibold opacity-70">Today</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pick a time
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                    selectedTime === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── RENTAL: duration + start date ── */}
      {mode === "rental" && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Rental Duration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["1 week", "2 weeks", "1 month", "2 months", "3 months", "6 months", "1 semester", "1 year"].map((d) => (
                <button key={d} onClick={() => setRentalDuration(d)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    rentalDuration === d
                      ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
                      : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-cyan-500/30 hover:text-foreground"
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Rental Start Date
            </label>
            <input type="date" value={rentalStart} min={todayStr()}
              onChange={(e) => setRentalStart(e.target.value)}
              className={inp} />
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-cyan-400 text-xs">How rentals work</p>
            <p>1. Submit your request → 2. Owner confirms availability → 3. Pay deposit on delivery → 4. Return at end of period</p>
          </div>
        </>
      )}

      {/* ── ORDER: plan selection ── */}
      {mode === "order" && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Select Plan
            </p>
            <div className="space-y-2">
              {(category === "laundry" ? LAUNDRY_PLANS : MEAL_PLANS).map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.label)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all ${
                    selectedPlan === plan.label
                      ? "border-orange-500/60 bg-orange-500/10 text-foreground"
                      : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-orange-500/30 hover:bg-white/[0.04]"
                  }`}>
                  <span className="font-medium">{plan.label}</span>
                  {plan.price && <span className="text-xs font-semibold text-orange-400">{plan.price}</span>}
                  {selectedPlan === plan.label && <CheckCircle className="h-4 w-4 text-orange-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Start Date
            </p>
            <input type="date" value={startDate} min={todayStr()}
              onChange={(e) => setStartDate(e.target.value)}
              className={inp} />
          </div>

          {(category === "food" || category === "tiffin") && (
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Qty / Meals per day</p>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">−</button>
                <span className="w-6 text-center text-sm font-bold text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">+</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SERVICE: type + date + urgency ── */}
      {mode === "service" && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Service Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(category === "movers_packers"
                ? ["Home Shifting", "Hostel/PG Move", "Office Relocation", "Packing Only", "Intercity Move", "Storage"]
                : category === "laundry"
                ? ["Wash & Fold", "Dry Cleaning", "Monthly Plan", "Ironing Only"]
                : category === "transport"
                ? ["Auto / Cab", "Daily Pickup", "Airport Drop", "Intercity"]
                : category === "medical"
                ? ["Pharmacy Delivery", "Doctor Visit", "Health Checkup", "Emergency"]
                : category === "wifi"
                ? ["New Connection", "Upgrade Plan", "Repair/Support", "Relocation"]
                : ["Regular Service", "Express Service", "Monthly Package", "Custom Request"]
              ).map((svc) => (
                <button key={svc} onClick={() => setServiceType(svc)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium text-left transition-all ${
                    serviceType === svc
                      ? "border-blue-500/60 bg-blue-500/10 text-foreground"
                      : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-blue-500/30 hover:text-foreground"
                  }`}>
                  {svc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Preferred Date</p>
              <input type="date" value={preferredDate} min={todayStr()}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={inp} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Urgency</p>
              <div className="flex gap-2">
                {(["normal", "urgent"] as const).map((u) => (
                  <button key={u} onClick={() => setUrgency(u)}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      urgency === u
                        ? u === "urgent"
                          ? "border-red-500/60 bg-red-500/10 text-red-400"
                          : "border-blue-500/60 bg-blue-500/10 text-blue-400"
                        : "border-white/[0.08] text-muted-foreground hover:border-white/[0.14]"
                    }`}>
                    {u === "urgent" ? "⚡ Urgent" : "Normal"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Shared: phone + message ── */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> Your Phone Number *
        </label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210" className={inp} />
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" /> Additional details (optional)
        </label>
        <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder={
            mode === "visit"   ? "Any specific questions for the owner?" :
            mode === "order"   ? "Dietary preferences, allergies, special requests..." :
                                 "Describe what you need in more detail..."
          }
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs text-destructive">
          <X className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg ${btnColor}`}
      >
        {submitting
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : mode === "visit"   ? <CalendarDays className="h-4 w-4" />
          : mode === "order"   ? <ShoppingCart className="h-4 w-4" />
          : mode === "rental"  ? <Package className="h-4 w-4" />
          : <ChevronRight className="h-4 w-4" />
        }
        {submitting ? "Sending…"
          : !user ? "Sign in to Book"
          : mode === "visit"   ? `Confirm Visit — ${selectedDate}`
          : mode === "order"   ? "Place Order"
          : mode === "rental"  ? `Request Rental — ${rentalDuration}`
          : `Send Request${urgency === "urgent" ? " ⚡" : ""}`
        }
      </button>

      {/* Trust note */}
      <p className="text-center text-[10px] text-muted-foreground">
        🔒 Your details are shared only with the service provider · No payment collected here
      </p>
    </div>
  );
};

export default BookingWidget;
