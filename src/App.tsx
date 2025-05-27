import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PropertiesForSale from "./pages/properties/PropertiesForSale";
import PropertiesForRent from "./pages/properties/PropertiesForRent";
import Offices from "./pages/properties/Offices";
import Land from "./pages/properties/Land";
import Properties from "./pages/properties/Properties";
import PropertyDetails from "./pages/properties/PropertyDetails";
import AddProperty from "./pages/properties/AddProperty";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/Users";
import AdminProperties from "./pages/admin/Properties";
import AdminAgents from "./pages/admin/Agents";
import AdminAgencies from "./pages/admin/Agencies";
import AdminSettings from "./pages/admin/Settings";
import AdminLogs from "./pages/admin/Logs";
import AgentPage from "./pages/AgentPage";
import AllAgentsPage from "./pages/AllAgentsPage";
import AgencyPage from "./pages/AgencyPage";
import AllAgenciesPage from "./pages/AllAgenciesPage";
import PromoterPage from "./pages/PromoterPage";
import ProjectDetails from "./pages/ProjectDetails";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route for authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Protected admin route
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/for-sale" element={<PropertiesForSale />} />
          <Route path="/properties/for-rent" element={<PropertiesForRent />} />
          <Route path="/properties/offices" element={<Offices />} />
          <Route path="/properties/land" element={<Land />} />
          <Route path="/properties/for-sale/:id" element={<PropertyDetails />} />
          <Route path="/properties/for-rent/:id" element={<PropertyDetails />} />
          <Route path="/properties/offices/:id" element={<PropertyDetails />} />
          <Route path="/properties/land/:id" element={<PropertyDetails />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/agents" element={<AllAgentsPage />} />
          <Route
            path="/agencies"
            element={
              <ErrorBoundary>
                <AllAgenciesPage />
              </ErrorBoundary>
            }
          />
          <Route path="/agent/:id" element={<AgentPage />} />
          <Route path="/agency/:id" element={<AgencyPage />} />
          <Route path="/promoters/:id" element={<PromoterPage />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />

          {/* Protected User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/add"
            element={
              <ProtectedRoute>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <AdminRoute>
                <AdminProperties />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <AdminRoute>
                <AdminSubscriptions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <AdminRoute>
                <AdminAgents />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/agencies"
            element={
              <AdminRoute>
                <AdminAgencies />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AdminRoute>
                <AdminLogs />
              </AdminRoute>
            }
          />

          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;