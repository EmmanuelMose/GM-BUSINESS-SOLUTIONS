import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { CartProvider } from "./components/context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgetPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

import AdminDashboard from "./pages/dashboard/AdminDashboard/AdminDashboard";
import AdminDashboardOverview from "./pages/dashboard/AdminDashboard/admindashboard/AdminDashboardOverview";
import Products from "./pages/dashboard/AdminDashboard/products/Products";
import CreateProduct from "./pages/dashboard/AdminDashboard/products/CreateProduct";
import EditProduct from "./pages/dashboard/AdminDashboard/products/EditProduct";
import Categories from "./pages/dashboard/AdminDashboard/categories/Categories";
import CreateCategory from "./pages/dashboard/AdminDashboard/categories/CreateCategory";
import EditCategory from "./pages/dashboard/AdminDashboard/categories/EditCategory";
import Orders from "./pages/dashboard/AdminDashboard/orders/Orders";
import Reviews from "./pages/dashboard/AdminDashboard/reviews/Reviews";
import Coupons from "./pages/dashboard/AdminDashboard/coupons/Coupons";
import Inquiries from "./pages/dashboard/AdminDashboard/inquiries/Inquiries";
import Analytics from "./pages/dashboard/AdminDashboard/analytics/Analytics";
import Reports from "./pages/dashboard/AdminDashboard/reports/Reports";
import ManageUsers from "./pages/dashboard/AdminDashboard/manage-users/ManageUsers";
import ManageStaff from "./pages/dashboard/AdminDashboard/manage-staff/ManageStaff";
import ManageAdmins from "./pages/dashboard/AdminDashboard/manage-admins/ManageAdmins";
import PickupStations from "./pages/dashboard/AdminDashboard/pickup-stations/PickupStations";
import CreatePickupStation from "./pages/dashboard/AdminDashboard/pickup-stations/CreatePickupStation";
import EditPickupStation from "./pages/dashboard/AdminDashboard/pickup-stations/EditPickupStation";
import Payments from "./pages/dashboard/AdminDashboard/payments/Payments";

import StaffDashboard from "./pages/dashboard/StaffDashboard/StaffDashboard";
import StaffDashboardOverview from "./pages/dashboard/StaffDashboard/staffdashboard/StaffDashboardOverview";
import StaffProducts from "./pages/dashboard/StaffDashboard/products/Products";
import StaffCategories from "./pages/dashboard/StaffDashboard/categories/Categories";
import StaffOrders from "./pages/dashboard/StaffDashboard/orders/Orders";
import StaffReviews from "./pages/dashboard/StaffDashboard/reviews/Reviews";
import StaffCoupons from "./pages/dashboard/StaffDashboard/coupons/Coupons";
import StaffInquiries from "./pages/dashboard/StaffDashboard/inquiries/Inquiries";
import StaffPickupStations from "./pages/dashboard/StaffDashboard/pickup-stations/PickupStations";

import Error from "./components/error/Error";
import "./styles/styles.css";

function App() {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const isStaff = localStorage.getItem('userRole') === 'staff';

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
      path: "/wishlist",
      element: <WishlistPage />,
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
        { path: "products/create", element: <CreateProduct /> },
        { path: "products/edit/:id", element: <EditProduct /> },
        { path: "categories", element: <Categories /> },
        { path: "categories/create", element: <CreateCategory /> },
        { path: "categories/edit/:id", element: <EditCategory /> },
        { path: "orders", element: <Orders /> },
        { path: "payments", element: <Payments /> },
        { path: "reviews", element: <Reviews /> },
        { path: "coupons", element: <Coupons /> },
        { path: "pickup-stations", element: <PickupStations /> },
        { path: "pickup-stations/create", element: <CreatePickupStation /> },
        { path: "pickup-stations/edit/:id", element: <EditPickupStation /> },
        { path: "manage-users", element: <ManageUsers /> },
        { path: "manage-staff", element: <ManageStaff /> },
        { path: "manage-admins", element: <ManageAdmins /> },
        { path: "inquiries", element: <Inquiries /> },
        { path: "analytics", element: <Analytics /> },
        { path: "reports", element: <Reports /> },
      ]
    },
    {
      path: "/staff",
      element: isStaff ? <StaffDashboard /> : <Navigate to="/login" replace />,
      children: [
        { path: "", element: <Navigate to="staffdashboard" replace /> },
        { path: "staffdashboard", element: <StaffDashboardOverview /> },
        { path: "products", element: <StaffProducts /> },
        { path: "categories", element: <StaffCategories /> },
        { path: "orders", element: <StaffOrders /> },
        { path: "reviews", element: <StaffReviews /> },
        { path: "coupons", element: <StaffCoupons /> },
        { path: "inquiries", element: <StaffInquiries /> },
        { path: "pickup-stations", element: <StaffPickupStations /> },
      ]
    },
    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;