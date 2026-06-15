import { createBrowserRouter, Navigate } from "react-router";
import { MobileShell } from "./components/MobileShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Splash } from "./pages/Splash";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Cart } from "./pages/Cart";
import { Profile } from "./pages/Profile";
import { ProductDetails } from "./pages/ProductDetails";
import { Checkout } from "./pages/Checkout";
import { OrderSuccess } from "./pages/OrderSuccess";
import { OrderTracking } from "./pages/OrderTracking";
import { Addresses } from "./pages/Addresses";
import { Orders } from "./pages/Orders";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminProducts } from "./pages/AdminProducts";
import { AdminOrders } from "./pages/AdminOrders";
import { AdminCategories } from "./pages/AdminCategories";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MobileShell />,
    children: [
      { index: true, element: <Splash /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "login", element: <Login /> },
      { path: "home", element: <ProtectedRoute><Home /></ProtectedRoute> },
      { path: "search", element: <ProtectedRoute><Search /></ProtectedRoute> },
      { path: "cart", element: <ProtectedRoute><Cart /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "product/:id", element: <ProtectedRoute><ProductDetails /></ProtectedRoute> },
      { path: "checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: "success", element: <ProtectedRoute><OrderSuccess /></ProtectedRoute> },
      { path: "tracking", element: <ProtectedRoute><OrderTracking /></ProtectedRoute> },
      { path: "orders", element: <ProtectedRoute><Orders /></ProtectedRoute> },
      { path: "addresses", element: <ProtectedRoute><Addresses /></ProtectedRoute> },
      { path: "admin", element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
      { path: "admin/products", element: <ProtectedRoute><AdminProducts /></ProtectedRoute> },
      { path: "admin/orders", element: <ProtectedRoute><AdminOrders /></ProtectedRoute> },
      { path: "admin/categories", element: <ProtectedRoute><AdminCategories /></ProtectedRoute> },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);
