# Build Plan — Retail Shop E-Commerce App

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Mobile:** Capacitor 8 (Android)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Payment:** Razorpay
- **Shipping:** Shiprocket / Delhivery
- **Push:** Firebase Cloud Messaging

---

## Phase 1: Backend Foundation
- [ ] Create `backend/` folder with Express + MongoDB setup
- [ ] Folder structure: `models/`, `routes/`, `controllers/`, `middleware/`
- [ ] Mongoose schemas (User, Product, Category, Order, Address, Cart)
- [ ] JWT auth middleware
- [ ] Environment config (.env)
- [ ] Error handling middleware
- [ ] API service layer in frontend (Axios with interceptors)

## Phase 2: Auth System
- [ ] Backend: Register API (`POST /api/auth/register`)
- [ ] Backend: Login API (`POST /api/auth/login`)
- [ ] Backend: Profile API (`GET /api/auth/me`)
- [ ] Frontend: Auth Context (React Context)
- [ ] Frontend: Protected route wrapper
- [ ] Frontend: Auto-redirect based on login state
- [ ] Frontend: Token stored in localStorage, sent via headers

## Phase 3: Product & Category APIs
- [ ] Backend: Product model + CRUD (`GET /api/products`, `GET /api/products/:id`)
- [ ] Backend: Search (`GET /api/products/search?q=`)
- [ ] Backend: Category model + API (`GET /api/categories`)
- [ ] Frontend: Home screen fetches real products
- [ ] Frontend: Search hits backend instead of client-filtering
- [ ] Frontend: Category filter works from backend data

## Phase 4: Cart with Persistence
- [ ] Backend: Cart API (`POST /api/cart`, `GET /api/cart`, `PUT /api/cart`, `DELETE /api/cart`)
- [ ] Frontend: Cart Context replaces local useState
- [ ] Frontend: Cart syncs to backend for logged-in users
- [ ] Frontend: Guest cart stored in localStorage, syncs on login
- [ ] Frontend: Cart badge (count) updates from context

## Phase 5: Addresses & Pincode Check
- [ ] Backend: Address CRUD (`POST /api/addresses`, `GET /api/addresses`)
- [ ] Backend: Pincode serviceability (`GET /api/shipping/serviceable/:pincode`)
- [ ] Frontend: Add/Edit/Delete addresses in profile
- [ ] Frontend: Select delivery address at checkout
- [ ] Frontend: Pincode validation before proceeding

## Phase 6: Payment — Razorpay
- [ ] Backend: Create Razorpay order (`POST /api/orders/create`)
- [ ] Backend: Verify payment signature (`POST /api/orders/verify`)
- [ ] Frontend: Razorpay checkout modal integration
- [ ] Frontend: Handle success/failure callbacks
- [ ] Frontend: Cash on Delivery option (no payment verification)
- [ ] Order creation flow (address + payment + items)

## Phase 7: Orders & Shipping
- [ ] Backend: Order history (`GET /api/orders`)
- [ ] Backend: Order detail (`GET /api/orders/:id`)
- [ ] Backend: Tracking status updates (`PUT /api/orders/:id/status`)
- [ ] Frontend: Order history page with real data
- [ ] Frontend: Order tracking timeline from backend
- [ ] Backend: Shiprocket/Delhivery API integration
- [ ] Backend: SMS/Email notifications (Twilio/SendGrid)

## Phase 8: Admin Panel
- [ ] Backend: Admin middleware (role-based access)
- [ ] Backend: Dashboard stats API
- [ ] Backend: Product management APIs (admin-protected)
- [ ] Backend: Order management APIs
- [ ] Frontend: Admin dashboard with real stats
- [ ] Frontend: Product add/edit form
- [ ] Frontend: Order list + status update

## Phase 9: Mobile Enhancements
- [ ] Frontend: Push notifications via Firebase Cloud Messaging
- [ ] Frontend: Biometric login (fingerprint/face)
- [ ] Frontend: Camera for profile picture
- [ ] Frontend: Offline cart support
- [ ] Frontend: Deep linking (product links, order tracking)
- [ ] Performance optimization & testing

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
