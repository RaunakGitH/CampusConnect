import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { aiApi } from "@/services/api";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Find a PG under ₹6000 with meals",
  "What's the difference between hostel and PG?",
  "Show me flats near campus",
  "Best rated food places",
];

const CampusBot = () => {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [listings, setListings]   = useState<any[]>([]);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          content: "👋 Hi! I'm CampusBot. I can help you find the perfect PG, hostel, mess, or any service near your campus. What are you looking for?",
        }]);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setListings([]);

    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const searchKeywords = ["find", "show", "pg", "hostel", "flat", "room", "mess", "food", "under", "budget", "₹", "cheap", "near", "available"];
      const isSearch = searchKeywords.some((k) => msg.toLowerCase().includes(k));

      const chatPromise = aiApi.chat(msg, newMessages.slice(-6));
      const searchPromise = isSearch ? aiApi.smartSearch(msg).catch(() => null) : Promise.resolve(null);

      const [chatResult, searchResult] = await Promise.all([chatPromise, searchPromise]);

      if (searchResult && searchResult.listings.length > 0) {
        setListings(searchResult.listings.slice(0, 3));
      }
      setMessages((prev) => [...prev, { role: "assistant", content: chatResult.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          open ? "bg-white/[0.08] text-foreground backdrop-blur-xl border border-white/[0.1]" : "btn-glow text-primary-foreground"
        }`}
        title="CampusBot — AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && messages.length === 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white shadow-lg shadow-emerald-500/30">AI</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl glass-card shadow-2xl overflow-hidden flex flex-col animate-scale-in"
          style={{ maxHeight: "70vh", height: 520 }}>

          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary/80 to-secondary/80 backdrop-blur-xl px-4 py-3.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                CampusBot <Sparkles className="h-3.5 w-3.5" />
              </p>
              <p className="text-xs text-white/60">AI-powered campus assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-primary to-secondary text-white rounded-tr-sm"
                    : "bg-white/[0.06] text-foreground rounded-tl-sm border border-white/[0.06]"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Listing results */}
            {listings.length > 0 && (
              <div className="space-y-2 pl-9">
                {listings.map((l) => (
                  <Link key={l.id} to={`/listing/${l.id}`} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 hover:bg-white/[0.06] transition-all">
                    <img src={l.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&fit=crop"}
                      alt={l.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.priceRange} · {l.distance}km</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-primary">★ {l.rating > 0 ? l.rating : "New"}</span>
                        {l.isAvailable && <span className="text-[10px] text-emerald-400">• Available</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.06] px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions (show only on first message) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/[0.06] p-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl glass-input px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything about listings..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-60"
              />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary/20">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CampusBot;
