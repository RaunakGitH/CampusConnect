require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/user.model");
const Listing  = require("../models/listing.model");
const Review   = require("../models/review.model");
const College  = require("../models/college.model");

const ONE_MONTH    = () => { const d = new Date(); d.setMonth(d.getMonth() + 1);  return d; };
const THREE_MONTHS = () => { const d = new Date(); d.setMonth(d.getMonth() + 3);  return d; };
const SIX_MONTHS   = () => { const d = new Date(); d.setMonth(d.getMonth() + 6);  return d; };

const listings = [
  // HOSTELS
  {
    name: "Shree Ram Boys Hostel", category: "hostel",
    address: "Plot 14, Sector 5, Kukas Industrial Area, Jaipur - 302028", distance: 0.4,
    priceRange: "₹3,500 - ₹5,500/month", contact: "+91 94141 12345",
    amenities: ["Wi-Fi","RO Water","Mess","Laundry","Parking","24/7 Security","Power Backup"],
    rating: 4.2, reviewCount: 53, verified: true,
    sharingType: "Double / Triple", capacity: 80, mealsIncluded: true, isAvailable: true, availableRooms: 12,
    rules: ["No smoking/alcohol","Curfew 10:30 PM","No outside guests"],
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    description: "Popular hostel among Arya College and JEC students. Walking distance from Kukas campus zone. Includes mess, 24/7 security, and reliable Wi-Fi. Monthly and semester packages available.",
  },
  {
    name: "Jai Bhawani Girls Hostel", category: "hostel",
    address: "Near Kukas Bus Stand, Delhi Highway (NH-48), Jaipur - 302028", distance: 0.6,
    priceRange: "₹4,000 - ₹6,500/month", contact: "+91 98290 67890",
    amenities: ["Wi-Fi","AC Rooms","Meals","CCTV","Geyser","Study Hall","Warden"],
    rating: 4.5, reviewCount: 78, verified: true,
    sharingType: "Single / Double", capacity: 60, mealsIncluded: true, isAvailable: true, availableRooms: 6,
    rules: ["Girls only","No visitors after 8 PM","Biometric entry"],
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    description: "One of the most trusted girls hostels near Kukas. Biometric entry, homely meals three times a day. 10-minute walk from Arya College gate.",
  },
  {
    name: "New Sai Nath Boys Hostel", category: "hostel",
    address: "Gram Panchayat Road, Behind SBI ATM, Kukas, Jaipur - 302028", distance: 0.3,
    priceRange: "₹3,000 - ₹4,500/month", contact: "+91 97841 33210",
    amenities: ["Wi-Fi","Mess","RO Water","Parking","24/7 Water Supply"],
    rating: 3.9, reviewCount: 34, verified: false,
    sharingType: "Triple / Quad", capacity: 100, mealsIncluded: true, isAvailable: true, availableRooms: 20,
    rules: ["No alcohol","Gates close at 11 PM"],
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&h=400&fit=crop",
    description: "Budget-friendly hostel catering to engineering students. Large capacity with affordable triple and quad sharing. Mess serves Rajasthani thali daily.",
  },
  // PG
  {
    name: "Pooja PG for Girls", category: "pg",
    address: "E-45, Vishwakarma Nagar, Near Kukas Crossing, Jaipur - 302028", distance: 0.7,
    priceRange: "₹4,500 - ₹7,000/month", contact: "+91 94600 55123",
    amenities: ["Wi-Fi","Home-cooked Meals","Geyser","Washing Machine","CCTV","Study Table"],
    rating: 4.4, reviewCount: 41, verified: true,
    sharingType: "Single / Double", mealsIncluded: true, capacity: 24, isAvailable: true, availableRooms: 3,
    rules: ["Girls only","No visitors after 9 PM","No outside food in rooms"],
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    description: "Homely PG run by a retired teacher. Fresh Rajasthani meals and caring environment. AC and non-AC options available.",
  },
  {
    name: "Sharma PG — Working Men", category: "pg",
    address: "Plot 7, Kukas Industrial Zone, Near Honda Dealership, Jaipur", distance: 0.9,
    priceRange: "₹4,000 - ₹6,000/month", contact: "+91 98731 22456",
    amenities: ["Wi-Fi","Meals Optional","Parking (2-Wheeler)","Power Backup","AC"],
    rating: 4.1, reviewCount: 22, verified: false,
    sharingType: "Single / Double", capacity: 20, mealsIncluded: false, isAvailable: true, availableRooms: 4,
    rules: ["No loud music after 10 PM","Monthly rent in advance"],
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    description: "PG suited for working professionals in Kukas and Mahindra SEZ industrial area. Meal plan optional. 5 min from NH-48.",
  },
  // FLATS
  {
    name: "Shiv Shakti Apartments — 2BHK", category: "flat",
    address: "B-12, Shiv Shakti Colony, Kukas, Jaipur - 302028", distance: 1.1,
    priceRange: "₹8,000 - ₹11,000/month", contact: "+91 99280 11234",
    amenities: ["Parking","Power Backup","Terrace Access","24/7 Water"],
    rating: 4.0, reviewCount: 14, verified: true,
    bhk: "2BHK", furnished: "semi-furnished", isAvailable: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    description: "Semi-furnished 2BHK in Shiv Shakti Colony — ideal for 2-3 students. Close to Kukas main market and bus stand.",
  },
  {
    name: "Rajputana Studio Flat — Furnished", category: "flat",
    address: "Near Kukas Police Chowki, Jaipur-Delhi Highway, Jaipur - 302028", distance: 0.8,
    priceRange: "₹5,500 - ₹7,500/month", contact: "+91 96601 44512",
    amenities: ["Wi-Fi","Geyser","Parking","Security Guard"],
    rating: 4.2, reviewCount: 9, verified: false,
    bhk: "1BHK", furnished: "furnished", isAvailable: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    description: "Fully furnished 1BHK studio — perfect for a working professional or student. Kitchen appliances included.",
  },
  // PRIVATE ROOM
  {
    name: "Krishna Private AC Room", category: "private_room",
    address: "Lane 3, Near Petrol Pump, Kukas Chauraha, Jaipur - 302028", distance: 0.5,
    priceRange: "₹5,000 - ₹7,000/month", contact: "+91 89496 33211",
    amenities: ["AC","Attached Bath","Wi-Fi","Geyser","Study Table"],
    rating: 4.3, reviewCount: 17, verified: true,
    sharingType: "Single", capacity: 8, mealsIncluded: false, isAvailable: true, availableRooms: 2,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    description: "Fully private AC room with attached bathroom. Ideal for students who want personal space close to Kukas educational zone.",
  },
  // DORMITORY
  {
    name: "Budget Dorm — Kukas Zone", category: "dormitory",
    address: "Near Arya College Back Gate, Kukas, Jaipur - 302028", distance: 0.2,
    priceRange: "₹2,000 - ₹3,000/month", contact: "+91 77834 55120",
    amenities: ["Mess","Lockers","Common Bath","24/7 Water","Wi-Fi"],
    rating: 3.8, reviewCount: 56, verified: false,
    sharingType: "Dormitory (6-10 beds)", capacity: 150, mealsIncluded: true, isAvailable: true, availableRooms: 25,
    rules: ["No outside guests","Lights out 11 PM"],
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&h=400&fit=crop",
    description: "Most affordable stay near Arya College. Clean dorms with secure lockers. Good for first-year students on tight budgets.",
  },
  // MESS
  {
    name: "Shiv Shakti Mess", category: "mess",
    address: "Near Arya College of Engineering Gate, Kukas, Jaipur - 302028", distance: 0.1,
    priceRange: "₹1,800 - ₹2,800/month", contact: "+91 94143 21100",
    amenities: ["Veg","Non-Veg Option","Breakfast","Lunch","Dinner","Sunday Special Thali"],
    rating: 4.4, reviewCount: 245, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop",
    description: "Oldest and most popular mess right outside Arya College gate. Dal baati churma every Sunday. Monthly veg ₹1,800, veg+non-veg ₹2,500. Unlimited dal-sabzi-roti.",
    monthlyPackage: 2200, perMealRate: 55, mealsPerDay: 3,
  },
  {
    name: "Rajdhani Student Mess", category: "mess",
    address: "Shop 3, Kukas Industrial Area Market, Behind JEC Campus, Jaipur", distance: 0.3,
    priceRange: "₹2,000 - ₹3,200/month", contact: "+91 98284 55678",
    amenities: ["Veg","Non-Veg","Breakfast","Dinner","Takeaway"],
    rating: 4.1, reviewCount: 118, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    description: "Well-known mess among JEC and Arya College students. Serves Rajasthani home food — dal, kadhi, sabzi, roti unlimited. Trial meal available.",
    monthlyPackage: 2400, perMealRate: 60, mealsPerDay: 2,
  },
  {
    name: "Maa Vaishno Dhaba & Mess", category: "mess",
    address: "Opp. Mahindra SEZ Entry, Kukas, NH-48, Jaipur - 302028", distance: 1.2,
    priceRange: "₹1,600 - ₹2,500/month", contact: "+91 76548 90123",
    amenities: ["Pure Veg","Breakfast","Lunch","Dinner"],
    rating: 4.0, reviewCount: 67, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop",
    description: "Budget pure-veg mess near Mahindra SEZ. Simple wholesome Rajasthani meals at very low prices.",
    monthlyPackage: 1800, perMealRate: 45, mealsPerDay: 3,
  },
  // FOOD
  {
    name: "Bhaiya Ji Dhaba", category: "food",
    address: "NH-48 Delhi Highway, Near Kukas Toll, Jaipur - 302028", distance: 0.2,
    priceRange: "₹60 - ₹200", contact: "+91 94141 98765",
    amenities: ["Dine-in","Takeaway","Pure Veg","Paratha Stall","Lassi","24/7 Open"],
    rating: 4.6, reviewCount: 312, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop",
    description: "Legendary 24/7 highway dhaba. Famous for stuffed parathas, makki ki roti (winters), and thick lassi. Students from all nearby colleges swear by this place.",
  },
  {
    name: "Café Adda — Student Hangout", category: "food",
    address: "Shop 12, Kukas Main Market, Near SBI Bank, Jaipur - 302028", distance: 0.4,
    priceRange: "₹50 - ₹300", contact: "+91 97832 11456",
    amenities: ["Dine-in","Wi-Fi","Cold Coffee","Maggi","Sandwiches","Swiggy"],
    rating: 4.5, reviewCount: 189, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    description: "Most popular student café near Arya College and JEC. Free Wi-Fi, power sockets at every table. Cold coffee is a must-try. Late night maggi available till midnight.",
  },
  {
    name: "Natraj Fast Food & Juice Corner", category: "food",
    address: "Opp. Arya College of Engineering, Kukas, Jaipur", distance: 0.1,
    priceRange: "₹30 - ₹120", contact: "+91 89490 22345",
    amenities: ["Juice Bar","Momos","Burger","Samosa","Takeaway"],
    rating: 4.3, reviewCount: 156, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    description: "Right at Arya College gate. Go-to spot for between-class snacks — momos, fresh sugarcane juice, burgers. Breakfast from 7 AM.",
  },
  {
    name: "Domino's Pizza — Kukas Circle", category: "food",
    address: "Ground Floor, Axis Mall Road, Near Kukas Circle, Jaipur - 302028", distance: 1.5,
    priceRange: "₹199 - ₹700", contact: "+91 1800 208 1234",
    amenities: ["Dine-in","Takeaway","Delivery","Zomato","Swiggy"],
    rating: 4.2, reviewCount: 94, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    description: "Nearest Domino's to Kukas campus. Popular weekend treat. Tuesday offers and combo deals. Delivery in 30 min to most PG/hostel zones.",
  },
  // TIFFIN
  {
    name: "Geeta Tiffin Service", category: "tiffin",
    address: "House 22, Vishwakarma Nagar, Kukas, Jaipur - 302028", distance: 0.6,
    priceRange: "₹2,000 - ₹2,800/month", contact: "+91 94606 77890",
    amenities: ["Home Delivery","Veg","Dal Roti Sabzi","Monthly Plans","Trial Available"],
    rating: 4.6, reviewCount: 88, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    description: "Home-cooked Rajasthani tiffin delivered to your doorstep. Geeta aunty has been serving Kukas students for 8+ years. Lunch + dinner combo ₹2,200/month. Free trial available.",
  },
  {
    name: "Shiv Tiffin Service", category: "tiffin",
    address: "Near Petrol Pump, Gram Road, Kukas, Jaipur - 302028", distance: 0.8,
    priceRange: "₹1,800 - ₹2,500/month", contact: "+91 98294 43210",
    amenities: ["Delivery","Veg & Non-Veg","Lunch Only","Dinner Only","Both Options"],
    rating: 4.2, reviewCount: 55, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop",
    description: "Affordable tiffin with veg and non-veg. Delivery within 2 km of Kukas. Lunch-only ₹1,200, dinner-only ₹1,400, both ₹2,200.",
  },
  // STATIONERY
  {
    name: "Ravi Book Depot & Stationery", category: "stationery",
    address: "Shop 5, Kukas Market, Near Bus Stand, Jaipur - 302028", distance: 0.3,
    priceRange: "₹5 - ₹2,000", contact: "+91 97823 55678",
    amenities: ["Xerox","Binding","Spiral Binding","Engineering Drawing Sets","All Semester Books"],
    rating: 4.5, reviewCount: 234, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
    description: "Most stocked stationery near Arya College and JEC. Engineering textbooks, drawing sets, lab manuals, xerox at ₹0.70/page. Opens 8 AM.",
  },
  {
    name: "Singh Xerox & Print Studio", category: "stationery",
    address: "Opp. JEC Main Gate, Kukas Industrial Area, Jaipur", distance: 0.2,
    priceRange: "₹1 - ₹500", contact: "+91 76547 88901",
    amenities: ["Colour Print","B&W Xerox","Spiral Binding","ID Cards","Lamination","A3 Print"],
    rating: 4.4, reviewCount: 178, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop",
    description: "One-stop print shop at JEC gate. Colour A4 ₹5, B&W ₹1, spiral binding ₹30. Project reports same day.",
  },
  // MEDICAL
  {
    name: "Jan Aushadhi Kendra — Kukas", category: "medical",
    address: "Near Kukas Police Station, Delhi Highway, Jaipur - 302028", distance: 0.5,
    priceRange: "Generic pricing (50-90% cheaper)", contact: "+91 94148 12321",
    amenities: ["Generic Medicines","Open 8AM-9PM","Doctor Consult Sat"],
    rating: 4.3, reviewCount: 89, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop",
    description: "Government-approved generic pharmacy — same medicines at 50-90% less. Doctor consultation every Saturday.",
  },
  {
    name: "Surya Medical Store — 24/7", category: "medical",
    address: "Shop 2, Near HDFC Bank ATM, Kukas Chauraha, Jaipur - 302028", distance: 0.4,
    priceRange: "MRP", contact: "+91 98283 34567",
    amenities: ["24/7 Open","All Brands","FMCG Products","Emergency Medicines"],
    rating: 4.1, reviewCount: 143, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&h=400&fit=crop",
    description: "24/7 medical store at the main Kukas crossing. Reliable for emergency medicines at night. Also stocks hygiene products.",
  },
  // LAUNDRY
  {
    name: "Fresh & Clean Laundry — Kukas", category: "laundry",
    address: "Shop 8, Arya Nagar, Near Arya College Back Gate, Kukas, Jaipur", distance: 0.3,
    priceRange: "₹30-80/kg · ₹499/month unlimited", contact: "+91 97824 11223",
    amenities: ["Wash & Fold","Dry Cleaning","Ironing","Pickup & Delivery","Weekly Plans"],
    rating: 4.4, reviewCount: 112, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop",
    description: "Most popular laundry among hostel students. Free pickup within 1 km. Express same-day service available. Monthly unlimited plan ₹499.",
  },
  {
    name: "Rajat Dry Cleaners", category: "laundry",
    address: "Opp. SBI Branch, Kukas Main Road, Jaipur - 302028", distance: 0.7,
    priceRange: "₹50-300 per item", contact: "+91 89492 55443",
    amenities: ["Dry Cleaning","Steam Press","Suit Cleaning","Bulk Order"],
    rating: 4.0, reviewCount: 47, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&h=400&fit=crop",
    description: "Professional dry cleaning and steam pressing. Preferred for formals, blazers. 2-day turnaround. Pickup for 5+ items.",
  },
  // TRANSPORT
  {
    name: "Shyam Auto — Kukas Cab Service", category: "transport",
    address: "Near Kukas Bus Stand, Delhi Road, Jaipur - 302028", distance: 0.1,
    priceRange: "₹10/km shared · ₹250 airport drop", contact: "+91 94141 66789",
    amenities: ["Jaipur City","Airport Drop","Railway Station","Shared Cab","Night Service"],
    rating: 4.2, reviewCount: 78, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop",
    description: "Trusted local cab covering Kukas to Jaipur city, railway station, and airport. Shared cabs to Tonk Phatak and Sodala regularly. 24/7.",
  },
  {
    name: "Kukas E-Rickshaw Stand", category: "transport",
    address: "Kukas Crossing, NH-48, Jaipur - 302028", distance: 0.1,
    priceRange: "₹10-30 per ride", contact: "+91 78901 23456",
    amenities: ["Campus Drop","Market Trips","Early Morning","Shared Rides"],
    rating: 3.8, reviewCount: 203, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "E-rickshaw at main Kukas crossing. Covers all hostel lanes, college gates, main market. Cheapest last-mile option. 6 AM to 10 PM.",
  },
  // WIFI
  {
    name: "Hathway Broadband — Kukas", category: "wifi",
    address: "Service Office: Shop 11, Kukas Market, Near Axis Bank, Jaipur", distance: 0.5,
    priceRange: "₹399-699/month", contact: "+91 1800 419 0095",
    amenities: ["100 Mbps","200 Mbps Plans","Unlimited Data","Free Installation","24/7 Support"],
    rating: 4.1, reviewCount: 56, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop",
    description: "Hathway broadband available in Kukas residential area. 100 Mbps unlimited ₹499/month. Free router. Local engineers based in Kukas.",
  },
  {
    name: "ACT Fibernet — Kukas Zone", category: "wifi",
    address: "Coverage: Kukas, Murlipura, Shyam Nagar sectors, Jaipur", distance: 0.8,
    priceRange: "₹599-1299/month", contact: "+91 1800 572 1600",
    amenities: ["300 Mbps","1 Gbps Plans","Unlimited Data","OTT Bundles","Static IP"],
    rating: 4.4, reviewCount: 38, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "ACT Fibernet now in Kukas zone. Plans from 100 Mbps. OTT bundle (Hotstar, SonyLIV) on higher plans. Good for online classes.",
  },
  // LIBRARY
  {
    name: "Gyan Sagar Study Library", category: "library",
    address: "1st Floor, Near Bank of Baroda ATM, Kukas Main Market, Jaipur", distance: 0.5,
    priceRange: "₹500-900/month", contact: "+91 97824 66789",
    amenities: ["AC Seating","Wi-Fi","Individual Cabins","CCTV","Locker","24/7 Open"],
    rating: 4.6, reviewCount: 134, verified: true,
    subscriptionPlan: "special", isFeatured: true, subscriptionExpiresAt: THREE_MONTHS(),
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop",
    description: "Best study library near Kukas for GATE, competitive exams, and semester prep. 80 seats, fully AC, individual cabins. Open 24/7 during exams. Monthly ₹600, 6-month ₹2,800.",
  },
  {
    name: "Saraswati Reading Room", category: "library",
    address: "Near Kukas Boys Hostel Zone, Sector 4, Jaipur - 302028", distance: 0.4,
    priceRange: "₹400-700/month", contact: "+91 88902 44321",
    amenities: ["AC","Wi-Fi","News & Magazines","Group Study","Morning Batch"],
    rating: 4.2, reviewCount: 67, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
    description: "Affordable reading room popular for last-minute exam prep. Morning batch (5 AM-12 PM) ₹300/month. Past question papers collection.",
  },
  // CYBER CAFÉ
  {
    name: "TechZone Cyber Café", category: "cyber_cafe",
    address: "Shop 3, Near JEC College Road, Kukas, Jaipur - 302028", distance: 0.2,
    priceRange: "₹30/hr · ₹10 printout", contact: "+91 76544 78901",
    amenities: ["High Speed Internet","Printing","Scanning","Online Forms","RPSC/JSSC Help"],
    rating: 4.0, reviewCount: 89, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop",
    description: "Cyber café near JEC and Arya College for exam registrations, bank work, resume printing. Also helps with JSSC/RPSC form filling.",
  },
  // COOK
  {
    name: "Ganesh Bhaiya — Private Cook", category: "cook",
    address: "Kukas & Nearby Areas, Jaipur (Home visits)", distance: 0.5,
    priceRange: "₹3,000-6,000/month (cooking only)", contact: "+91 94143 88765",
    amenities: ["Breakfast","Lunch","Dinner","Rajasthani Cuisine","North Indian","Weekly Menu"],
    rating: 4.7, reviewCount: 43, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    description: "Highly rated home cook for flat-sharing students. You provide groceries, Ganesh bhaiya cooks. Specialises in Rajasthani food. References available.",
  },
  // MOVERS
  {
    name: "Jaipur Packers & Movers — Kukas", category: "movers_packers",
    address: "Industrial Zone, Kukas, Near NH-48, Jaipur - 302028", distance: 1.0,
    priceRange: "₹1,500-6,000 (hostel/PG shift)", contact: "+91 97824 33100",
    amenities: ["Hostel Shifting","Within Jaipur","Intercity","Packing Material","Same Day"],
    rating: 4.3, reviewCount: 34, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Student-friendly packers in Kukas. Specialise in small hostel and PG shifts. Same-day for 1-2 room loads. No hidden charges.",
  },
  // RENTALS
  {
    name: "Ramesh Electronics Rental", category: "rental_electronics",
    address: "Shop 6, Kukas Main Market, Near HDFC Bank, Jaipur - 302028", distance: 0.5,
    priceRange: "₹800-2,500/month", contact: "+91 76543 00987",
    amenities: ["Laptop Rental","Tablet","Printer","Free Delivery","Insurance","Semester Plans"],
    rating: 4.3, reviewCount: 28, verified: true,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
    description: "Rent Dell/HP laptops from ₹800/month. Free delivery in Kukas. Refundable deposit. Ideal for students who can't afford to buy.",
  },
  {
    name: "Kukas Furniture Rental Hub", category: "rental_furniture",
    address: "Opp. Industrial Area Gate, Kukas, Jaipur - 302028", distance: 1.2,
    priceRange: "₹300-1,200/month", contact: "+91 89494 77654",
    amenities: ["Study Table","Chair","Bed + Mattress","Fridge Rental","Free Delivery","Assembly"],
    rating: 4.1, reviewCount: 19, verified: false,
    subscriptionPlan: "normal", subscriptionExpiresAt: ONE_MONTH(),
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
    description: "Furniture rental for students in unfurnished flats. Study table + chair ₹350/month. Bed + mattress from ₹600/month. Free assembly. Min 3 months.",
  },
];

