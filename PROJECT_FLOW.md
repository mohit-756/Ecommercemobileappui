# Project Flow — DryFruit Hub Premium E-Commerce Mobile App

This document provides a simple, high-level overview of the technology stack, user flows, and APIs used in this project.

---

## 1. The Core Building Blocks (The Languages & Tools)

Every application has two main parts: the **Frontend** (what the user sees) and the **Backend** (the brain behind the scenes).

| Part | Role in our Store Analogy | Languages & Technologies Used |
| :--- | :--- | :--- |
| **Frontend** | **The Storefront:** The shelves, signs, shopping carts, and buttons that the customer interacts with. | **React & TypeScript:** For building the interactive pages.<br>**Tailwind CSS:** For the colors, typography, and styling.<br>**Capacitor:** A wrapper that converts our web-based storefront into an **Android Mobile App** so it can run on phones. |
| **Backend** | **The Back Office & Store Manager:** The manager who stands behind the scenes checking IDs, taking orders, and managing stock. | **Node.js & Express.js (JavaScript):** The programming engine that handles all request-handling rules. |
| **Database** | **The Warehouse:** The physical filing cabinet in the back where all product, customer, and order records are stored. | **MongoDB & Mongoose:** A modern database that saves data in simple documents (like digital note cards). |

---

## 2. How Everything Works From Start to End (The Flow)

Here is a customer's journey through the app:

### Step A: Entering the Store (Registration & Log In)
1. When a new customer signs up, they enter their email.
2. The **Backend** receives this request and generates a temporary verification code (OTP).
3. The system sends this OTP directly to the user's email inbox.
4. Once the customer types the correct code on their screen, the **Backend** issues a secure digital pass (called a **JWT Token**). The phone saves this pass so the user doesn't have to log in again next time.
5. On mobile, the app also hooks into the phone's **Fingerprint/Face Scanner (Biometrics)** for a quick unlock.

### Step B: Browsing the Shelves (Product Catalog & Search)
1. The frontend asks the backend: *"Show me all the almonds, walnuts, and cashews available."*
2. The backend looks up the items in the **MongoDB database** and sends the details back to the screen.
3. If the user searches for *"Kashmiri Walnuts"*, the app filters the list in real-time by sending the search query to the backend.

### Step C: Filling the Cart
1. When a customer adds items to their shopping cart:
   - **If logged in:** The cart is saved in the cloud database. If they close the app and open it on another device, their cart is still there.
   - **If a guest:** The cart is saved temporarily on their phone's local storage. Once they sign in, it merges automatically.

### Step D: Checkout & Pincode Check
1. The customer selects or adds a delivery address.
2. The app automatically checks the shipping postal code (pincode) to make sure our shipping partner can deliver there. If not, it safely prevents the user from ordering.

### Step E: Cashier & Payments (Razorpay API)
1. When the customer clicks **Place Order**, the backend contacts **Razorpay** (our payment cashier).
2. Razorpay opens a secure overlay window on the user's screen allowing payment via UPI (GPay/PhonePe), Credit Card, or Net Banking.
3. Once the payment is complete, Razorpay tells our backend: *"Payment successful!"*
4. The backend marks the order as paid and clears the shopping cart.

### Step F: Preparing & Tracking the Shipment
1. The order goes into the system with a timeline tracker.
2. The customer can open the **Order Tracking** screen to see the status change live:
   $$\text{Order Placed} \rightarrow \text{Packed} \rightarrow \text{Shipped} \rightarrow \text{Out for Delivery} \rightarrow \text{Delivered}$$
3. The app can send push notifications (e.g., *"Your dry fruits have been shipped!"*) directly to their phone screen.

---

## 3. The External Helpers (The APIs We Used)

An **API (Application Programming Interface)** is simply a service built by another company that we plug into our app to do specialized tasks:

1. **Razorpay API:** Handles all payment security, credit cards, and UPI payments.
2. **Nodemailer / Gmail:** Our automated mail carrier. It logs into our secure system email and sends the OTP verification codes to users.
3. **Firebase Cloud Messaging (FCM):** Google's service that pushes pop-up notifications to the customer's phone even when the app is closed.
4. **Shiprocket / Delhivery (Stubbed API):** Calculates if a delivery address is reachable and tracks package locations.
5. **Capacitor Device APIs:** Lets the web code talk directly to the phone hardware (e.g., using the **Camera** to snap a profile picture, checking **Network Status** to see if the user is offline, or using **Biometric Fingerprint Authentication**).

---

## 4. Code Map & Key Files

* **The Main App Entry Point:** [App.tsx](file:///c:/Users/mohit/Downloads/Ecommercemobileappui/src/app/App.tsx)
* **The Screen Navigation Rules:** [routes.tsx](file:///c:/Users/mohit/Downloads/Ecommercemobileappui/src/app/routes.tsx)
* **The Backend Server Brain:** [backend/src/index.js](file:///c:/Users/mohit/Downloads/Ecommercemobileappui/backend/src/index.js)
* **Detailed System Design Plan:** [PLAN.md](file:///c:/Users/mohit/Downloads/Ecommercemobileappui/PLAN.md)
* **Developer Readme:** [README.md](file:///c:/Users/mohit/Downloads/Ecommercemobileappui/README.md)
