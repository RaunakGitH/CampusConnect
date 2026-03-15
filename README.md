# 🎓 CampusConnect — Full Stack Platform

Broker-free accommodation and services platform for students and working professionals.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — fill in MONGO_URI and GROQ_API_KEY
npm run seed     # seeds DB with sample data
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000/api
npm run dev      # starts on http://localhost:8080
```

---

## 🔑 Required API Keys

| Key | Where to get | Used for |
|-----|-------------|---------|
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) | Database |
| `GROQ_API_KEY` | [console.anthropic.com](https://console.groq.com/keys) | CampusBot, AI Search, AI Description, AI Summary |
| `CASHFREE_APP_ID` + `SECRET` | [merchant.cashfree.com](https://merchant.cashfree.com) | Payments (optional for dev) |

---

## 🤖 AI Features

| Feature | How to use |
|---------|-----------|
| **CampusBot** | Floating chat button (bottom-right) — ask anything |
| **AI Smart Search** | Listings page → "AI" search bar — type natural language |
| **AI Description** | Add Listing → click "✨ AI Generate" button |
| **AI Review Summary** | Listing detail page → auto-appears above reviews (3+ reviews needed) |

---

## 📁 Structure

```
CampusConnect/
├── backend/              Express + MongoDB
│   ├── src/
│   │   ├── controllers/  auth, listing, review, subscription, ai, ...
│   │   ├── models/       User, Listing, Review, Subscription, ...
│   │   ├── routes/       REST API routes
│   │   └── middleware/   auth, error handling
│   └── .env.example
└── frontend/             React + Vite + Tailwind
    ├── src/
    │   ├── pages/        Index, Listings, ListingDetail, Dashboard, ...
    │   ├── components/   Header, CampusBot, AISmartSearch, ...
    │   ├── context/      AuthContext
    │   └── services/     api.ts
    └── .env.example
```

---

## 👤 Demo Accounts (after `npm run seed`)

| Email | Password | Role |
|-------|----------|------|
| admin@campusconnect.com | Admin@1234 | Admin |
| student@campusconnect.com | Student@1234 | Student |

## 🎟️ Demo Coupons

| Code | Discount |
|------|----------|
| `FREEMONTH` | Owner plan free for 1 month |
| `STUDENT10` | 10% off student premium |
| `WELCOME50` | ₹50 off any plan |
