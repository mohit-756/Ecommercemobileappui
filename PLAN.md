# Build Plan — Retail Shop E-Commerce App

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Mobile:** Capacitor 8 (Android)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Payment:** Razorpay
- **Shipping:** Shiprocket / Delhivery
- **Push:** Firebase Cloud Messaging

---

## Phase 1: Backend Foundation ✅
- [x] Create `backend/` folder with Express + MongoDB setup
- [x] Folder structure: `models/`, `routes/`, `controllers/`, `middleware/`
- [x] Mongoose schemas (User, Product, Category, Order, Address, Cart)
- [x] JWT auth middleware
- [x] Environment config (.env)
- [x] Error handling middleware
- [x] API service layer in frontend (Axios with interceptors)
- [x] Seed script for initial data

## Phase 2: Auth System ✅
- [x] Backend: Register, Login, Profile APIs (done in Phase 1)
- [x] Frontend: Auth Context (React Context with login/register/logout/user state)
- [x] Frontend: Protected route wrapper (`ProtectedRoute` component)
- [x] Frontend: Auto-redirect (logged-in → /home, not-logged-in → /login)
- [x] Frontend: Token stored in localStorage, sent via Axios interceptor
- [x] Frontend: Login page uses real API with loading/error states
- [x] Frontend: Profile page shows real user data
- [x] Frontend: Logout clears token and redirects

## Phase 3: Product & Category APIs ✅
- [x] Backend: Product CRUD + search APIs (done in Phase 1)
- [x] Backend: Category API (done in Phase 1)
- [x] Frontend: Home screen fetches real products & categories from backend
- [x] Frontend: Home has loading spinner + category filter works from backend data
- [x] Frontend: Search hits backend API with debounced input
- [x] Frontend: ProductDetails fetches single product from backend by ID
- [x] Frontend: `normalizeProduct` helper handles backend data format
- [x] Frontend: ProductCard works with both mock and backend data

## Phase 4: Cart with Persistence ✅
- [x] Backend: Cart API (done in Phase 1)
- [x] Frontend: CartContext with backend sync (logged-in) + localStorage (guest)
- [x] Frontend: Guest cart merges into backend cart on login
- [x] Frontend: Backend cart saved to localStorage on logout
- [x] Frontend: Cart badge shows real item count from context
- [x] Frontend: Cart page uses CartContext (add/update/remove + subtotal/shipping/total)
- [x] Frontend: ProductCard & ProductDetails add-to-cart uses CartContext

## Phase 5: Addresses & Pincode Check ✅
- [x] Backend: Address CRUD + pincode check APIs (done in Phase 1)
- [x] Frontend: Addresses page at `/addresses` — list, add, edit, delete, set default
- [x] Frontend: Bottom-sheet form for add/edit with label selector (Home/Work/Other)
- [x] Frontend: Checkout shows address radio selector, auto-selects default
- [x] Frontend: Pincode serviceability check on address selection
- [x] Frontend: "Place Order" disabled if address missing or pincode not serviceable
- [x] Frontend: Real order summary with subtotal, shipping, tax calculation

## Phase 6: Payment — Razorpay ✅
- [x] Backend: Create Razorpay order + verify signature APIs (done in Phase 1)
- [x] Backend: `razorpayKeyId` returned in order response for frontend
- [x] Frontend: Razorpay checkout modal (script loaded dynamically via `lib/razorpay.ts`)
- [x] Frontend: Razorpay flow: createOrder → open checkout → verifyPayment → success
- [x] Frontend: Cash on Delivery flow: createOrder → clear cart → success (no payment)
- [x] Frontend: Loading/processing state, error handling, modal dismiss handling
- [x] Frontend: OrderSuccess shows real order ID from query params + Track Order button

## Phase 7: Orders & Shipping ✅
- [x] Backend: Order history (`GET /api/orders`) — done in Phase 1
- [x] Backend: Order detail (`GET /api/orders/:id`) — done in Phase 1
- [x] Backend: Tracking status updates (`PUT /api/orders/:id/status`) — done in Phase 1
- [x] Frontend: Order history page with real data (`Orders.tsx` fetches from backend)
- [x] Frontend: Order tracking timeline from backend (`OrderTracking.tsx` with real tracking events)
- [x] Frontend: Track Order button on `OrderSuccess.tsx`
- [x] Backend: Shipping partner integration stub (Shiprocket/Delhivery) with env placeholders
- [ ] Backend: SMS/Email notifications (Twilio/SendGrid) — deferred, needs API keys

## Phase 8: Admin Panel ✅
- [x] Backend: Admin middleware (`adminOnly` in `auth.js`) — was already there
- [x] Backend: Dashboard stats API (`GET /api/admin/stats` with orders, revenue, users, products, low stock)
- [x] Backend: Product management APIs (admin-protected CRUD) — was already there
- [x] Backend: Order management APIs (`GET /api/orders/all`, `PUT /api/orders/:id/status`) — was already there
- [x] Frontend: Admin dashboard page (`/admin`) with stats cards, orders by status, navigation
- [x] Frontend: Product management (`/admin/products`) with list, search, add/edit form, delete
- [x] Frontend: Order management (`/admin/orders`) with status filter and inline status update
- [x] Frontend: Admin link in Profile page (visible only for `role === 'admin'`)

## Phase 9: Mobile Enhancements ✅
- [x] Backend: Added `packed` status to Order model + status labels
- [x] Frontend: Push notifications via Firebase Cloud Messaging (`@capacitor/push-notifications`)
- [x] Frontend: Biometric login (fingerprint/face) via `@aparajita/capacitor-biometric-auth`
- [x] Frontend: Camera for profile picture (`@capacitor/camera`, button on Profile page)
- [x] Frontend: Offline cart support (localStorage guest cart was already implemented)
- [x] Frontend: Network status detection (`@capacitor/network` with toast notifications)
- [x] Frontend: Deep linking (`@capacitor/app` URL open handler)
- [x] Frontend: Mobile features initialized in Splash page via `useMobileFeatures` hook
- [x] Capacitor plugins synced to Android project

---

## How to Run

```bash
# Frontend
npm install
npm run dev            # Browser dev server
npm run build          # Production build
npx cap sync android   # Sync to Android project

# Backend
cd backend
npm install
npm run dev            # Backend server (nodemon)

# Android
Open android/ in Android Studio
Run on connected device
```

## Deployment Flow
1. Frontend: `npm run build` → `npx cap sync android` → Android Studio → phone
2. Backend: Deploy Node.js server to cloud (Render / Railway / AWS)
3. Frontend connects to backend via API URL in config
