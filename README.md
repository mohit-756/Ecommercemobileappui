# DryFruit Hub — Premium Dry Fruits E-Commerce Mobile App

A full-stack e-commerce mobile application for selling premium dry fruits, nuts, and healthy snacks. Built with React (web) + Capacitor (Android), powered by a Node.js + Express + MongoDB backend.

## Current Status

This is a **frontend UI prototype** with mock data. We are actively building the full-stack version with:

- **User auth** (JWT login/signup)
- **Product catalog** with search & categories
- **Shopping cart** (persisted for logged-in users)
- **Razorpay** payment gateway (UPI, cards, net banking, COD)
- **Order management** with tracking timeline
- **Shipping integration** (Shiprocket / Delhivery)
- **Admin panel** for inventory & order management
- **Push notifications** via Firebase Cloud Messaging
- **Android app** via Capacitor

See [PLAN.md](./PLAN.md) for the detailed build phases.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Mobile | Capacitor 8 (Android) |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Payment | Razorpay |
| Shipping | Shiprocket / Delhivery |
| UI Library | MUI 7, Radix UI, shadcn/ui |

## Prerequisites

- Node.js 18+
- Android Studio (for building the APK)
- A physical Android device or emulator
- MongoDB Atlas account (backend) or local MongoDB

## Setup

### 1. Environment Variables

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL — use Render URL for production, `http://localhost:5000/api` for local dev |
| `VITE_RAZORPAY_KEY_ID` | Razorpay payment gateway key |

**Important:** The `.env` file contains secrets and is excluded from git. After changing `.env`, rebuild the app with `npm run build` for the changes to take effect.

### 2. Backend (Render — Deployed)

The backend is already deployed at:
```
https://retail-shop-backend-ekc8.onrender.com
```

Make sure these env vars are set in Render's dashboard:
- `MONGODB_URI` — your Atlas MongoDB connection string
- `JWT_SECRET` — a strong random secret
- `CORS_ORIGIN` — `*` (or leave unset for default)

### 3. Web (Laptop / Desktop / Mobile Browser)

```bash
# Install dependencies
npm install

# Start dev server — opens at http://localhost:5173
npm run dev

# Production build
npm run build
```

The web version uses **full desktop layout** (top nav, no phone frame). Works on any browser.

### 4. Android (Phone / Tablet)

```bash
# 1. Build the frontend (picks up .env vars at build time)
npm run build

# 2. Sync the build to the Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio, go to Build → Build APK(s), or click Run (▶) to install on device
```

Or combine build + sync into one step:

```bash
npm run cap:build       # vite build + npx cap sync android
```

The Android app uses the **mobile layout** with bottom navigation.

**Note:** The Capacitor WebView is configured to allow requests to the Render backend domain. If you switch to a different backend URL, update `allowNavigation` in `capacitor.config.json`.

### 5. Backend (Local Dev — Optional)

```bash
cd backend
npm install
npm run dev               # Backend server (default: port 5000)
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx           # Root component
│   │   ├── routes.tsx         # Router config
│   │   ├── components/        # Shared UI components
│   │   ├── pages/             # Route pages (wired in router)
│   │   ├── screens/           # Screen components
│   │   ├── data/mock.ts       # Mock data
│   │   └── lib/utils.ts       # Utility functions
│   ├── styles/                # Global styles
│   └── main.tsx               # Entry point
├── android/                   # Capacitor Android project
├── backend/                   # Node.js + Express server
├── PLAN.md                    # Detailed build phases
├── capacitor.config.json
└── vite.config.ts
```

## Notes

- **Same codebase, two layouts** — `Capacitor.isNativePlatform()` detects the platform and switches layouts automatically.
- Changing the desktop (web) layout **does not affect** the Android app and vice versa.
