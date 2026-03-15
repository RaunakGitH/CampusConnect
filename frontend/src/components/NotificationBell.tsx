import { useEffect, useRef, useState } from "react";
import { Bell, X, Check, CheckCheck, ExternalLink } from "lucide-react";
import { notificationsApi } from "@/services/api";
import type { Notification } from "@/services/api";
import { Link } from "react-router-dom";

const TYPE_ICONS: Record<string, string> = {
  price_alert: "🔔",
  review: "⭐",
  subscription: "👑",
  new_listing: "🏠",
  system: "📢",
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { notifications: n, unreadCount: u } = await notificationsApi.getAll();
      setNotifications(n);
      setUnreadCount(u);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30s
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id: string, wasUnread: boolean) => {
    await notificationsApi.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifs(); }}
        className="relative rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-display text-sm font-bold text-foreground">
              Notifications {unreadCount > 0 && <span className="ml-1 text-primary">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                    !n.read ? "bg-primary/3" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="mt-0.5 text-lg shrink-0">{TYPE_ICONS[n.type] || "📢"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <div className="flex gap-1 shrink-0">
                        {!n.read && (
                          <button onClick={() => handleMarkRead(n._id)} title="Mark read"
                            className="text-muted-foreground hover:text-primary transition-colors">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(n._id, !n.read)} title="Delete"
                          className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      {n.listingId && (
                        <Link to={`/listing/${n.listingId}`} onClick={() => setOpen(false)}
                          className="flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                          <ExternalLink className="h-2.5 w-2.5" /> View
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
