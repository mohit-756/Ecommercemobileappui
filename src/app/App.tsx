import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PlatformShell } from './components/PlatformShell';
import { AdminShell } from './components/AdminShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { LocationProvider } from './contexts/LocationContext';
import { AddToCartPopupProvider } from './contexts/AddToCartPopupContext';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { VerifyOtp } from './pages/VerifyOtp';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { OrderTracking } from './pages/OrderTracking';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { Addresses } from './pages/Addresses';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { RefundPolicy } from './pages/RefundPolicy';
import { ShippingInfo } from './pages/ShippingInfo';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';

function ThemeAwareToaster() {
  const { mode } = useTheme();

  return (
    <Toaster
      position="top-center"
      richColors
      theme={mode}
      toastOptions={{
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          borderColor: 'var(--border)',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <ThemeProvider>
              <CartProvider>
                <AddToCartPopupProvider>
                  <Routes>
                    <Route element={<PlatformShell />}>
                      <Route index element={<Splash />} />
                      <Route path="onboarding" element={<PublicRoute><Onboarding /></PublicRoute>} />
                      <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
                      <Route path="verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
                      <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                      <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                      <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                      <Route path="tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                      <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path="addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
                      <Route path="payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                      <Route path="privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
                      <Route path="terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
                      <Route path="refund" element={<ProtectedRoute><RefundPolicy /></ProtectedRoute>} />
                      <Route path="shipping" element={<ProtectedRoute><ShippingInfo /></ProtectedRoute>} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Route>


                    <Route element={<AdminShell />}>
                      <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                      <Route path="admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
                      <Route path="admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                    </Route>
                  </Routes>
                  <LocationSelectorModal />
                  <ThemeAwareToaster />
                </AddToCartPopupProvider>
              </CartProvider>
            </ThemeProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
