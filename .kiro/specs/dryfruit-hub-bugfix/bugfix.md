# Bugfix Requirements Document

## Introduction

This document captures the full audit of bugs identified in the DryFruit Hub e-commerce mobile application (React/TypeScript + Node.js/Express + MongoDB). Fourteen bugs have been identified spanning frontend display errors, React context misuse, data integrity problems in order processing, stock management race conditions, and authentication flaws. These bugs range from minor UX inconsistencies (tax always showing ₹0.00) to critical data integrity issues (stock permanently lost when order creation fails after decrement). Each bug is documented with its current defective behavior, the correct expected behavior, and the behavior that must remain unchanged to prevent regressions.

---

## Bug Analysis

### Bug 1 — Cart.tsx: Tax Always Displays ₹0.00

#### Current Behavior (Defect)

1.1 WHEN a user views their cart with items in it THEN the system displays `₹0.00` for the tax line item regardless of the subtotal value  
1.2 WHEN the user proceeds from Cart to Checkout THEN the system shows a different (correctly calculated) tax figure on the Checkout page, creating an inconsistent experience

#### Expected Behavior (Correct)

2.1 WHEN a user views their cart with items in it THEN the system SHALL display the calculated tax as `Math.round(subtotal * 0.08 * 100) / 100` (8% of subtotal), matching the value shown on Checkout  
2.2 WHEN the cart summary total is calculated THEN the system SHALL include tax in the total displayed to the user so the amount matches what will be charged at checkout

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN the cart is empty THEN the system SHALL CONTINUE TO display zero for all line items including tax  
3.2 WHEN shipping is free (subtotal ≥ ₹500) THEN the system SHALL CONTINUE TO show "Free" for the shipping line item  
3.3 WHEN the user clicks "Proceed to Checkout" THEN the system SHALL CONTINUE TO navigate to the Checkout page

---

### Bug 2 — CartContext.tsx: Guest Cart `selectedWeight` Stored as `null` Causes Duplicate Entries

#### Current Behavior (Defect)

1.1 WHEN a guest user adds a product with no `selectedWeight` argument to the cart THEN the system stores the item with `selectedWeight: null` (falling through `selectedWeight || (product?.variants?.[0]?.weight || null)`)  
1.2 WHEN a guest user adds the same product again with `selectedWeight` as `undefined` THEN the system compares `item.selectedWeight === selectedWeight` which evaluates as `null === undefined` (false), creating a duplicate cart entry instead of incrementing quantity

#### Expected Behavior (Correct)

2.1 WHEN a guest user adds a product without specifying a weight THEN the system SHALL normalize the stored `selectedWeight` to `undefined` (not `null`) so that subsequent duplicate-detection comparisons work correctly  
2.2 WHEN a guest user adds the same product+weight combination a second time THEN the system SHALL increment the existing item's quantity instead of pushing a new duplicate entry

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN a guest user adds a product with an explicitly provided `selectedWeight` string THEN the system SHALL CONTINUE TO store that weight value and use it for deduplication  
3.2 WHEN an authenticated user adds items to the cart THEN the system SHALL CONTINUE TO delegate to the backend API which handles deduplication server-side  
3.3 WHEN a guest logs in THEN the system SHALL CONTINUE TO sync guest cart items to the server

---

### Bug 3 — AuthContext.tsx: Event Listeners Registered Inside Token-Conditional `useEffect` (Memory Leak / Non-Registration)

#### Current Behavior (Defect)

1.1 WHEN the app loads and no auth token exists in localStorage THEN the system skips the entire `useEffect` body (returns early at `if (!token)`) and never registers the `auth:logout` or `auth:login` event listeners  
1.2 WHEN the API interceptor dispatches an `auth:login` event (e.g., after a 401 triggers re-authentication) and no token was present at app load THEN the system does not handle the event, leaving the user stuck in a logged-out state despite a valid re-auth attempt  
1.3 WHEN a token exists and the `useEffect` runs, then the token changes to `null` THEN the system removes the event listeners via the cleanup function, even though the listeners should remain active for future login events

#### Expected Behavior (Correct)

