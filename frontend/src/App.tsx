import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { CartProvider } from "./components/context/CartContext";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgetPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

import AdminDashboard from "./pages/dashboard/AdminDashboard/AdminDashboard";
import AdminDashboardOverview from "./pages/dashboard/AdminDashboard/admindashboard/AdminDashboardOverview";
import Products from "./pages/dashboard/AdminDashboard/products/Products";
import Categories from "./pages/dashboard/AdminDashboard/categories/Categories";
import Orders from "./pages/dashboard/AdminDashboard/orders/Orders";
import Reviews from "./pages/dashboard/AdminDashboard/reviews/Reviews";
import Coupons from "./pages/dashboard/AdminDashboard/coupons/Coupons";
import Inquiries from "./pages/dashboard/AdminDashboard/inquiries/Inquiries";
import Analytics from "./pages/dashboard/AdminDashboard/analytics/Analytics";
import Reports from "./pages/dashboard/AdminDashboard/reports/Reports";
import ManageUsers from "./pages/dashboard/AdminDashboard/manage-users/ManageUsers";

import Error from "./components/error/Error";
import "./styles/styles.css";

function App() {
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
      errorElement: <Error />,
    },
    {
      path: "/category/:slug",
      element: <CategoryPage />,
    },
    {
      path: "/product/:slug",
      element: <ProductPage />,
    },
    {
      path: "/cart",
      element: <CartPage />,
    },
    {
      path: "/checkout",
      element: <CheckoutPage />,
    },
    {
      path: "/account",
      element: <AccountPage />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/verify-code",
      element: <VerifyCode />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/verify-email",
      element: <VerifyEmail />,
    },
    {
      path: "/admin",
      element: isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />,
      children: [
        { path: "", element: <Navigate to="admindashboard" replace /> },
        { path: "admindashboard", element: <AdminDashboardOverview /> },
        { path: "products", element: <Products /> },
        { path: "categories", element: <Categories /> },
        { path: "orders", element: <Orders /> },
        { path: "reviews", element: <Reviews /> },
        { path: "coupons", element: <Coupons /> },
        { path: "inquiries", element: <Inquiries /> },
        { path: "analytics", element: <Analytics /> },
        { path: "reports", element: <Reports /> },
        { path: "manage-users", element: <ManageUsers /> },
      ]
    },
    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}

export default App;