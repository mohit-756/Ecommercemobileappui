# DryFruit Hub — Premium Dry Fruits E-Commerce Mobile App

A full-stack e-commerce mobile application for selling premium dry fruits, nuts, and healthy snacks. Built with React (web) + Capacitor (Android), powered by a Node.js + Express + MongoDB backend.

## Current Status

Full-stack e-commerce application with:

- **User auth** (JWT login/signup + email OTP verification)
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
- Gmail account with **2-Step Verification enabled** + an [App Password](https://myaccount.google.com/apppasswords) (for email OTP)

## Setup

### 1. Environment Variables

All configuration lives in a single `.env` file at the project root:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | A strong random secret for JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiry duration (default: 7d) |
| `RAZORPAY_KEY_ID` | Razorpay payment gateway key |
| `RAZORPAY_KEY_SECRET` | Razorpay payment gateway secret |
| `GMAIL_USER` | Your Gmail address (for sending OTP emails) |
| `GMAIL_APP_PASSWORD` | 16-character Gmail App Password |
| `VITE_API_URL` | Backend API URL — `http://localhost:5000/api` for local, or Render URL for production |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key (same as above, exposed to frontend) |

To get a Gmail App Password:
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Enable 2-Step Verification if not already done
3. Generate a 16-character App Password for "Mail"
4. Copy it into `GMAIL_APP_PASSWORD` in `.env`

**Important:** The `.env` file contains secrets and is excluded from git.

### 2. Run Backend (Local)

```bash
cd backend
npm install           # first time only
npm run dev           # starts at http://localhost:5000
```

The backend automatically loads env vars from the root `.env` file.

### 3. Run Frontend (Web)

```bash
# Open a second terminal (keep backend running)

# Install dependencies (first time only)
npm install

# Start dev server — opens at http://localhost:5173
npm run dev
```

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

**Note:** The Capacitor WebView is configured to allow requests to the backend domain. If you switch URLs, update `allowNavigation` in `capacitor.config.json`.

### 5. Quick Start (Local Dev)

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
npm install
npm run dev
```

Then open http://localhost:5173 and sign up — an OTP will be sent to your Gmail inbox.

## Project Structure

```
├── .env                       # Single env file (backend + frontend)
├── src/
│   ├── app/
│   │   ├── App.tsx           # Root component
│   │   ├── routes.tsx         # Router config
│   │   ├── components/        # Shared UI components
│   │   ├── pages/             # Route pages (wired in router)
│   │   │   ├── Login.tsx     # Login / signup with OTP
│   │   │   └── VerifyOtp.tsx # Email OTP verification
│   │   ├── screens/           # Screen components
│   │   ├── contexts/          # Auth, Cart contexts
│   │   ├── services/          # API services
│   │   ├── data/mock.ts       # Mock data
│   │   └── lib/utils.ts       # Utility functions
│   ├── styles/                # Global styles
│   └── main.tsx               # Entry point
├── android/                   # Capacitor Android project
├── backend/
│   ├── .env                   # (legacy — vars moved to root .env)
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose schemas (User, Otp, etc.)
│   │   ├── routes/            # Express routes
│   │   └── services/          # emailService (Nodemailer OTP)
│   └── package.json
├── PLAN.md                    # Detailed build phases
├── capacitor.config.json
└── vite.config.ts
```

## Notes

- **Same codebase, two layouts** — `Capacitor.isNativePlatform()` detects the platform and switches layouts automatically.
- Changing the desktop (web) layout **does not affect** the Android app and vice versa.
