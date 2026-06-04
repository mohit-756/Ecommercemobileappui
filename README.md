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

```bash
# Frontend
npm install
npm run dev               # Browser at localhost:5173
npm run build             # Production build
npx cap sync android      # Sync to Android Studio

# Backend
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

## Testing on Phone

1. Connect Android phone with USB debugging enabled
2. `npm run build`
3. `npx cap sync android`
4. Open `android/` in Android Studio
5. Click **Run** (play button) → app installs on phone
