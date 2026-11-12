
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import ApplyAccount from "./pages/ApplyAccount";
import MyAccounts from "./pages/MyAccounts";
import Transactions from "./pages/Transactions";

import AdminDashboard from "./pages/AdminDashboard";
import ManageApplications from "./pages/ManageApplications";
import ManageUsers from "./pages/ManageUsers";
import AuditLogs from "./pages/AuditLogs";

// Common layout for logged-in users and admins
const Layout = () => (
  <div className="app-layout">
    <Navbar />

    <div className="app-body">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  </div>
);

// Redirect users based on their login status and role
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Loading BalanceVault...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
      replace
    />
  );
};

// Main application component
const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Loading BalanceVault...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* User routes */}
          <Route
            path="/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/apply-account"
            element={<ApplyAccount />}
          />

          <Route
            path="/accounts"
            element={<MyAccounts />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/applications"
              element={<ManageApplications />}
            />

            <Route
              path="/admin/users"
              element={<ManageUsers />}
            />

            <Route
              path="/admin/audit-logs"
              element={<AuditLogs />}
            />
          </Route>
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};

export default App;


