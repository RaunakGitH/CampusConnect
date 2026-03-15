import { Category } from "@/services/api";

export const categories: { id: Category; label: string; icon: string; description: string }[] = [
  // Accommodation
  { id: "hostel",             label: "Hostels",               icon: "🏠", description: "Affordable shared accommodation" },
  { id: "pg",                 label: "PG",                    icon: "🛋️",  description: "Paying guest with meals" },
  { id: "flat",               label: "Flats",                 icon: "🏢", description: "Independent furnished flats" },
  { id: "private_room",       label: "Private Rooms",         icon: "🚪", description: "Private room or house portion" },
  { id: "dormitory",          label: "Dormitories",           icon: "🛏️",  description: "Budget dorm stays" },
  // Food
  { id: "mess",               label: "Mess",                  icon: "🍛", description: "Monthly meal subscriptions" },
  { id: "food",               label: "Food & Cafés",          icon: "🍕", description: "Eat, drink, repeat" },
  { id: "tiffin",             label: "Tiffin",                icon: "🥡", description: "Home-cooked tiffin delivery" },
  { id: "cook",               label: "Cook",                  icon: "👨‍🍳", description: "Private cook hiring" },
  // Services
  { id: "laundry",            label: "Laundry",               icon: "👕", description: "Wash & fold services" },
  { id: "transport",          label: "Transport",             icon: "🚌", description: "Autos, buses & bikes" },
  { id: "movers_packers",     label: "Movers & Packers",      icon: "📦", description: "Relocation & shifting help" },
  { id: "stationery",         label: "Stationery",            icon: "📚", description: "Books, prints & supplies" },
  { id: "medical",            label: "Medical",               icon: "💊", description: "Pharmacies & clinics" },
  { id: "wifi",               label: "WiFi",                  icon: "📶", description: "Broadband & WiFi operators" },
  { id: "cyber_cafe",         label: "Cyber Café",            icon: "💻", description: "Printing & internet" },
  { id: "library",            label: "Library",               icon: "📖", description: "Reading & study spaces" },
  // Rentals
  { id: "rental_electronics", label: "Electronics Rental",   icon: "📱", description: "Rent laptops, phones & gadgets" },
  { id: "rental_furniture",   label: "Furniture Rental",     icon: "🪑", description: "Rent beds, desks, chairs & more" },
];

// Stay = pure accommodation only. mess is Food, NOT Stay.
export const accommodationCategories: Category[] = [
  "hostel", "pg", "flat", "private_room", "dormitory",
];

// Food categories (separate sub-group in UI)
export const foodCategories: Category[] = [
  "mess", "food", "tiffin", "cook",
];

// Service categories
export const serviceCategories: Category[] = [
  "laundry", "transport", "movers_packers",
  "stationery", "medical", "wifi", "cyber_cafe", "library",
];

// Rental categories
export const rentalCategories: Category[] = [
  "rental_electronics", "rental_furniture",
];

// Movers & Packers specific info
export const moversPackersFeatures = [
  { icon: "🏠", title: "Home Shifting", desc: "Full house relocation, packing & unpacking" },
  { icon: "📦", title: "Packing Services", desc: "Professional packing with quality materials" },
  { icon: "🚛", title: "Loading & Transport", desc: "Safe loading, transport & unloading" },
  { icon: "🏢", title: "Office Relocation", desc: "Office & commercial goods shifting" },
  { icon: "🛡️", title: "Insured Moves", desc: "Goods insurance for peace of mind" },
  { icon: "📍", title: "Local & Intercity", desc: "Within city or across cities" },
];
