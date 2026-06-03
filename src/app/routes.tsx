import { createBrowserRouter, Navigate } from "react-router";
import { MobileShell } from "./components/MobileShell";
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
import { Orders } from "./pages/Orders";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MobileShell />,
    children: [
      { index: true, element: <Splash /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "login", element: <Login /> },
      { path: "home", element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "cart", element: <Cart /> },
      { path: "profile", element: <Profile /> },
      { path: "product/:id", element: <ProductDetails /> },
      { path: "checkout", element: <Checkout /> },
      { path: "success", element: <OrderSuccess /> },
      { path: "tracking", element: <OrderTracking /> },
      { path: "orders", element: <Orders /> },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);