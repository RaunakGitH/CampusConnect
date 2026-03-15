import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users, Moon, BookOpen, Cat, Cigarette, Wine, Loader2,
  CheckCircle, Edit3, Save, X, ArrowRight, Sparkles,
  Heart, UserCheck, Filter, RefreshCw, Utensils, Music,
  Wind, MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import { aiApi, roommateApi } from "@/services/api";
import type { RoommatePrefs } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

// ─── Pure mock data — no backend calls for the finder ────────────────────────
const MOCK_STUDENTS = [
  { id: "1",  name: "Arjun Mehta",    college: "IIT Delhi",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",    prefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"rarely",    studying:"library", diet:"veg",          pets:"okay",     budget:8000  }, bio:"Mechanical engg, plays guitar, tidy." },
  { id: "2",  name: "Priya Sharma",   college: "Delhi University", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",   prefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"moderate", guests:"sometimes", studying:"both",    diet:"veg",          pets:"love",     budget:6000  }, bio:"Arts student, yoga in the mornings, loves cooking." },
  { id: "3",  name: "Karan Singh",    college: "DTU",              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karan",   prefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"at_home", diet:"non_veg",      pets:"okay",     budget:9000  }, bio:"Software dev student, into coding and chess." },
  { id: "4",  name: "Sneha Patel",    college: "BITS Pilani",      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",   prefs: { smoking:"no", drinking:"no",           sleepSchedule:"night_owl",  cleaniness:"moderate",   noise:"quiet",    guests:"rarely",    studying:"library", diet:"vegan",        pets:"allergic", budget:7500  }, bio:"Design student, night coder, loves plants and indie music." },
  { id: "5",  name: "Rahul Verma",    college: "NIT Trichy",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",   prefs: { smoking:"occasionally", drinking:"occasionally", sleepSchedule:"night_owl", cleaniness:"relaxed", noise:"lively", guests:"often", studying:"at_home", diet:"non_veg", pets:"love", budget:5000 }, bio:"Party person, social butterfly, weekend trip organiser." },
  { id: "6",  name: "Ananya Rao",     college: "IIT Bombay",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya",  prefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"never",     studying:"library", diet:"veg",          pets:"okay",     budget:10000 }, bio:"Research scholar, introvert, minimalist lifestyle." },
  { id: "7",  name: "Dev Kapoor",     college: "Pune University",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev",    prefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"both",    diet:"no_preference",pets:"okay",     budget:6500  }, bio:"MBA student, gym bro, cooks biryani on Sundays." },
  { id: "8",  name: "Meera Iyer",     college: "Anna University",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=meera",  prefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"rarely",    studying:"library", diet:"veg",          pets:"love",     budget:5500  }, bio:"Biotech, early mornings, South Indian cooking expert." },
  { id: "9",  name: "Vikram Dubey",   college: "JNU",              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram", prefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"library", diet:"no_preference",pets:"okay",     budget:7000  }, bio:"Political science, loves debates and documentary films." },
  { id: "10", name: "Ritika Joshi",   college: "Jadavpur University",avatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=ritika",prefs: { smoking:"no", drinking:"no",           sleepSchedule:"night_owl",  cleaniness:"very_clean", noise:"quiet",    guests:"rarely",    studying:"at_home", diet:"veg",          pets:"love",     budget:6000  }, bio:"Literature student, writes poetry, minimalist." },
  { id: "11", name: "Aditya Kumar",   college: "IIT Kanpur",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditya", prefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"both",    diet:"non_veg",      pets:"okay",     budget:8500  }, bio:"Physics PhD, spends weekends hiking, laid-back roomie." },
  { id: "12", name: "Nisha Gupta",    college: "RVCE Bangalore",   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nisha",  prefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"never",     studying:"library", diet:"veg",          pets:"allergic", budget:9000  }, bio:"Computer science, into Carnatic music and running." },
];

// ─── Weighted score (same logic as backend, kept in sync) ─────────────────────
const WEIGHTS: Record<string, number> = {
  smoking:18, drinking:15, sleepSchedule:18, cleaniness:14,
  noise:12, guests:8, studying:7, diet:5, pets:3,
};

function fieldScore(a: string | undefined, b: string | undefined, field: string): number {
  if (!a || !b) return 0.5;
  if (a === "no_preference" || b === "no_preference") return 1;
  if (a === b) return 1;
  const partials: Record<string, [string, string, number][]> = {
    smoking:       [["occasionally","yes",0.4],["occasionally","no",0.2]],
    drinking:      [["occasionally","yes",0.4],["occasionally","no",0.2]],
    sleepSchedule: [["flexible","early_bird",0.7],["flexible","night_owl",0.7]],
    noise:         [["moderate","quiet",0.6],["moderate","lively",0.6]],
    guests:        [["sometimes","often",0.6],["sometimes","rarely",0.7],["rarely","never",0.7]],
    studying:      [["both","at_home",0.8],["both","library",0.8]],
  };
  for (const [v1,v2,s] of (partials[field] || [])) {
    if ((a===v1&&b===v2)||(a===v2&&b===v1)) return s;
  }
  return 0;
}

function computeScore(mine: Record<string,string>, theirs: Record<string,string>): number {
  let total=0, max=0;
  for (const [f,w] of Object.entries(WEIGHTS)) {
    total += fieldScore(mine[f], theirs[f], f) * w;
    max   += w;
  }
  return Math.round((total/max)*100);
}

function scoreLabel(score: number): { label:string; color:string } {
  if (score >= 85) return { label:"Excellent Match", color:"emerald" };
  if (score >= 70) return { label:"Great Match",     color:"green"   };
  if (score >= 55) return { label:"Good Match",      color:"blue"    };
  if (score >= 40) return { label:"Fair Match",      color:"amber"   };
  return                   { label:"Low Match",      color:"red"     };
}

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { key:"smoking",       label:"Do you smoke?",             icon:<Cigarette className="h-4 w-4"/>,
    options:[{v:"no",l:"Non-smoker",e:"🚭"},{v:"occasionally",l:"Occasionally",e:"🌬️"},{v:"yes",l:"Smoker",e:"🚬"},{v:"no_preference",l:"No pref",e:"🤷"}] },
  { key:"drinking",      label:"Alcohol?",                  icon:<Wine className="h-4 w-4"/>,
    options:[{v:"no",l:"Never",e:"🚫"},{v:"occasionally",l:"Occasionally",e:"🥂"},{v:"yes",l:"Regularly",e:"🍺"},{v:"no_preference",l:"No pref",e:"🤷"}] },
  { key:"sleepSchedule", label:"Sleep schedule?",           icon:<Moon className="h-4 w-4"/>,
    options:[{v:"early_bird",l:"Early bird",e:"🐦"},{v:"flexible",l:"Flexible",e:"💤"},{v:"night_owl",l:"Night owl",e:"🦉"}] },
  { key:"cleaniness",    label:"Tidiness?",                 icon:<Wind className="h-4 w-4"/>,
    options:[{v:"very_clean",l:"Very tidy",e:"✨"},{v:"moderate",l:"Moderate",e:"🧹"},{v:"relaxed",l:"Relaxed",e:"😌"}] },
  { key:"noise",         label:"Noise at home?",            icon:<Music className="h-4 w-4"/>,
    options:[{v:"quiet",l:"Quiet",e:"🤫"},{v:"moderate",l:"Moderate",e:"🎵"},{v:"lively",l:"Lively",e:"🎉"}] },
  { key:"guests",        label:"Guests frequency?",         icon:<Users className="h-4 w-4"/>,
    options:[{v:"never",l:"Never",e:"🚪"},{v:"rarely",l:"Rarely",e:"🙋"},{v:"sometimes",l:"Sometimes",e:"👥"},{v:"often",l:"Often",e:"🎊"}] },
  { key:"studying",      label:"Where do you study?",       icon:<BookOpen className="h-4 w-4"/>,
    options:[{v:"at_home",l:"At home",e:"🏠"},{v:"library",l:"Library",e:"📚"},{v:"both",l:"Both",e:"🔄"}] },
  { key:"diet",          label:"Diet?",                     icon:<Utensils className="h-4 w-4"/>,
    options:[{v:"veg",l:"Veg",e:"🥦"},{v:"non_veg",l:"Non-veg",e:"🍗"},{v:"vegan",l:"Vegan",e:"🌱"},{v:"no_preference",l:"No pref",e:"🍽️"}] },
  { key:"pets",          label:"Pets?",                     icon:<Cat className="h-4 w-4"/>,
    options:[{v:"love",l:"Love pets",e:"🐾"},{v:"okay",l:"Okay with it",e:"🙂"},{v:"allergic",l:"Allergic",e:"🤧"},{v:"no_preference",l:"No pref",e:"🤷"}] },
];

const PREF_LABELS: Record<string,Record<string,string>> = {
  sleepSchedule: { early_bird:"🐦 Early bird", night_owl:"🦉 Night owl", flexible:"💤 Flexible" },
  smoking:       { no:"🚭 Non-smoker", occasionally:"🌬️ Occasionally", yes:"🚬 Smoker", no_preference:"🤷 Any" },
  diet:          { veg:"🥦 Veg", non_veg:"🍗 Non-veg", vegan:"🌱 Vegan", no_preference:"🍽️ Any" },
  noise:         { quiet:"🤫 Quiet", moderate:"🎵 Moderate", lively:"🎉 Lively" },
  cleaniness:    { very_clean:"✨ Very clean", moderate:"🧹 Moderate", relaxed:"😌 Relaxed" },
};

const COLOR_MAP: Record<string,{bg:string;text:string;border:string;bar:string}> = {
  emerald:{bg:"bg-emerald-500/10",text:"text-emerald-400",border:"border-emerald-500/30",bar:"bg-emerald-500"},
  green:  {bg:"bg-green-500/10",  text:"text-green-400",  border:"border-green-500/30",  bar:"bg-green-500"},
  blue:   {bg:"bg-blue-500/10",   text:"text-blue-400",   border:"border-blue-500/30",   bar:"bg-blue-500"},
  amber:  {bg:"bg-amber-500/10",  text:"text-amber-400",  border:"border-amber-500/30",  bar:"bg-amber-500"},
  red:    {bg:"bg-red-500/10",    text:"text-red-400",    border:"border-red-500/30",    bar:"bg-red-500"},
};

// ─── AI Insight badge for a single card ──────────────────────────────────────
function AIInsightBadge({ myPrefs, candidate, score }: {
  myPrefs: Record<string,string>;
  candidate: typeof MOCK_STUDENTS[0];
  score: number;
}) {
  const [insight, setInsight]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);

  const fetch = useCallback(async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      const res = await aiApi.roommateCompatibility({
        myPrefs: myPrefs as any,
        candidatePrefs: candidate.prefs as any,
        candidateName: candidate.name,
        score,
      });
      setInsight(res.insight);
    } catch {
      setInsight("Tap to reveal AI compatibility insight.");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [fetched, loading, myPrefs, candidate, score]);

  if (!fetched) {
    return (
      <button
        onClick={fetch}
        className="flex w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary font-medium hover:bg-primary/10 transition-all"
      >
        {loading
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> Analysing with AI…</>
          : <><Sparkles className="h-3.5 w-3.5 shrink-0" /> Get AI compatibility insight</>
        }
      </button>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
      <span>{insight}</span>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ student, score, myPrefs }: {
  student: typeof MOCK_STUDENTS[0];
  score: number;
  myPrefs: Record<string,string>;
}) {
  const { label, color } = scoreLabel(score);
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  const initials = student.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className={`rounded-2xl glass-card border ${c.border} p-5 flex flex-col gap-3 hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <img
          src={student.avatar}
          alt={student.name}
          className={`h-12 w-12 shrink-0 rounded-full border-2 ${c.border}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display="none";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground">{student.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
              {label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{student.college}</p>
        </div>
        {/* Score */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-black ${c.bg} ${c.text} border-2 ${c.border}`}>
            {score}%
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold tracking-wide">MATCH</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{width:`${score}%`}} />
      </div>

      {/* Bio */}
      {student.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed italic">"{student.bio}"</p>
      )}

      {/* Pref chips */}
      <div className="flex flex-wrap gap-1.5">
        {(["sleepSchedule","diet","noise","smoking","cleaniness"] as const).map((key) => {
          const val = student.prefs[key as keyof typeof student.prefs] as string;
          if (!val || val==="no_preference") return null;
          const lbl = PREF_LABELS[key]?.[val];
          return lbl ? (
            <span key={key} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {lbl}
            </span>
          ) : null;
        })}
        {student.prefs.budget && (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            💰 ₹{(student.prefs.budget as number).toLocaleString()}/mo
          </span>
        )}
      </div>

      {/* AI insight — lazy loaded on click */}
      <AIInsightBadge myPrefs={myPrefs} candidate={student} score={score} />
    </div>
  );
}

// ─── Pref Form ────────────────────────────────────────────────────────────────
function PrefForm({ prefs, onChange, onSubmit }: {
  prefs: Record<string,string>;
  onChange: (k:string, v:string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      {QUESTIONS.map(q => (
        <div key={q.key}>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <span className="text-primary">{q.icon}</span> {q.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map(opt => (
              <button
                key={opt.v}
                onClick={() => onChange(q.key, opt.v)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left transition-all ${
                  prefs[q.key] === opt.v
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-white/[0.06] text-muted-foreground hover:border-primary/30 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-base">{opt.e}</span>
                <span className="text-xs font-medium leading-tight">{opt.l}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">💰 Monthly budget (₹)</p>
        <input
          type="number" min="0" placeholder="e.g. 8000"
          value={prefs.budget || ""}
          onChange={e => onChange("budget", e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={Object.keys(prefs).length < 3}
        className="flex w-full items-center justify-center gap-2 rounded-xl btn-glow py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" /> Find My Matches →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoommateFinder() {
  const { user } = useAuth();

  const [myPrefs, setMyPrefs]   = useState<Record<string,string>>({});
  const [matches, setMatches]   = useState<{student: typeof MOCK_STUDENTS[0]; score:number}[]>([]);
  const [backendLoaded, setBackendLoaded] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [filter, setFilter]     = useState(0);

  const setP = (k: string, v: string) => setMyPrefs(p => ({ ...p, [k]: v }));

  const computeMatches = async () => {
    // ── FIX: Try real backend first; fall back to mock data if unavailable
    if (!backendLoaded && user) {
      try {
        const { matches: realMatches, myPrefs: serverPrefs } = await roommateApi.getMatches();
        if (realMatches && realMatches.length > 0) {
          // Map backend matches to the same shape the UI expects
          const mapped = realMatches.map((m: any) => ({
            student: {
              id: m._id,
              name: m.name,
              college: m.collegeName || "Campus",
              avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m._id}`,
              prefs: m.prefs || {},
              bio: m.prefs?.bio || "",
            },
            score: m.score,
          }));
          setMatches(mapped);
          setBackendLoaded(true);
          return;
        }
      } catch { /* backend unavailable — fall through to mock */ }
    }

    const scored = MOCK_STUDENTS
      .map(s => ({ student: s, score: computeScore(myPrefs, s.prefs as Record<string,string>) }))
      .sort((a,b) => b.score - a.score);
    setMatches(scored);
    setShowForm(false);
  };

  const visible = filter > 0 ? matches.filter(m => m.score >= filter) : matches;
  const hasPrefs = Object.keys(myPrefs).length >= 3;

  if (!user) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-20 text-center max-w-md">
        <div className="rounded-2xl glass-card p-10">
          <Users className="mx-auto mb-4 h-14 w-14 text-primary/50" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Find Your Ideal Roommate</h2>
          <p className="text-muted-foreground text-sm mb-6">Sign in to match with compatible students and get AI-powered compatibility insights.</p>
          <Link to="/register" className="block w-full rounded-xl btn-glow py-3 text-sm font-semibold text-primary-foreground text-center mb-3">
            Sign up & Get Matched
          </Link>
          <Link to="/login" className="block text-sm text-primary hover:underline">Already have an account? Sign in →</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06] py-12">
        <div className="orb orb-purple w-[350px] h-[350px] -left-32 -top-20 opacity-50" />
        <div className="orb orb-blue   w-[300px] h-[300px] -right-24 top-10 opacity-40" />
        <div className="container text-center max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Sparkles className="h-4 w-4" /> AI-Powered Roommate Matching
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Find your <span className="text-gradient">perfect roommate</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Answer 9 lifestyle questions. We score compatibility and let AI explain exactly why you'd get along.
          </p>
        </div>
      </section>

      <div className="container py-8 max-w-5xl">

        {/* ── FORM / RESULTS TOGGLE ── */}
        {showForm ? (
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl glass-card glow-border p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Your Lifestyle Profile
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Answer honestly — compatibility is based on shared habits, not shared interests.</p>
              <PrefForm prefs={myPrefs} onChange={setP} onSubmit={computeMatches} />
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">

            {/* Sidebar — my summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> My Profile
                  </h2>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>

                <div className="space-y-2">
                  {QUESTIONS.map(q => {
                    const val = myPrefs[q.key];
                    const opt = q.options.find(o => o.v === val);
                    if (!opt) return null;
                    return (
                      <div key={q.key} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          {q.icon} {q.label.replace("?","")}
                        </span>
                        <span className="font-medium text-foreground">{opt.e} {opt.l}</span>
                      </div>
                    );
                  })}
                  {myPrefs.budget && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium text-foreground">₹{Number(myPrefs.budget).toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setMatches([]); setShowForm(true); setMyPrefs({}); }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start over
                </button>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Click <strong>"Get AI compatibility insight"</strong> on any card to see a personalised explanation powered by Groq AI.
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {visible.length} Compatible Students
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Sorted by compatibility · AI insights on demand</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filter}
                    onChange={e => setFilter(Number(e.target.value))}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-foreground outline-none"
                  >
                    <option value={0}>All matches</option>
                    <option value={60}>Good (60%+)</option>
                    <option value={75}>Great (75%+)</option>
                    <option value={85}>Excellent (85%+)</option>
                  </select>
                </div>
              </div>

              {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {visible.map(({student, score}) => (
                    <MatchCard key={student.id} student={student} score={score} myPrefs={myPrefs} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl glass-card p-12 text-center">
                  <Heart className="mx-auto mb-3 h-12 w-12 text-primary/30" />
                  <p className="font-display font-semibold text-foreground">No matches at this filter level</p>
                  <p className="mt-2 text-sm text-muted-foreground">Try lowering the filter threshold.</p>
                  <button onClick={() => setFilter(0)} className="mt-4 text-sm text-primary hover:underline">
                    Show all matches →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
