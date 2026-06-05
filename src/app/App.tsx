import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MobileShell } from './components/MobileShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
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
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<MobileShell />}>
              <Route index element={<Splash />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="login" element={<Login />} />
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
              <Route path="admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>
          <Toaster position="top-center" richColors />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