2.1 WHEN the app mounts THEN the system SHALL register `auth:logout` and `auth:login` event listeners unconditionally, independent of whether a token currently exists  
2.2 WHEN an `auth:login` event is dispatched at any point during the session THEN the system SHALL handle the event and update the token and user state regardless of the initial auth state  
2.3 WHEN the component unmounts THEN the system SHALL clean up all event listeners exactly once

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN a token exists at app load THEN the system SHALL CONTINUE TO fetch the user profile via `authService.getProfile()`  
3.2 WHEN profile fetch fails THEN the system SHALL CONTINUE TO clear the invalid token from localStorage and state  
3.3 WHEN `auth:logout` is dispatched THEN the system SHALL CONTINUE TO clear token and user state

---

### Bug 4 — AuthContext.tsx: `login` / `loginWithGoogle` / `register` Return `userData` but Type Declares `Promise<void>`

#### Current Behavior (Defect)

1.1 WHEN a component calls `await login(email, password)` THEN the system returns `userData` from the function body, but the TypeScript interface `AuthContextType` declares the return type as `Promise<void>`, causing TypeScript to discard the return value at the call site  
1.2 WHEN a component tries to use the returned value from `login()` THEN the system provides no type-safe access to `userData` because TypeScript treats the promise as resolving to `void`  
1.3 WHEN `loginWithGoogle` or `register` are called THEN the system has the same return type mismatch

#### Expected Behavior (Correct)

2.1 WHEN a component calls `await login(email, password)` THEN the system SHALL return `userData` with the correct TypeScript type `Promise<User>` so callers can use the returned user object  
2.2 WHEN `loginWithGoogle` or `register` are called THEN the system SHALL declare and return `Promise<User>` consistently  
2.3 WHEN the `AuthContextType` interface is updated THEN the system SHALL reflect the correct return type so TypeScript enforces type-safe usage at all call sites

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN login succeeds THEN the system SHALL CONTINUE TO store the token in localStorage and update `token` and `user` state  
3.2 WHEN login fails THEN the system SHALL CONTINUE TO propagate the thrown error to the caller  
3.3 WHEN login succeeds THEN the system SHALL CONTINUE TO trigger `syncWishlistFromServer()`

---

### Bug 5 — Checkout.tsx: Payment Method IDs `'upi'`, `'card'`, `'wallet'` Are Misleading (All Route to Razorpay)

#### Current Behavior (Defect)

1.1 WHEN a user selects "UPI (GPay / PhonePe / Paytm)" as the payment method THEN the system sets `paymentMethod` to `'upi'` but at order submission maps it to `'razorpay'` — there is no dedicated UPI flow  
1.2 WHEN a user selects "Credit / Debit Card" or "Wallet / Net Banking" THEN the system behaves identically (all three non-COD options open Razorpay checkout), but the UI presents them as three distinct payment methods, misleading users  
1.3 WHEN the user sees the payment methods list THEN the system offers four options that imply four different payment flows, when in reality only two exist: Razorpay (all online) and COD

#### Expected Behavior (Correct)

2.1 WHEN the payment methods are displayed THEN the system SHALL present exactly two categories: "Pay Online (Razorpay)" and "Cash on Delivery", accurately reflecting the two actual payment flows  
2.2 WHEN the user selects any online payment option THEN the system SHALL communicate clearly that Razorpay handles all online payment types (UPI, card, wallet) within its own checkout UI  
2.3 WHEN the user selects an online payment method THEN the `paymentMethod` state SHALL be set to `'razorpay'` directly (or a clearly-named equivalent), eliminating the silent mapping in `handlePlaceOrder`

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user selects COD THEN the system SHALL CONTINUE TO submit the order with `paymentMethod: 'cod'` and navigate to the success page without opening Razorpay  
3.2 WHEN Razorpay is opened THEN the system SHALL CONTINUE TO call `verifyPayment` on success and navigate to the success page  
3.3 WHEN the Razorpay modal is dismissed THEN the system SHALL CONTINUE TO reset the `placing` state to `false`

---

### Bug 6 — Home.tsx: `useEffect` Missing `[user]` Dependency for Location Popup

#### Current Behavior (Defect)

1.1 WHEN the user dismisses the location popup and then logs in (changing the `user` state) THEN the system does not re-evaluate whether the location popup should re-appear for the newly logged-in user because `user` is not in the `useEffect` dependency array  
1.2 WHEN `detectLocation` is called in `handleAllowLocation` THEN the system does not include `detectLocation` in any dependency array, which can lead to stale closure captures

