# Retail Shop — E-Commerce Mobile App

A full-stack e-commerce mobile application built with React (web) + Capacitor (Android), powered by a Node.js + Express + MongoDB backend.

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

## Quick Start

### Web (Laptop / Desktop / Mobile Browser)

```bash
# Install dependencies
npm install

# Start dev server — opens at http://localhost:5173
npm run dev

# Production build
npm run build
```

The web version uses **full desktop layout** (top nav, no phone frame). Works on any browser.

### Android (Phone / Tablet)

```bash
# 1. Build the frontend
npm run build

# 2. Sync the build to the Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio, click Run (▶) to install on connected device
```

Or combine build + sync into one step:

```bash
npm run cap:build       # vite build + npx cap sync android
```

The Android app uses the **mobile layout** with bottom navigation.

### Backend

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
