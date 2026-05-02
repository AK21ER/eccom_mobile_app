import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPages";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PageLoader from "./components/PageLoader";

function App() {
  const { isSignedIn, isLoaded, sessionId } = useAuth();

  // Wait for Clerk to finish loading
  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          !isSignedIn || !sessionId ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;