#### Expected Behavior (Correct)

2.1 WHEN relevant state changes (including `user`) occur THEN the system SHALL re-evaluate the location popup visibility logic with up-to-date values  
2.2 WHEN `detectLocation` is used inside a `useEffect` or callback THEN the system SHALL include it in the dependency array or stabilize it with `useCallback` to prevent stale closure bugs

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user has already dismissed the location popup in the current session THEN the system SHALL CONTINUE TO suppress re-showing the popup using the `sessionStorage` flag  
3.2 WHEN the user grants location permission THEN the system SHALL CONTINUE TO call `detectLocation` and update the delivery location

---

### Bug 7 — ProductDetails.tsx: `checkWishlistStatus` Uses Stale `user` Reference

#### Current Behavior (Defect)

1.1 WHEN a product detail page loads while authentication is still resolving THEN the system calls `checkWishlistStatus` with the initial (possibly null) `user` value because `user` is not in the `useEffect` dependency array  
1.2 WHEN `user` changes after the initial render (e.g., auth finishes loading) THEN the system does not re-run `loadProductDetails` to recheck the wishlist status, leaving the wishlist button in an incorrect state

#### Expected Behavior (Correct)

2.1 WHEN `user` changes (including when auth resolves from loading) THEN the system SHALL re-run or re-evaluate `checkWishlistStatus` with the current `user` value  
2.2 WHEN `checkWishlistStatus` is defined THEN the system SHALL either include `user` in the `useEffect` dependency array containing `loadProductDetails`, or wrap `checkWishlistStatus` in a `useCallback` that includes `user` as a dependency

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN the product ID changes THEN the system SHALL CONTINUE TO reload product details and re-evaluate wishlist status  
3.2 WHEN `user` is null (guest) THEN the system SHALL CONTINUE TO show the wishlist button in the un-wishlisted state  
3.3 WHEN the user taps the wishlist button THEN the system SHALL CONTINUE TO toggle wishlist membership correctly

---

### Bug 8 — orderController.js: Stock Decrement Uses Top-Level `stock` Instead of Variant `stock`

#### Current Behavior (Defect)

1.1 WHEN an order is placed for a product with variants THEN the system decrements `product.stock` (the top-level field) via `{ $inc: { stock: -item.quantity } }`, ignoring the per-variant `variants[].stock` fields  
1.2 WHEN a product's inventory is tracked per-variant (e.g., 250g variant has stock 10, 500g variant has stock 5) THEN the system checks and decrements the top-level `stock` field, which may be 0 while variant stock is available — causing false "out of stock" errors — or may be non-zero while a specific variant is depleted — allowing overselling

#### Expected Behavior (Correct)

2.1 WHEN an order item specifies a `weight` (variant) THEN the system SHALL check and decrement the matching `variants[].stock` for that specific variant rather than the top-level `stock`  
2.2 WHEN an order item does not specify a variant THEN the system SHALL fall back to checking and decrementing the top-level `stock` field  
2.3 WHEN the variant stock is insufficient for the ordered quantity THEN the system SHALL return a 400 out-of-stock error and roll back any already-decremented stock for that order

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN multiple items are in the order and one is out of stock THEN the system SHALL CONTINUE TO roll back all previously decremented stock before returning the error  
3.2 WHEN stock decrement succeeds for all items THEN the system SHALL CONTINUE TO proceed to order creation  
3.3 WHEN a product has a non-ObjectId ID (mock data) THEN the system SHALL CONTINUE TO skip the stock update via the CastError catch

---

### Bug 9 — orderController.js: `cancelOrder` Cannot Cancel Admin-Created Orders (Status `'received'`)

#### Current Behavior (Defect)

1.1 WHEN `adminCreateOrder` creates an order THEN the system sets `status: 'received'`  
1.2 WHEN a user or admin calls `cancelOrder` on an order with status `'received'` THEN the system returns HTTP 400 with the message `Order cannot be cancelled because its status is already "received"` because the guard only allows `'pending'` or `'confirmed'`  
1.3 WHEN an admin creates an order on behalf of a customer and the customer needs to cancel it THEN the system prevents cancellation entirely

#### Expected Behavior (Correct)

