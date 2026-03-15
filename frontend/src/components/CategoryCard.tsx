import { Link } from "react-router-dom";

interface Props {
  id: string;
  label: string;
  icon: string;
  description: string;
}

// Colour palette per category
const CAT_COLORS: Record<string, { bg: string; iconBg: string; border: string; text: string; glow: string }> = {
  // Stay — violet/purple
  hostel:             { bg: "bg-violet-500/10",  iconBg: "bg-violet-500/20",  border: "border-violet-500/30",  text: "text-violet-300",  glow: "hover:shadow-violet-500/20" },
  pg:                 { bg: "bg-purple-500/10",  iconBg: "bg-purple-500/20",  border: "border-purple-500/30",  text: "text-purple-300",  glow: "hover:shadow-purple-500/20" },
  flat:               { bg: "bg-indigo-500/10",  iconBg: "bg-indigo-500/20",  border: "border-indigo-500/30",  text: "text-indigo-300",  glow: "hover:shadow-indigo-500/20" },
  private_room:       { bg: "bg-fuchsia-500/10", iconBg: "bg-fuchsia-500/20", border: "border-fuchsia-500/30", text: "text-fuchsia-300", glow: "hover:shadow-fuchsia-500/20" },
  dormitory:          { bg: "bg-pink-500/10",    iconBg: "bg-pink-500/20",    border: "border-pink-500/30",    text: "text-pink-300",    glow: "hover:shadow-pink-500/20" },
  // Food — orange/amber
  mess:               { bg: "bg-orange-500/10",  iconBg: "bg-orange-500/20",  border: "border-orange-500/30",  text: "text-orange-300",  glow: "hover:shadow-orange-500/20" },
  food:               { bg: "bg-red-500/10",     iconBg: "bg-red-500/20",     border: "border-red-500/30",     text: "text-red-300",     glow: "hover:shadow-red-500/20" },
  tiffin:             { bg: "bg-amber-500/10",   iconBg: "bg-amber-500/20",   border: "border-amber-500/30",   text: "text-amber-300",   glow: "hover:shadow-amber-500/20" },
  cook:               { bg: "bg-yellow-500/10",  iconBg: "bg-yellow-500/20",  border: "border-yellow-500/30",  text: "text-yellow-300",  glow: "hover:shadow-yellow-500/20" },
  // Services — blue/teal
  laundry:            { bg: "bg-sky-500/10",     iconBg: "bg-sky-500/20",     border: "border-sky-500/30",     text: "text-sky-300",     glow: "hover:shadow-sky-500/20" },
  transport:          { bg: "bg-blue-500/10",    iconBg: "bg-blue-500/20",    border: "border-blue-500/30",    text: "text-blue-300",    glow: "hover:shadow-blue-500/20" },
  movers_packers:     { bg: "bg-yellow-600/10",  iconBg: "bg-yellow-600/20",  border: "border-yellow-600/30",  text: "text-yellow-400",  glow: "hover:shadow-yellow-600/20" },
  stationery:         { bg: "bg-green-500/10",   iconBg: "bg-green-500/20",   border: "border-green-500/30",   text: "text-green-300",   glow: "hover:shadow-green-500/20" },
  medical:            { bg: "bg-rose-500/10",    iconBg: "bg-rose-500/20",    border: "border-rose-500/30",    text: "text-rose-300",    glow: "hover:shadow-rose-500/20" },
  wifi:               { bg: "bg-cyan-500/10",    iconBg: "bg-cyan-500/20",    border: "border-cyan-500/30",    text: "text-cyan-300",    glow: "hover:shadow-cyan-500/20" },
  cyber_cafe:         { bg: "bg-teal-500/10",    iconBg: "bg-teal-500/20",    border: "border-teal-500/30",    text: "text-teal-300",    glow: "hover:shadow-teal-500/20" },
  library:            { bg: "bg-emerald-500/10", iconBg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300", glow: "hover:shadow-emerald-500/20" },
  // Rentals — cyan/lime
  rental_electronics: { bg: "bg-cyan-500/10",    iconBg: "bg-cyan-500/20",    border: "border-cyan-500/30",    text: "text-cyan-300",    glow: "hover:shadow-cyan-500/20" },
  rental_furniture:   { bg: "bg-lime-500/10",    iconBg: "bg-lime-500/20",    border: "border-lime-500/30",    text: "text-lime-300",    glow: "hover:shadow-lime-500/20" },
};

const DEFAULT_COLOR = { bg: "bg-primary/10", iconBg: "bg-primary/20", border: "border-primary/30", text: "text-primary", glow: "hover:shadow-primary/20" };

const CategoryCard = ({ id, label, icon, description }: Props) => {
  const c = CAT_COLORS[id] || DEFAULT_COLOR;
  return (
    <Link
      to={`/listings?category=${id}`}
      className={`group flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.bg} ${c.border} ${c.glow}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-300 group-hover:scale-110 ${c.iconBg}`}>
        {icon}
      </span>
      <span className={`font-display text-sm font-bold leading-tight ${c.text}`}>{label}</span>
      <span className="text-xs text-muted-foreground hidden sm:block leading-relaxed">{description}</span>
    </Link>
  );
};

export default CategoryCard;
