require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const Review = require("../models/review.model");
const PartnerOffer = require("../models/partner.model");
const College = require("../models/college.model");

const ONE_MONTH = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; };
const THREE_MONTHS = () => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d; };

const listings = [
  // ── Accommodation ────────────────────────────────────────────────────────────
  {
    name: "Sunrise Boys Hostel", category: "hostel",
    address: "12, MG Road, Near University Gate", distance: 0.3,
    priceRange: "₹4,000 - ₹7,000/month", contact: "+91 98765 43210",
    amenities: ["Wi-Fi", "AC", "Laundry", "Mess", "Parking", "24/7 Security"],
    rating: 4.3, reviewCount: 48, verified: true,
    sharingType: "Double / Triple", capacity: 120, mealsIncluded: true,
    rules: ["No smoking", "Curfew 10 PM", "No outside guests"],
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    description: "Well-maintained hostel with spacious rooms, 24/7 security, and homely mess food. Just 5 minutes walk from the campus gate.",
    isAvailable: true, availableRooms: 8,
  },
  {
    name: "Lakshmi Girls PG", category: "pg",
    address: "45, College Road, Sector 5", distance: 0.5,
    priceRange: "₹5,500 - ₹8,500/month", contact: "+91 87654 32109",
    amenities: ["Wi-Fi", "AC", "Meals", "CCTV", "Geyser", "Study Room"],
    rating: 4.6, reviewCount: 62, verified: true,
    sharingType: "Single / Double", mealsIncluded: true, capacity: 60,
    rules: ["Girls only", "No visitors after 9 PM", "No cooking in rooms"],
    has3DTour: true, tourUrl: "https://my.matterport.com/show/?m=demo",
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    description: "Premium PG for girls with excellent security, home-cooked meals, and a reading lounge.",
  },
  {
    name: "Green Valley Flats", category: "flat",
    address: "Block C, Green Valley Apartments, Sector 12", distance: 1.2,
    priceRange: "₹9,000 - ₹15,000/month", contact: "+91 77654 32100",
    amenities: ["Wi-Fi", "Parking", "Power Backup", "Lift", "Security"],
    rating: 4.4, reviewCount: 27, verified: true,
    bhk: "2BHK", furnished: "semi-furnished",
    has3DTour: true, tourUrl: "https://my.matterport.com/show/?m=demo2",
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    description: "Spacious 2BHK flat ideal for 2-3 students or working professionals. Semi-furnished with modular kitchen and large balcony.",
  },
  {
    name: "Metro Private Rooms", category: "private_room",
    address: "78, Station Road, Near Metro Gate 2", distance: 0.8,
    priceRange: "₹6,000 - ₹9,000/month", contact: "+91 66543 21090",
    amenities: ["Wi-Fi", "Attached Bath", "AC", "Geyser"],
    rating: 4.2, reviewCount: 18, verified: false,
    sharingType: "Single", capacity: 15, mealsIncluded: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    description: "Fully private rooms with attached bathrooms in a quiet building. Perfect for students who value personal space.",
  },
  {
    name: "Campus Budget Dorm", category: "dormitory",
    address: "Plot 5, University Colony", distance: 0.2,
    priceRange: "₹2,500 - ₹3,500/month", contact: "+91 55432 10980",
    amenities: ["Wi-Fi", "Lockers", "Common Bath", "Mess", "24/7 Water"],
    rating: 3.9, reviewCount: 74, verified: true,
    sharingType: "Dormitory (8-12 beds)", capacity: 200, mealsIncluded: true,
    rules: ["Lights out by 11 PM", "No loud music"],
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&h=400&fit=crop",
    description: "Most affordable stay option right on campus. Clean dormitories with secure lockers and 24/7 mess service.",
    isAvailable: false, availableRooms: 0,
  },
  {
    name: "Annapurna Student Mess", category: "mess",
    address: "Lane 3, Behind Engineering Block", distance: 0.1,
    priceRange: "₹2,200 - ₹3,000/month", contact: "+91 44321 09870",
    amenities: ["Veg", "Non-Veg", "Breakfast", "Lunch", "Dinner", "Sunday Special"],
    rating: 4.5, reviewCount: 310, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop",
    description: "Home-style mess serving unlimited food three times a day. Monthly subscription plans available. Loved by hundreds of students every semester.",
    monthlyPackage: 2400, perMealRate: 60, mealsPerDay: 3,
  },

  // ── Food & Cafes ─────────────────────────────────────────────────────────────
  {
    name: "Campus Bites Café", category: "food",
    address: "Shop 7, University Market", distance: 0.1,
    priceRange: "₹50 - ₹250", contact: "+91 76543 21098",
    amenities: ["Dine-in", "Takeaway", "Zomato", "Wi-Fi"],
    rating: 4.5, reviewCount: 156, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    description: "The go-to spot for students craving affordable yet delicious meals. Famous for their butter chicken and cold coffee.",
  },
  {
    name: "Sharma Juice Corner", category: "food",
    address: "Gate 2, Opposite Library", distance: 0.2,
    priceRange: "₹30 - ₹120", contact: "+91 65432 10987",
    amenities: ["Takeaway", "Fresh Juices", "Shakes"],
    rating: 4.7, reviewCount: 210, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=400&fit=crop",
    description: "Legendary juice stall serving fresh fruit juices and shakes loved by every batch of students.",
  },

  // ── Stationery ───────────────────────────────────────────────────────────────
  {
    name: "BookWorld Stationery", category: "stationery",
    address: "23, College Road", distance: 0.4,
    priceRange: "₹10 - ₹500", contact: "+91 54321 09876",
    amenities: ["Xerox", "Printing", "Binding", "Books"],
    rating: 4.2, reviewCount: 89, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=400&fit=crop",
    description: "One-stop shop for all academic needs — textbooks, lab records, printing, and binding services.",
  },

  // ── Medical ──────────────────────────────────────────────────────────────────
  {
    name: "MedPlus Pharmacy", category: "medical",
    address: "15, Main Road, Near Bus Stop", distance: 0.6,
    priceRange: "₹20 - ₹2,000", contact: "+91 43210 98765",
    amenities: ["24/7", "Home Delivery", "Health Checkup"],
    rating: 4.4, reviewCount: 34, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop",
    description: "Reliable pharmacy open round the clock with home delivery options for students.",
  },

  // ── Transport ────────────────────────────────────────────────────────────────
  {
    name: "QuickRide Auto Stand", category: "transport",
    address: "University Main Gate", distance: 0.0,
    priceRange: "₹20 - ₹200", contact: "+91 32109 87654",
    amenities: ["Auto", "Shared Rides", "UPI Payment"],
    rating: 3.9, reviewCount: 120, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
    description: "Auto stand right at the gate. Shared autos to railway station, bus stand, and city center.",
  },
  {
    name: "PedalPower Bike Rentals", category: "transport",
    address: "3, Lane Behind Canteen", distance: 0.15,
    priceRange: "₹50 - ₹500/day", contact: "+91 21098 76543",
    amenities: ["Bikes", "Scooters", "Helmets", "Monthly Plans"],
    rating: 4.1, reviewCount: 45, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    description: "Rent bikes and scooters at student-friendly prices. Monthly subscription plans available.",
  },

  // ── New utility categories ───────────────────────────────────────────────────
  {
    name: "SpinCycle Laundry", category: "laundry",
    address: "Shop 2, Market Street Near Gate 3", distance: 0.35,
    priceRange: "₹30 - ₹80/kg", contact: "+91 90123 45678",
    amenities: ["Wash & Fold", "Dry Clean", "Pickup", "24hr Turnaround"],
    rating: 4.3, reviewCount: 67, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=400&fit=crop",
    description: "Fast and affordable laundry with free pickup from hostels. Monthly packages available for hostel residents.",
  },
  {
    name: "Maa Tiffin Service", category: "tiffin",
    address: "House 14, Residential Colony, Block B", distance: 0.7,
    priceRange: "₹80 - ₹120/meal", contact: "+91 89012 34567",
    amenities: ["Lunch", "Dinner", "Veg", "Non-Veg", "Home Delivery"],
    rating: 4.6, reviewCount: 145, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    description: "Homestyle tiffin delivering fresh lunch and dinner daily. Monthly subscriptions start at ₹2,500. Pure veg and non-veg options.",
  },
  {
    name: "DigiZone Cyber Café", category: "cyber_cafe",
    address: "Plot 11, University Road", distance: 0.45,
    priceRange: "₹30 - ₹60/hour", contact: "+91 78901 23456",
    amenities: ["Fast Internet", "Printing", "Scanning", "Projector"],
    rating: 3.8, reviewCount: 52, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop",
    description: "Air-conditioned cyber café with high-speed internet, printing, and scanning. Student ID gets 10% off.",
  },
  {
    name: "Knowledge Hub Library", category: "library",
    address: "2nd Floor, Community Center, Sector 4", distance: 0.9,
    priceRange: "₹300 - ₹800/month", contact: "+91 67890 12345",
    amenities: ["AC", "Wi-Fi", "Silence Zone", "Study Pods", "Cafeteria"],
    rating: 4.7, reviewCount: 93, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop",
    description: "Premium study library open 6 AM to midnight. Dedicated silence zones, private study pods, and free Wi-Fi for members.",
  },
  {
    name: "NetSpeed WiFi Solutions", category: "wifi",
    address: "Shop 8, Tech Park, Near Hostel Zone", distance: 0.3,
    priceRange: "₹299 - ₹799/month", contact: "+91 56789 01234",
    amenities: ["Broadband", "50 Mbps+", "Installation", "24/7 Support"],
    rating: 4.0, reviewCount: 38, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop",
    description: "Reliable broadband provider for hostels and PGs. Flat plans from ₹299/month with free installation for new connections.",
  },
  {
    name: "Chef Ramesh — Private Cook", category: "cook",
    address: "Available in Sector 3 & 5", distance: 1.0,
    priceRange: "₹3,000 - ₹6,000/month", contact: "+91 45678 90123",
    amenities: ["Breakfast", "Lunch", "Dinner", "Grocery Management"],
    rating: 4.8, reviewCount: 29, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=400&fit=crop",
    description: "Experienced home cook available for flats and shared apartments. North Indian, South Indian, and continental cuisine.",
  },
  // ── Rental Electronics ────────────────────────────────────────────────────
  {
    name: "Dell Inspiron 15 Laptop Rental", category: "rental_electronics",
    address: "Sector 12, Near Hostel Zone", distance: 0.4,
    priceRange: "₹800 - ₹1,200/month", contact: "+91 93456 78901",
    amenities: ["i5 Processor", "8GB RAM", "256GB SSD", "Windows 11", "Charger Included"],
    rating: 4.3, reviewCount: 14, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
    description: "Well-maintained Dell laptop available for monthly rental. Perfect for students who need a reliable machine for the semester. Free delivery within campus area.",
  },
  {
    name: "iPhone 13 Rental — Short Term", category: "rental_electronics",
    address: "PG Colony, Block B, Lane 4", distance: 0.7,
    priceRange: "₹500 - ₹900/month", contact: "+91 82345 67890",
    amenities: ["128GB Storage", "Excellent Battery", "Original Charger", "Screen Guard"],
    rating: 4.1, reviewCount: 8, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=400&fit=crop",
    description: "iPhone 13 in good condition available for 1-6 month rental. Security deposit required. Useful for internships or while your phone is being repaired.",
  },
  {
    name: "HP Printer & Scanner Rental", category: "rental_electronics",
    address: "Market Street, Near Gate 2", distance: 0.3,
    priceRange: "₹400 - ₹600/month", contact: "+91 71234 56789",
    amenities: ["Print", "Scan", "Copy", "Wireless Printing", "Ink Included"],
    rating: 4.5, reviewCount: 22, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop",
    description: "HP printer with scanner ideal for assignments, project reports and lab records. Monthly ink cartridge included. Available for pickup or delivery.",
  },
  {
    name: "Study Tablet Rental (iPad Air)", category: "rental_electronics",
    address: "Hostel Block C, University Campus", distance: 0.2,
    priceRange: "₹1,000 - ₹1,500/month", contact: "+91 60123 45678",
    amenities: ["10.9 inch Screen", "Wi-Fi", "Apple Pencil Compatible", "64GB", "Case Included"],
    rating: 4.6, reviewCount: 11, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop",
    description: "iPad Air available for semester-long rentals. Great for note-taking, reading PDFs, and online classes. Comes with a protective case and charger.",
  },
  // ── Rental Furniture ──────────────────────────────────────────────────────
  {
    name: "Study Table & Chair Set Rental", category: "rental_furniture",
    address: "Furniture Mart, Transport Nagar", distance: 1.5,
    priceRange: "₹300 - ₹500/month", contact: "+91 59012 34567",
    amenities: ["Wooden Table", "Cushioned Chair", "Storage Drawer", "Free Delivery", "Setup Included"],
    rating: 4.4, reviewCount: 31, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
    description: "Sturdy study table and ergonomic chair rental for students. Free delivery and setup within 5km of campus. Monthly and semester packages available.",
  },
  {
    name: "Single Bed with Mattress Rental", category: "rental_furniture",
    address: "Sector 9, Near Girls Hostel", distance: 0.8,
    priceRange: "₹500 - ₹800/month", contact: "+91 48901 23456",
    amenities: ["Single Bed Frame", "6 inch Mattress", "Pillow", "Free Delivery", "Pickup on Exit"],
    rating: 4.2, reviewCount: 19, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    description: "Single bed with comfortable mattress. Perfect for students moving into unfurnished rooms or PGs. Delivery, setup and pickup all included in the price.",
  },
  {
    name: "Full Room Furniture Package", category: "rental_furniture",
    address: "Home Furnishings Hub, Civil Lines", distance: 2.2,
    priceRange: "₹1,200 - ₹2,000/month", contact: "+91 37890 12345",
    amenities: ["Bed + Mattress", "Study Table", "Chair", "Wardrobe", "Shoe Rack", "Free Setup"],
    rating: 4.7, reviewCount: 43, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    description: "Complete room furniture bundle — bed, study table, chair, and wardrobe. Best value package for students moving into bare rooms or new flats. Semester discounts available.",
  },
  {
    name: "Fridge Rental (180L Single Door)", category: "rental_furniture",
    address: "Appliance Rentals, MG Road", distance: 1.8,
    priceRange: "₹600 - ₹900/month", contact: "+91 26789 01234",
    amenities: ["180L Capacity", "Energy Efficient", "1 Year Warranty", "Installation Included"],
    rating: 4.0, reviewCount: 16, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    description: "Compact single-door fridge ideal for shared flats and PG rooms. Energy-efficient model with 1-year service warranty. Minimum 3-month rental.",
  },
  {
    name: "SwiftShift Movers & Packers", category: "movers_packers",
    address: "12, Industrial Area, Near Bus Stand", distance: 2.5,
    priceRange: "₹1,500 - ₹6,000 per shift", contact: "+91 91234 56789",
    amenities: ["Packing Materials", "Loading & Unloading", "Within City", "Intercity", "Fragile Handling", "Same Day"],
    rating: 4.5, reviewCount: 34, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Trusted student-friendly movers serving campus relocations for 5+ years. Affordable rates, professional packing, and same-day availability for small room shifts.",
  },
  {
    name: "Campus Cargo Packers", category: "movers_packers",
    address: "88, Shivaji Nagar, Opposite Railway Station", distance: 3.0,
    priceRange: "₹999 - ₹4,500 per shift", contact: "+91 80987 65432",
    amenities: ["Mini Truck", "Tempo Available", "Packing Boxes", "Bubble Wrap", "Labour Included"],
    rating: 4.3, reviewCount: 19, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop",
    description: "Budget movers for students relocating hostels, PGs, and flats. Mini trucks and tempos available on short notice with all packing supplies included.",
  },
  {
    name: "SafeMove Relocation Services", category: "movers_packers",
    address: "Plot 22, Transport Nagar, Ring Road", distance: 3.8,
    priceRange: "₹2,000 - ₹9,000 per shift", contact: "+91 72345 67890",
    amenities: ["GPS Tracked Trucks", "Insurance Included", "Office Shifting", "Furniture Assembly", "Pan-India"],
    rating: 4.7, reviewCount: 56, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop",
    description: "Premium relocation service with GPS-tracked trucks and full goods insurance. Specialises in intercity student moves and office relocations. Professional team, zero damage record.",
  },
  {
    name: "QuickPack Express", category: "movers_packers",
    address: "7, Vidhyadhar Nagar, Near College Road", distance: 1.8,
    priceRange: "₹800 - ₹3,000 per shift", contact: "+91 63456 78901",
    amenities: ["Hostel Room Shifting", "Same Day Available", "Bike Transport", "Packing Boxes"],
    rating: 4.1, reviewCount: 28, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    description: "Specialised in hostel and PG room shifting. Perfect for students moving between accommodations mid-semester. Available same-day on short notice.",
  },
  {
    name: "Bharat Cargo Solutions", category: "movers_packers",
    address: "45, Malviya Nagar, Near Overbridge", distance: 4.2,
    priceRange: "₹3,500 - ₹15,000 per shift", contact: "+91 54567 89012",
    amenities: ["Heavy Goods", "Warehouse Storage", "Intercity", "Wooden Crating", "Crane Available"],
    rating: 4.2, reviewCount: 41, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop",
    description: "Full-service cargo and relocation for home shifting, office moves, and heavy machinery. Warehouse storage available for gap periods between accommodations.",
  },
  {
    name: "EcoMove Student Packers", category: "movers_packers",
    address: "3, Govind Marg, Jagatpura", distance: 2.1,
    priceRange: "₹699 - ₹2,500 per shift", contact: "+91 45678 90123",
    amenities: ["Eco-Friendly Packing", "Bicycle & Scooter Transport", "Student Discount", "Weekend Slots"],
    rating: 4.4, reviewCount: 22, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=600&h=400&fit=crop",
    description: "Budget movers using eco-friendly packing material. Special student discount packages. Also transport bikes, scooters, and cycles during semester breaks.",
  },
];