2.1 WHEN `cancelOrder` is called on an order with status `'received'` THEN the system SHALL permit the cancellation (treating `'received'` as cancellable, equivalent to `'pending'`/`'confirmed'`)  
2.2 WHEN an admin creates an order that has not yet been packed or shipped THEN the system SHALL allow both user and admin to cancel it regardless of whether the initial status is `'pending'`, `'confirmed'`, or `'received'`

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN `cancelOrder` is called on a `'shipped'`, `'delivered'`, or `'completed'` order THEN the system SHALL CONTINUE TO reject cancellation with HTTP 400  
3.2 WHEN a cancellation is permitted THEN the system SHALL CONTINUE TO restore stock inventory for all order items  
3.3 WHEN a cancellation is permitted THEN the system SHALL CONTINUE TO update the order status to `'cancelled'` and push the cancellation tracking event

---

### Bug 10 — cartController.js: `clearCart` Response Inconsistency (`items` Array Missing)

#### Current Behavior (Defect)

1.1 WHEN `clearCart` is called on the backend THEN the system returns `{ message: 'Cart cleared' }` with no `items` field  
1.2 WHEN other cart mutation endpoints (`addToCart`, `updateCartItem`, `removeFromCart`) are called THEN the system returns the full populated cart object including `items`, creating an inconsistent API contract

#### Expected Behavior (Correct)

2.1 WHEN `clearCart` is called THEN the system SHALL return a response consistent with other cart endpoints, either `{ message: 'Cart cleared', items: [] }` or the full updated cart document with an empty `items` array  
2.2 WHEN the frontend calls `clearCart` THEN the system SHALL provide a response shape that matches the established pattern so future consumers can safely access `res.data.items`

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN `clearCart` is called THEN the system SHALL CONTINUE TO empty the cart in the database  
3.2 WHEN `clearCart` returns THEN the system SHALL CONTINUE TO respond with HTTP 200  
3.3 WHEN `CartContext.clearCart()` is called THEN the system SHALL CONTINUE TO set local `items` state to `[]` regardless of the response shape

---

### Bug 11 — authController.js: `verifyOtp` Creates User Without Duplicate Email Check

#### Current Behavior (Defect)

1.1 WHEN email OTP verification succeeds and the request body includes both `name` and `password` THEN the system calls `User.create({ name, email, password })` without first checking if a user with that email already exists  
1.2 WHEN a user with that email already exists THEN the system throws a MongoDB duplicate key error (code 11000) which is caught by the global error handler and returns a confusing `{ field } already exists` 409 response, rather than a clear "email already registered" message from the business logic layer

#### Expected Behavior (Correct)

2.1 WHEN `verifyOtp` is called with `name` and `password` to inline-create a user THEN the system SHALL first check `User.findOne({ email })` and return HTTP 409 with `{ message: 'Email already registered' }` if a duplicate exists  
2.2 WHEN no duplicate exists THEN the system SHALL proceed with `User.create(...)` as before

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN OTP verification succeeds without `name`/`password` in the body THEN the system SHALL CONTINUE TO mark the OTP as verified and return `{ message: 'OTP verified successfully' }`  
3.2 WHEN OTP is invalid or expired THEN the system SHALL CONTINUE TO return HTTP 400  
3.3 WHEN the `register` endpoint is called THEN the system SHALL CONTINUE TO perform its own duplicate check independently

---

### Bug 12 — authController.js: Phone OTP Auto-Registration Generates Duplicate Derived Email on Re-Registration

#### Current Behavior (Defect)

1.1 WHEN a user registers via phone OTP THEN the system creates an account with a derived dummy email `+91{phone}@phone.dryfruithub.local`  
1.2 WHEN that user's account is deleted and the same phone number is used to register again THEN the system calls `User.create(...)` with the same derived email, potentially triggering a duplicate key error if the email unique index still has a remnant record or if any other edge case causes two documents with the same derived email to exist

#### Expected Behavior (Correct)

2.1 WHEN phone OTP verification succeeds and no existing user is found for that phone THEN the system SHALL check whether the derived dummy email is already taken before calling `User.create(...)`, and handle the collision gracefully (e.g., use a unique suffix)  
2.2 WHEN a duplicate derived email would be created THEN the system SHALL resolve the collision without throwing an unhandled 11000 error to the user

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user logs in via phone OTP and an account already exists for that phone THEN the system SHALL CONTINUE TO return the existing user's token without creating a new account  
3.2 WHEN phone OTP verification fails THEN the system SHALL CONTINUE TO return HTTP 400  
3.3 WHEN a valid phone OTP account is created THEN the system SHALL CONTINUE TO return `{ success: true, token, user }`

---

### Bug 13 — orderController.js: Stock Decremented BEFORE Order Save — No Rollback on `Order.create` Failure (Critical Data Integrity Bug)

#### Current Behavior (Defect)

1.1 WHEN placing an order, the system decrements stock for all items atomically in a loop BEFORE calling `Order.create(...)`  
1.2 WHEN `Order.create(...)` fails after stock has been decremented (e.g., due to a MongoDB write error, validation failure, or any unexpected exception) THEN the system does not roll back the already-decremented stock  
1.3 WHEN this failure occurs THEN the stock is permanently lost — products appear to have less inventory than actually exists — with no recovery path

#### Expected Behavior (Correct)

2.1 WHEN `Order.create(...)` fails after stock has been decremented THEN the system SHALL roll back stock for all items that were already decremented, restoring inventory to its pre-order state  
2.2 WHEN stock decrement succeeds for all items but order creation subsequently fails THEN the system SHALL execute the rollback loop (identical to the out-of-stock rollback already implemented) and return an appropriate error response  
2.3 WHEN order creation succeeds THEN the system SHALL NOT roll back any stock

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN an item is out of stock during the decrement loop THEN the system SHALL CONTINUE TO roll back previously decremented items and return HTTP 400 as currently implemented  
3.2 WHEN order creation succeeds THEN the system SHALL CONTINUE TO clear the user's cart and proceed to shipment creation  
3.3 WHEN a CastError occurs on a non-ObjectId product ID THEN the system SHALL CONTINUE TO skip stock decrement for that item and continue

---

## Bug Condition Summary

### Fix Checking Properties

```pascal
// Bug 1: Cart Tax Display
FUNCTION isBugCondition_1(X)
  INPUT: X = { cartItems, subtotal }
  RETURN cartItems.length > 0 AND tax_displayed = "₹0.00"
END FUNCTION

FOR ALL X WHERE isBugCondition_1(X) DO
  rendered_tax ← CartSummary.render(X)
  ASSERT rendered_tax = formatPrice(Math.round(X.subtotal * 0.08 * 100) / 100)
END FOR

// Bug 2: Guest Cart Deduplication
FUNCTION isBugCondition_2(X)
  INPUT: X = { existingItem_selectedWeight: null, newItem_selectedWeight: undefined }
  RETURN existingItem.selectedWeight === null AND newItem.selectedWeight === undefined
END FUNCTION

FOR ALL X WHERE isBugCondition_2(X) DO
  result ← guestCart.addToCart(X)
  ASSERT result.items.length = 1 AND result.items[0].quantity = 2  // incremented, not duplicated
END FOR

// Bug 9: Cancel Admin-Created Order
FUNCTION isBugCondition_9(X)
  INPUT: X = order
  RETURN X.status = 'received'
END FUNCTION

FOR ALL X WHERE isBugCondition_9(X) DO
  result ← cancelOrder(X)
  ASSERT result.status = 200 AND result.order.status = 'cancelled'
END FOR

// Bug 13: Stock Rollback on Order.create Failure
FUNCTION isBugCondition_13(X)
  INPUT: X = { stockDecremented: true, orderCreateFailed: true }
  RETURN X.stockDecremented = true AND X.orderCreateFailed = true
END FUNCTION

FOR ALL X WHERE isBugCondition_13(X) DO
  stockBefore ← Product.stock before order attempt
  result ← createOrder(X)  // Order.create throws
  stockAfter ← Product.stock after failure
  ASSERT stockAfter = stockBefore  // stock fully restored
END FOR
```

### Preservation Checking

```pascal
// For all bugs: non-buggy inputs must produce identical behavior to F (original)
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR

// Specifically for Bug 13 (most critical):
FOR ALL X WHERE order creation SUCCEEDS DO
  stockAfter ← Product.stock after order
  ASSERT stockAfter = stockBefore - item.quantity  // normal decrement preserved
  ASSERT order.status IN ['confirmed', 'pending']
END FOR
```
