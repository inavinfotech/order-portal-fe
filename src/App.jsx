import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Workflow from "./pages/Workflow";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";
// import './App.css';

const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/order/login" replace />;
  return children;
};

const PathGuard = ({ children }) => {
  const location = useLocation();
  if (!location.pathname.startsWith("/order")) {
    return <Navigate to="/order/dashboard" replace />;
  }
  return children;
};

import { SettingsProvider } from "./context/SettingsContext";

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <PathGuard>
            <Routes>
              {/* Redirect root to /order */}
              <Route
                path="/"
                element={<Navigate to="/order/dashboard" replace />}
              />

              <Route path="/order/login" element={<Login />} />
              <Route
                path="/order"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="apps" element={<Applications />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="workflow" element={<Workflow />} />
                <Route path="settings" element={<Settings index />} />
              </Route>

              {/* Catch-all for non-/order paths */}
              <Route
                path="*"
                element={<Navigate to="/order/dashboard" replace />}
              />
            </Routes>
          </PathGuard>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