const partnerOffers = [
  {
    title: "₹500 OFF on First Shift", description: "Book SwiftShift Movers for your next hostel or PG relocation and get ₹500 off your first booking.",
    category: "movers_packers", discountText: "₹500 OFF", partnerName: "SwiftShift Movers & Packers",
    partnerContact: "+91 91234 56789", couponCode: "CCMOVE500",
    validUntil: THREE_MONTHS(),
  },
  {
    title: "20% off on Monthly Laundry", description: "Get 20% off on SpinCycle monthly subscription plans for app users.",
    category: "laundry", discountText: "20% OFF", partnerName: "SpinCycle Laundry",
    partnerContact: "+91 90123 45678", couponCode: "CC20WASH",
    validUntil: THREE_MONTHS(),
  },
  {
    title: "First Month Mess at ₹1,999", description: "New students get their first month at Annapurna Mess for just ₹1,999.",
    category: "mess", discountText: "₹200 OFF", partnerName: "Annapurna Student Mess",
    partnerContact: "+91 44321 09870", couponCode: "CCMESS1ST",
    validUntil: ONE_MONTH(),
  },
  {
    title: "Tiffin Combo — Save ₹300", description: "Subscribe to Maa Tiffin for lunch + dinner combo and save ₹300/month.",
    category: "tiffin", discountText: "₹300 OFF", partnerName: "Maa Tiffin Service",
    partnerContact: "+91 89012 34567", couponCode: "CCTIFFIN",
    validUntil: THREE_MONTHS(),
  },
  {
    title: "Free WiFi Installation", description: "New NetSpeed connections via CampusConnect get free installation (worth ₹499).",
    category: "wifi", discountText: "FREE INSTALL", partnerName: "NetSpeed WiFi Solutions",
    partnerContact: "+91 56789 01234", couponCode: "CCWIFI",
    validUntil: THREE_MONTHS(),
  },
  {
    title: "15% Off Printing & Binding", description: "Show your CampusConnect profile at BookWorld for 15% off all printing orders.",
    category: "stationery", discountText: "15% OFF", partnerName: "BookWorld Stationery",
    partnerContact: "+91 54321 09876", couponCode: "CCPRINT15",
    validUntil: ONE_MONTH(),
  },
  {
    title: "Library Membership — ₹100 Off", description: "First month library membership at Knowledge Hub for CampusConnect users.",
    category: "library", discountText: "₹100 OFF", partnerName: "Knowledge Hub Library",
    partnerContact: "+91 67890 12345", couponCode: "CCLIB100",
    validUntil: THREE_MONTHS(),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await User.deleteMany({});
  await Listing.deleteMany({});
  await Review.deleteMany({});
  const { PartnerOffer } = require("../models/partner.model") ? { PartnerOffer: require("../models/partner.model") } : {};
  if (PartnerOffer) await PartnerOffer.deleteMany({});
  await College.deleteMany({});

  // Drop stale googleId index (may have been created without sparse:true)
  try {
    await mongoose.connection.collection("users").dropIndex("googleId_1");
    console.log("🔧  Dropped old googleId index");
  } catch (_) { /* index may not exist — that's fine */ }

  console.log("🗑️  Cleared existing data");

  // Users
  const admin   = await User.create({ name: "Admin",           email: "admin@campusconnect.com",   password: "Admin@1234",   role: "admin" });
  const owner   = await User.create({ name: "Raunak (Owner)",  email: "owner@campusconnect.com",   password: "Owner@1234",   role: "employee" });
  const student = await User.create({ name: "Demo Student",    email: "student@campusconnect.com", password: "Student@1234", role: "student",
    roommatePrefs: { smoking: "no", drinking: "no", sleepSchedule: "early_bird", cleaniness: "very_clean", noise: "quiet", guests: "rarely", studying: "library", diet: "veg", pets: "okay", budget: 7000, openToRoommate: true, bio: "CS final year, early riser, love cooking. Looking for a neat flatmate." },
  });

  // Demo roommate profiles — seeded so the finder has visible matches
  const roommateUsers = [
    { name: "Arjun Mehta",    email: "arjun@demo.cc",   password: "Demo@1234", role: "student", collegeName: "IIT Delhi",      roommatePrefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"rarely",    studying:"library", diet:"veg",          pets:"okay",     budget:8000,  openToRoommate:true, bio:"Mechanical engg, plays guitar, tidy." } },
    { name: "Priya Sharma",   email: "priya@demo.cc",   password: "Demo@1234", role: "student", collegeName: "Delhi University",roommatePrefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"moderate", guests:"sometimes", studying:"both",    diet:"veg",          pets:"love",     budget:6000,  openToRoommate:true, bio:"Arts student, yoga in the mornings." } },
    { name: "Karan Singh",    email: "karan@demo.cc",   password: "Demo@1234", role: "student", collegeName: "DTU",            roommatePrefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"at_home", diet:"non_veg",      pets:"okay",     budget:9000,  openToRoommate:true, bio:"Software dev student, WFH types." } },
    { name: "Sneha Patel",    email: "sneha@demo.cc",   password: "Demo@1234", role: "student", collegeName: "BITS Pilani",    roommatePrefs: { smoking:"no", drinking:"no",           sleepSchedule:"night_owl",  cleaniness:"moderate",   noise:"quiet",    guests:"rarely",    studying:"library", diet:"vegan",        pets:"allergic", budget:7500,  openToRoommate:true, bio:"Design student, night coder, loves plants." } },
    { name: "Rahul Verma",    email: "rahul@demo.cc",   password: "Demo@1234", role: "student", collegeName: "NIT Trichy",     roommatePrefs: { smoking:"occasionally", drinking:"occasionally", sleepSchedule:"night_owl", cleaniness:"relaxed", noise:"lively", guests:"often", studying:"at_home", diet:"non_veg", pets:"love", budget:5000, openToRoommate:true, bio:"Party person, social butterfly, weekend trips." } },
    { name: "Ananya Rao",     email: "ananya@demo.cc",  password: "Demo@1234", role: "student", collegeName: "IIT Bombay",     roommatePrefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"never",     studying:"library", diet:"veg",          pets:"okay",     budget:10000, openToRoommate:true, bio:"Research scholar, introvert, loves cats." } },
    { name: "Dev Kapoor",     email: "dev@demo.cc",     password: "Demo@1234", role: "student", collegeName: "Pune University",roommatePrefs: { smoking:"no", drinking:"occasionally", sleepSchedule:"flexible",   cleaniness:"moderate",   noise:"moderate", guests:"sometimes", studying:"both",    diet:"no_preference",pets:"okay",     budget:6500,  openToRoommate:true, bio:"MBA student, gym bro, cooks on weekends." } },
    { name: "Meera Iyer",     email: "meera@demo.cc",   password: "Demo@1234", role: "student", collegeName: "Anna University",roommatePrefs: { smoking:"no", drinking:"no",           sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet",    guests:"rarely",    studying:"library", diet:"veg",          pets:"love",     budget:5500,  openToRoommate:true, bio:"Biotech, early mornings, South Indian cooking." } },
  ];
  for (const u of roommateUsers) {
    await User.create(u);
  }
  console.log(`✅ ${roommateUsers.length + 3} users created (incl. ${roommateUsers.length} demo roommate profiles)`);

  // Listings
  const created = await Listing.insertMany(listings.map((l) => ({ ...l, createdBy: admin._id })));
  console.log(`✅ ${created.length} listings seeded (all 16 categories)`);

  const byName = {};
  created.forEach((l) => { byName[l.name] = l._id; });

  // Reviews
  await Review.insertMany([
    { listingId: byName["Sunrise Boys Hostel"],    userName: "Rahul K.",    rating: 5, comment: "Best hostel near campus! Clean rooms and great food.",          date: "2025-12-15" },
    { listingId: byName["Sunrise Boys Hostel"],    userName: "Amit S.",     rating: 4, comment: "Good facilities but Wi-Fi could be better.",                    date: "2025-11-28" },
    { listingId: byName["Lakshmi Girls PG"],       userName: "Anjali P.",   rating: 5, comment: "Safe and comfortable. Feels like home.",                        date: "2025-12-20" },
    { listingId: byName["Lakshmi Girls PG"],       userName: "Meera V.",    rating: 5, comment: "The 3D tour was super helpful before shifting!",                date: "2026-01-15" },
    { listingId: byName["Green Valley Flats"],     userName: "Rohan S.",    rating: 4, comment: "Spacious flat, good locality. Slightly expensive.",             date: "2026-01-10" },
    { listingId: byName["Annapurna Student Mess"], userName: "Suresh M.",   rating: 5, comment: "Best mess food I've had outside home. Highly recommend!",       date: "2026-02-01" },
    { listingId: byName["Campus Bites Café"],      userName: "Priya M.",    rating: 5, comment: "Amazing butter chicken! My daily go-to place.",                 date: "2026-01-10" },
    { listingId: byName["Campus Bites Café"],      userName: "Sneha R.",    rating: 4, comment: "Great food, sometimes crowded during lunch.",                   date: "2026-02-01" },
    { listingId: byName["Sharma Juice Corner"],    userName: "Karthik V.",  rating: 5, comment: "Best mango shake in the area, hands down!",                    date: "2026-01-22" },
    { listingId: byName["BookWorld Stationery"],   userName: "Vikram D.",   rating: 4, comment: "Quick printing service and reasonable prices.",                 date: "2026-02-10" },
    { listingId: byName["MedPlus Pharmacy"],       userName: "Neha T.",     rating: 4, comment: "24/7 availability is a lifesaver during exams.",               date: "2026-01-05" },
    { listingId: byName["SpinCycle Laundry"],      userName: "Deepa K.",    rating: 4, comment: "Great service, clothes come back super clean.",                 date: "2026-01-20" },
    { listingId: byName["Maa Tiffin Service"],     userName: "Arjun P.",    rating: 5, comment: "Just like mom's cooking. Worth every rupee.",                  date: "2026-02-05" },
    { listingId: byName["Knowledge Hub Library"],  userName: "Simran B.",   rating: 5, comment: "Perfect place for exam prep. Love the silence zones.",          date: "2026-01-30" },
    { listingId: byName["Chef Ramesh — Private Cook"], userName: "Nisha G.", rating: 5, comment: "Amazing cook, very hygienic. My flatmates love him too.",     date: "2026-02-12" },
  ]);
  console.log("✅ Reviews seeded");

  // Partner offers
  const PO = require("../models/partner.model");
  await PO.insertMany(partnerOffers.map((o) => ({ ...o, createdBy: admin._id, isActive: true })));
  console.log(`✅ ${partnerOffers.length} partner offers seeded`);

  
  // ── Colleges ─────────────────────────────────────────────────────────────────
  const colleges = [
    { name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", city: "Delhi", state: "Delhi" },
    { name: "Delhi University - North Campus", shortName: "DU North", city: "Delhi", state: "Delhi" },
    { name: "Delhi University - South Campus", shortName: "DU South", city: "Delhi", state: "Delhi" },
    { name: "Jawaharlal Nehru University", shortName: "JNU", city: "Delhi", state: "Delhi" },
    { name: "Jamia Millia Islamia", shortName: "JMI", city: "Delhi", state: "Delhi" },
    { name: "Delhi Technological University", shortName: "DTU", city: "Delhi", state: "Delhi" },
    { name: "Netaji Subhas University of Technology", shortName: "NSUT", city: "Delhi", state: "Delhi" },
    { name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", city: "Mumbai", state: "Maharashtra" },
    { name: "University of Mumbai", shortName: "Mumbai University", city: "Mumbai", state: "Maharashtra" },
    { name: "VJTI Mumbai", shortName: "VJTI", city: "Mumbai", state: "Maharashtra" },
    { name: "Indian Institute of Science", shortName: "IISc", city: "Bangalore", state: "Karnataka" },
    { name: "Bangalore University", shortName: "BU", city: "Bangalore", state: "Karnataka" },
    { name: "RV College of Engineering", shortName: "RVCE", city: "Bangalore", state: "Karnataka" },
    { name: "PES University", shortName: "PESU", city: "Bangalore", state: "Karnataka" },
    { name: "Indian Institute of Technology Madras", shortName: "IIT Madras", city: "Chennai", state: "Tamil Nadu" },
    { name: "Anna University", shortName: "Anna University", city: "Chennai", state: "Tamil Nadu" },
    { name: "Indian Institute of Technology Hyderabad", shortName: "IIT Hyderabad", city: "Hyderabad", state: "Telangana" },
    { name: "University of Hyderabad", shortName: "UoH", city: "Hyderabad", state: "Telangana" },
    { name: "BITS Pilani Hyderabad Campus", shortName: "BITS Hyderabad", city: "Hyderabad", state: "Telangana" },
    { name: "Savitribai Phule Pune University", shortName: "SPPU", city: "Pune", state: "Maharashtra" },
    { name: "College of Engineering Pune", shortName: "COEP", city: "Pune", state: "Maharashtra" },
    { name: "BITS Pilani", shortName: "BITS Pilani", city: "Pilani", state: "Rajasthan" },
    { name: "Indian Institute of Technology Kharagpur", shortName: "IIT KGP", city: "Kharagpur", state: "West Bengal" },
    { name: "Jadavpur University", shortName: "JU", city: "Kolkata", state: "West Bengal" },
    { name: "Indian Institute of Technology Kanpur", shortName: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh" },
    { name: "Indian Institute of Technology Roorkee", shortName: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand" },
    { name: "National Institute of Technology Trichy", shortName: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu" },
    { name: "National Institute of Technology Warangal", shortName: "NIT Warangal", city: "Warangal", state: "Telangana" },
    { name: "National Institute of Technology Surathkal", shortName: "NITK", city: "Surathkal", state: "Karnataka" },
    { name: "Other / Not Listed", shortName: "Other", city: "India", state: "India" },
  ];
  await College.insertMany(colleges);
  console.log(`✅ ${colleges.length} colleges seeded`);

  console.log("\n🎉 Seed complete! Start with: npm run dev");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
