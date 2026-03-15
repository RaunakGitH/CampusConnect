// ListingsMap.tsx — Interactive map using Leaflet + OpenStreetMap
// Fixed: uses deterministic pseudo-coordinates so it renders instantly
// without hitting Nominatim (which is rate-limited and causes blank maps).
import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/services/api";

interface Props {
  listings: Listing[];
  onSelect: (listing: Listing) => void;
}

const CAT_EMOJI: Record<string, string> = {
  hostel: "🏠", pg: "🏡", flat: "🏢", private_room: "🛏", dormitory: "🏨",
  mess: "🍽", food: "🍕", stationery: "📚", medical: "💊", transport: "🚌",
  laundry: "👕", tiffin: "🥘", cyber_cafe: "💻", library: "📖", wifi: "📶",
  cook: "👨‍🍳", movers_packers: "📦",
};

const CAT_COLOR: Record<string, string> = {
  hostel: "#6366f1", pg: "#8b5cf6", flat: "#a855f7", private_room: "#ec4899", dormitory: "#f43f5e",
  mess: "#f97316", food: "#ef4444", tiffin: "#fb923c", cook: "#fbbf24",
  laundry: "#06b6d4", transport: "#3b82f6", movers_packers: "#f59e0b",
  stationery: "#10b981", medical: "#14b8a6", wifi: "#0ea5e9", cyber_cafe: "#6366f1", library: "#8b5cf6",
};

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function pseudoRand(seed: string, salt: number): number {
  let h = salt * 2654435761;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

function mockLatLng(listing: Listing, idx: number): [number, number] {
  const centerLat = 26.9124, centerLng = 75.7873;
  const lat = centerLat + (pseudoRand(listing.id || listing.name, idx) - 0.5) * 0.045;
  const lng = centerLng + (pseudoRand(listing.name + listing.category, idx + 7) - 0.5) * 0.065;
  return [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))];
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).L) { resolve(); return; }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

const LEGEND_CATS = ["hostel", "pg", "flat", "food", "mess", "movers_packers", "laundry", "medical"];

const ListingsMap = ({ listings, onSelect }: Props) => {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapInst    = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(() => {
      if (cancelled || !mapRef.current) return;
      const L = (window as any).L;
      if (!mapInst.current) {
        mapInst.current = L.map(mapRef.current, { zoomControl: true }).setView([26.9124, 75.7873], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInst.current);
      }
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !mapInst.current) return;
    const L = (window as any).L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const coords: [number, number][] = [];
    const toShow = listings.slice(0, 40);

    toShow.forEach((listing, idx) => {
      const pos   = mockLatLng(listing, idx);
      const color = CAT_COLOR[listing.category] || "#6366f1";
      const emoji = CAT_EMOJI[listing.category] || "📍";
      coords.push(pos);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color};color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);cursor:pointer"><span style="transform:rotate(45deg)">${emoji}</span></div>`,
        iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
      });

      const popup = L.popup({ maxWidth: 230, closeButton: false }).setContent(
        `<div style="font-family:system-ui;padding:4px 2px">
          <p style="font-weight:700;font-size:13px;margin:0 0 3px;color:#111">${listing.name}</p>
          <p style="font-size:11px;color:#666;margin:0 0 3px">📍 ${listing.address}</p>
          <p style="font-size:12px;font-weight:600;color:#111;margin:0 0 2px">${listing.priceRange}</p>
          <p style="font-size:11px;color:#888;margin:0 0 6px">⭐ ${listing.rating > 0 ? listing.rating : "New"} · ${listing.reviewCount} reviews</p>
          <a href="/listing/${listing.id}" style="display:inline-block;background:${color};color:white;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">View listing →</a>
        </div>`
      );

      const marker = L.marker(pos, { icon }).addTo(mapInst.current).bindPopup(popup);
      marker.on("click", () => onSelect(listing));
      markersRef.current.push(marker);
    });

    if (coords.length > 0) {
      mapInst.current.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 });
    }
  }, [listings, ready]);

  useEffect(() => {
    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  }, []);

  const visibleCats = [...new Set(listings.map((l) => l.category))].slice(0, 8);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-md">
      <div ref={mapRef} style={{ height: 480 }} />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Loading map…</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {ready && visibleCats.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[999] flex flex-wrap gap-1.5 max-w-[280px]">
          {visibleCats.map((cat) => (
            <span
              key={cat}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
              style={{
                background: (CAT_COLOR[cat] || "#6366f1") + "33",
                border: `1px solid ${(CAT_COLOR[cat] || "#6366f1")}66`,
                color: CAT_COLOR[cat] || "#6366f1",
              }}
            >
              {CAT_EMOJI[cat]} {cat.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[999] rounded-lg bg-card/90 backdrop-blur-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {Math.min(listings.length, 40)} pins · click to preview
      </div>
    </div>
  );
};

export default ListingsMap;