const partnerOffers = [
  { title: "Geeta Tiffin — First Week Free Trial",   description: "Try Geeta aunty's tiffin for a week before subscribing. No payment needed.",                      category: "tiffin",          discountText: "7 Days Free",  partnerName: "Geeta Tiffin Service",          partnerContact: "+91 94606 77890", couponCode: "GEETATRIAL",  validUntil: THREE_MONTHS() },
  { title: "Fresh & Clean — 20% off First Month",    description: "New customers get 20% off first monthly laundry plan.",                                            category: "laundry",          discountText: "20% OFF",      partnerName: "Fresh & Clean Laundry",         partnerContact: "+91 97824 11223", couponCode: "CC20WASH",    validUntil: THREE_MONTHS() },
  { title: "Shiv Shakti Mess — ₹200 OFF",            description: "New students get ₹200 off first month subscription. Valid with CC student.",                       category: "mess",             discountText: "₹200 OFF",     partnerName: "Shiv Shakti Mess",              partnerContact: "+91 94143 21100", couponCode: "CCMESS200",   validUntil: THREE_MONTHS() },
  { title: "Gyan Sagar — 3 Months @ ₹1,500",         description: "Special CampusConnect package: 3 months + locker for ₹1,500.",                                     category: "library",          discountText: "₹300 OFF",     partnerName: "Gyan Sagar Study Library",      partnerContact: "+91 97824 66789", couponCode: "CCLIB3M",     validUntil: SIX_MONTHS()  },
  { title: "Ravi Book Depot — 15% off Textbooks",    description: "Engineering textbooks 15% off. Show CC app at counter.",                                            category: "stationery",       discountText: "15% OFF",      partnerName: "Ravi Book Depot",               partnerContact: "+91 97823 55678", couponCode: "CCPRINT15",   validUntil: THREE_MONTHS() },
  { title: "Jaipur Packers — ₹500 off Hostel Shift", description: "₹500 off any hostel/PG shift booked via CampusConnect.",                                           category: "movers_packers",   discountText: "₹500 OFF",     partnerName: "Jaipur Packers & Movers",       partnerContact: "+91 97824 33100", couponCode: "CCMOVE500",   validUntil: THREE_MONTHS() },
  { title: "Ramesh Electronics — Free Delivery",      description: "Free delivery + setup on any laptop/electronics rental via CampusConnect.",                        category: "other",            discountText: "Free Delivery", partnerName: "Ramesh Electronics Rental",    partnerContact: "+91 76543 00987", couponCode: "CCRENT0",     validUntil: THREE_MONTHS() },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  try {
    await mongoose.connection.collection("users").dropIndex("googleId_1");
    console.log("🔧  Dropped old googleId index");
  } catch (_) {}

  await User.deleteMany({});
  await Listing.deleteMany({});
  await Review.deleteMany({});
  const PO = require("../models/partner.model");
  await PO.deleteMany({});
  await College.deleteMany({});
  console.log("🗑️  Cleared existing data");

  const admin   = await User.create({ name: "Admin",           email: "admin@campusconnect.com",   password: "Admin@1234",   role: "admin" });
  const owner   = await User.create({ name: "Raunak (Owner)",  email: "owner@campusconnect.com",   password: "Owner@1234",   role: "employee" });
  await User.create({ name: "Demo Student", email: "student@campusconnect.com", password: "Student@1234", role: "student",
    collegeName: "Arya College of Engineering & IT",
    roommatePrefs: { smoking:"no", drinking:"no", sleepSchedule:"early_bird", cleaniness:"very_clean", noise:"quiet", guests:"rarely", studying:"library", diet:"veg", pets:"okay", budget:5000, openToRoommate:true, bio:"BTech final year Arya College. Early riser, tidy." },
  });

  const roommateUsers = [
    { name:"Aman Gupta",    email:"aman@demo.cc",    password:"Demo@1234", role:"student", collegeName:"Arya College of Engineering & IT",  roommatePrefs:{smoking:"no",drinking:"no",sleepSchedule:"early_bird",cleaniness:"very_clean",noise:"quiet",guests:"rarely",studying:"library",diet:"veg",pets:"okay",budget:5000,openToRoommate:true,bio:"CSE 3rd year. Library guy, veg, early to bed."} },
    { name:"Priya Agarwal", email:"priya@demo.cc",   password:"Demo@1234", role:"student", collegeName:"Jaipur Engineering College",         roommatePrefs:{smoking:"no",drinking:"no",sleepSchedule:"early_bird",cleaniness:"very_clean",noise:"moderate",guests:"sometimes",studying:"both",diet:"veg",pets:"love",budget:6000,openToRoommate:true,bio:"ECE at JEC. Yoga and cooking. Neat flatmate wanted."} },
    { name:"Rohit Sharma",  email:"rohit@demo.cc",   password:"Demo@1234", role:"student", collegeName:"Poornima University",                roommatePrefs:{smoking:"no",drinking:"occasionally",sleepSchedule:"flexible",cleaniness:"moderate",noise:"moderate",guests:"sometimes",studying:"at_home",diet:"non_veg",pets:"okay",budget:7000,openToRoommate:true,bio:"Mechanical at Poornima. Gym 5 days, weekend trips."} },
    { name:"Sneha Verma",   email:"sneha@demo.cc",   password:"Demo@1234", role:"student", collegeName:"Manipal University Jaipur",           roommatePrefs:{smoking:"no",drinking:"no",sleepSchedule:"night_owl",cleaniness:"moderate",noise:"quiet",guests:"rarely",studying:"library",diet:"veg",pets:"allergic",budget:7500,openToRoommate:true,bio:"IT at MUJ. Night owl coder."} },
    { name:"Karan Meena",   email:"karan@demo.cc",   password:"Demo@1234", role:"student", collegeName:"JECRC University",                   roommatePrefs:{smoking:"occasionally",drinking:"occasionally",sleepSchedule:"night_owl",cleaniness:"relaxed",noise:"lively",guests:"often",studying:"at_home",diet:"non_veg",pets:"love",budget:4500,openToRoommate:true,bio:"CSE at JECRC. Social, loves cricket."} },
    { name:"Anjali Joshi",  email:"anjali@demo.cc",  password:"Demo@1234", role:"student", collegeName:"LNM Institute of IT",                roommatePrefs:{smoking:"no",drinking:"no",sleepSchedule:"early_bird",cleaniness:"very_clean",noise:"quiet",guests:"never",studying:"library",diet:"vegan",pets:"okay",budget:8000,openToRoommate:true,bio:"MCA LNMIIT. Introvert, morning runs."} },
    { name:"Vijay Kumar",   email:"vijay@demo.cc",   password:"Demo@1234", role:"student", collegeName:"Arya College of Engineering & IT",  roommatePrefs:{smoking:"no",drinking:"occasionally",sleepSchedule:"flexible",cleaniness:"moderate",noise:"moderate",guests:"sometimes",studying:"both",diet:"no_preference",pets:"okay",budget:5500,openToRoommate:true,bio:"EE 2nd year Arya College. Guitar, badminton."} },
    { name:"Deepika Singh", email:"deepika@demo.cc", password:"Demo@1234", role:"student", collegeName:"Jaipur Engineering College",         roommatePrefs:{smoking:"no",drinking:"no",sleepSchedule:"early_bird",cleaniness:"very_clean",noise:"quiet",guests:"rarely",studying:"library",diet:"veg",pets:"love",budget:6000,openToRoommate:true,bio:"Civil at JEC. Loves cooking, responsible."} },
  ];
  for (const u of roommateUsers) await User.create(u);
  console.log(`✅ ${roommateUsers.length + 3} users created`);

  const created = await Listing.insertMany(listings.map(l => ({ ...l, createdBy: owner._id })));
  console.log(`✅ ${created.length} listings seeded (Kukas, Jaipur area)`);

  const byName = {};
  created.forEach(l => { byName[l.name] = l._id; });

  const reviews = [
    { listingId: byName["Shree Ram Boys Hostel"],        userName: "Aman G.",    rating: 4, comment: "Clean rooms, good mess. Easy walk to Arya College.",                  date: "2026-01-15" },
    { listingId: byName["Shree Ram Boys Hostel"],        userName: "Rohit M.",   rating: 4, comment: "Value for money. Wi-Fi slows down during exams.",                    date: "2026-02-01" },
    { listingId: byName["Shree Ram Boys Hostel"],        userName: "Vikas K.",   rating: 5, comment: "Security is top-notch. Warden is strict but fair.",                  date: "2026-02-10" },
    { listingId: byName["Jai Bhawani Girls Hostel"],     userName: "Neha S.",    rating: 5, comment: "Safest girls hostel near Kukas. Biometric entry is great.",          date: "2026-01-20" },
    { listingId: byName["Jai Bhawani Girls Hostel"],     userName: "Priya A.",   rating: 5, comment: "Food like home. Staff is caring.",                                   date: "2026-02-05" },
    { listingId: byName["Pooja PG for Girls"],           userName: "Anjali J.",  rating: 4, comment: "Homely feel, aunty is understanding. Good meals daily.",             date: "2025-12-18" },
    { listingId: byName["Shiv Shakti Mess"],             userName: "Rajesh T.",  rating: 5, comment: "Dal baati on Sundays is outstanding! Best mess near Arya.",         date: "2026-01-28" },
    { listingId: byName["Shiv Shakti Mess"],             userName: "Mohit S.",   rating: 5, comment: "Unlimited food at ₹1,800/month — unbeatable in Kukas.",             date: "2026-02-11" },
    { listingId: byName["Shiv Shakti Mess"],             userName: "Sanjay P.",  rating: 4, comment: "Consistent quality. Slight delay in dinner on weekends.",            date: "2026-02-15" },
    { listingId: byName["Bhaiya Ji Dhaba"],              userName: "Aryan K.",   rating: 5, comment: "24/7 dhaba is a blessing during night studies! Lassi is legendary.", date: "2026-01-10" },
    { listingId: byName["Bhaiya Ji Dhaba"],              userName: "Sumit V.",   rating: 5, comment: "Best paratha in Kukas. Stuffed aloo with butter — heaven.",         date: "2026-01-22" },
    { listingId: byName["Bhaiya Ji Dhaba"],              userName: "Tarun R.",   rating: 4, comment: "Great food but crowded after college hours. Come early.",            date: "2026-02-03" },
    { listingId: byName["Café Adda — Student Hangout"],  userName: "Prachi M.",  rating: 5, comment: "Free Wi-Fi + power outlets — the only café to study at!",          date: "2026-01-25" },
    { listingId: byName["Café Adda — Student Hangout"],  userName: "Dev S.",     rating: 4, comment: "Cold coffee is too good. Slightly pricey but worth it.",            date: "2026-02-08" },
    { listingId: byName["Geeta Tiffin Service"],         userName: "Ankit B.",   rating: 5, comment: "Geeta aunty's khana is exactly like mom's. Never missed a day.",   date: "2026-01-30" },
    { listingId: byName["Geeta Tiffin Service"],         userName: "Riya P.",    rating: 5, comment: "Delivery always on time. Consistent quality for 6 months.",         date: "2026-02-12" },
    { listingId: byName["Ravi Book Depot & Stationery"], userName: "Nikhil D.",  rating: 5, comment: "Has every textbook for Arya College. Xerox ₹0.70 is cheapest.",    date: "2026-01-08" },
    { listingId: byName["Fresh & Clean Laundry — Kukas"],userName: "Harsh G.",   rating: 4, comment: "Clothes come back fresh and neatly folded. Pickup is convenient.",  date: "2026-01-18" },
    { listingId: byName["Gyan Sagar Study Library"],     userName: "Kritika J.", rating: 5, comment: "24/7 open during exams, fully AC. Best prep library in Kukas.",    date: "2026-02-02" },
    { listingId: byName["Gyan Sagar Study Library"],     userName: "Akash M.",   rating: 5, comment: "Individual cabins are perfect for focused study.",                  date: "2026-02-14" },
  ];
  await Review.insertMany(reviews.filter(r => r.listingId));
  console.log(`✅ ${reviews.filter(r => r.listingId).length} reviews seeded`);

  await PO.insertMany(partnerOffers.map(o => ({ ...o, createdBy: admin._id, isActive: true })));
  console.log(`✅ ${partnerOffers.length} partner offers seeded`);

  const colleges = [
    { name: "Arya College of Engineering & IT",              shortName: "Arya College",    city: "Jaipur", state: "Rajasthan" },
    { name: "Jaipur Engineering College (JEC)",              shortName: "JEC Kukas",       city: "Jaipur", state: "Rajasthan" },
    { name: "JECRC University",                              shortName: "JECRC",           city: "Jaipur", state: "Rajasthan" },
    { name: "Poornima University",                           shortName: "Poornima",        city: "Jaipur", state: "Rajasthan" },
    { name: "Manipal University Jaipur",                     shortName: "MUJ",             city: "Jaipur", state: "Rajasthan" },
    { name: "LNM Institute of Information Technology",       shortName: "LNMIIT",          city: "Jaipur", state: "Rajasthan" },
    { name: "University of Engineering & Management Jaipur", shortName: "UEM Jaipur",      city: "Jaipur", state: "Rajasthan" },
    { name: "Malaviya National Institute of Technology",     shortName: "MNIT Jaipur",     city: "Jaipur", state: "Rajasthan" },
    { name: "University of Rajasthan",                       shortName: "UoR",             city: "Jaipur", state: "Rajasthan" },
    { name: "IIS University Jaipur",                         shortName: "IIS University",  city: "Jaipur", state: "Rajasthan" },
    { name: "Jagan Nath University Jaipur",                  shortName: "JNU Jaipur",      city: "Jaipur", state: "Rajasthan" },
    { name: "Global Institute of Technology Jaipur",         shortName: "GIT Jaipur",      city: "Jaipur", state: "Rajasthan" },
    { name: "Apex University Jaipur",                        shortName: "Apex",            city: "Jaipur", state: "Rajasthan" },
    { name: "Rajasthan Technical University",                shortName: "RTU",             city: "Kota",   state: "Rajasthan" },
    { name: "BITS Pilani",                                   shortName: "BITS Pilani",     city: "Pilani", state: "Rajasthan" },
    { name: "Indian Institute of Technology Delhi",          shortName: "IIT Delhi",       city: "Delhi",  state: "Delhi" },
    { name: "Indian Institute of Technology Bombay",         shortName: "IIT Bombay",      city: "Mumbai", state: "Maharashtra" },
    { name: "Delhi Technological University",                shortName: "DTU",             city: "Delhi",  state: "Delhi" },
    { name: "Anna University",                               shortName: "Anna University", city: "Chennai",state: "Tamil Nadu" },
    { name: "Other / Not Listed",                            shortName: "Other",           city: "India",  state: "India" },
  ];
  await College.insertMany(colleges);
  console.log(`✅ ${colleges.length} colleges seeded`);

  console.log("\n🎉 Seed complete! Kukas, Jaipur data ready.");
  console.log("   Admin:   admin@campusconnect.com  /  Admin@1234");
  console.log("   Owner:   owner@campusconnect.com  /  Owner@1234");
  console.log("   Student: student@campusconnect.com / Student@1234\n");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });