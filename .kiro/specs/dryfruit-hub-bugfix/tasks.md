# Implementation Tasks

## Frontend Fixes

- [x] 1. Fix Cart.tsx tax display — calculate and show 8% tax in cart summary
  - [x] 1.1 Add `tax = Math.round(subtotal * 0.08 * 100) / 100` calculation in Cart.tsx
  - [x] 1.2 Include tax in the `total` calculation (`subtotal + shipping + tax`)
  - [x] 1.3 Replace the hardcoded `₹0.00` tax display with `formatPrice(tax)`
  - **File**: `src/app/pages/Cart.tsx`

- [x] 2. Fix CartContext.tsx guest cart null vs undefined selectedWeight deduplication bug
  - [x] 2.1 Normalize `selectedWeight` to `undefined` instead of `null` when no weight is provided in guest `addToCart`
  - [x] 2.2 Update the duplicate-detection `find` to use a loose equality or normalize both sides
  - **File**: `src/app/contexts/CartContext.tsx`

- [ ] 3. Fix AuthContext.tsx event listeners registered inside token-conditional useEffect
  - [-] 3.1 Extract `auth:logout` and `auth:login` event listener registration into a separate `useEffect` with `[]` dependency (runs once on mount)
  - [~] 3.2 Keep the profile-fetching logic in its own `useEffect` that depends on `token`
  - [~] 3.3 Ensure the listener cleanup runs on unmount only
  - **File**: `src/app/contexts/AuthContext.tsx`

- [ ] 4. Fix AuthContext.tsx login/loginWithGoogle/register return type mismatch (Promise<void> vs actual User return)
  - [~] 4.1 Update `AuthContextType` interface: change `login`, `loginWithGoogle`, `register` return types from `Promise<void>` to `Promise<User>`
  - [~] 4.2 Remove the implicit `return userData` calls (they already return) and ensure the types are consistent
  - **File**: `src/app/contexts/AuthContext.tsx`

- [ ] 5. Fix Checkout.tsx misleading payment method IDs (upi/card/wallet all map to razorpay)
  - [~] 5.1 Consolidate the `paymentMethods` array to two options: `{ id: 'razorpay', name: 'Pay Online', ... }` and `{ id: 'cod', name: 'Cash on Delivery', ... }`
  - [~] 5.2 Add a descriptive subtitle to the Razorpay option mentioning UPI, Card, Wallet are supported
  - [~] 5.3 Remove the silent `paymentMethod === 'cod' ? 'cod' : 'razorpay'` mapping in `handlePlaceOrder` since state is now direct
  - [~] 5.4 Set default `paymentMethod` state to `'razorpay'` instead of `'cod'` (or keep `'cod'` as default — match current default)
  - **File**: `src/app/pages/Checkout.tsx`

- [ ] 6. Fix Home.tsx useEffect missing user dependency and detectLocation stale closure
  - [~] 6.1 Add `user` to the location popup `useEffect` dependency array so it re-evaluates when auth state changes
  - [~] 6.2 Add `detectLocation` to the `handleAllowLocation` callback dependency array (wrap in `useCallback` if needed)
  - **File**: `src/app/pages/Home.tsx`

- [ ] 7. Fix ProductDetails.tsx checkWishlistStatus stale user reference
  - [~] 7.1 Add `user` to the `useEffect([id, navigate])` dependency array so wishlist status re-checks when auth resolves
  - [~] 7.2 Alternatively, extract `checkWishlistStatus` into a separate `useEffect` that depends on `[product, user]`
  - **File**: `src/app/pages/ProductDetails.tsx`

## Backend Fixes

- [ ] 8. Fix orderController.js stock decrement — use variant stock instead of top-level stock for variant products
  - [~] 8.1 Check if `item.weight` is set to determine variant vs top-level stock update path
  - [~] 8.2 For variant items: use `Product.findOneAndUpdate` with `variants.weight` match and `variants.$.stock` decrement with `$gte` check
  - [~] 8.3 For non-variant items: keep existing top-level `stock` decrement logic
  - [~] 8.4 Ensure rollback works for both variant and non-variant paths
  - **File**: `backend/src/controllers/orderController.js`

- [ ] 9. Fix orderController.js cancelOrder — add 'received' to the list of cancellable statuses
  - [~] 9.1 Update the cancellation guard: `if (!['pending', 'confirmed', 'received'].includes(order.status))`
  - **File**: `backend/src/controllers/orderController.js`

- [ ] 10. Fix cartController.js clearCart response — return consistent cart structure with empty items array
  - [~] 10.1 After clearing, return `{ message: 'Cart cleared', items: [] }` instead of `{ message: 'Cart cleared' }`
  - **File**: `backend/src/controllers/cartController.js`

- [ ] 11. Fix authController.js verifyOtp — add duplicate email check before inline user creation
  - [~] 11.1 Before `User.create({ name, email, password })` in the `verifyOtp` handler, add `const existingUser = await User.findOne({ email })`
  - [~] 11.2 If `existingUser` exists, return `res.status(409).json({ message: 'Email already registered' })`
  - **File**: `backend/src/controllers/authController.js`

- [ ] 12. Fix authController.js phone OTP auto-registration — handle duplicate derived email collision
  - [~] 12.1 Before `User.create(...)` for phone registration, check `User.findOne({ email: dummyEmail })`
  - [~] 12.2 If the derived email exists (collision), append a random suffix: `${formattedPhone}_${crypto.randomBytes(4).toString('hex')}@phone.dryfruithub.local`
  - **File**: `backend/src/controllers/authController.js`

- [ ] 13. Fix orderController.js critical stock rollback — add rollback on Order.create failure
  - [~] 13.1 Wrap `Order.create(...)` in a try/catch block
  - [~] 13.2 In the catch block, iterate `decrementedItems` and call `Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })` for each (or variant rollback for variant items after Bug 8 fix)
  - [~] 13.3 Re-throw or return 500 after rollback completes
  - **File**: `backend/src/controllers/orderController.js`
