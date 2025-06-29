import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Properties from './pages/properties/Properties';
import PropertyDetails from './pages/properties/PropertyDetails';
import AddProperty from './pages/properties/AddProperty';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsers from './pages/admin/Users';
import AdminProperties from './pages/admin/Properties';
import AdminAgents from './pages/admin/Agents';
import AdminAgencies from './pages/admin/Agencies';
import AdminPromoters from './pages/admin/AdminPromoters';
import AdminSettings from './pages/admin/Settings';
import AdminLogs from './pages/admin/Logs';
import AdminRequests from './pages/admin/AdminRequests';
import AgentPage from './pages/AgentPage';
import AllAgentsPage from './pages/AllAgentsPage';
import AgencyPage from './pages/AgencyPage';
import AllAgenciesPage from './pages/AllAgenciesPage';
import ProjectDetails from './pages/ProjectDetails';
import Favorites from './pages/Favorites';
import PromoterPage from './pages/PromoterPage';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import Verification from './pages/Verification';
import MapView from './pages/MapView';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import Articles from './pages/Articles';
import AdminArticles from './pages/admin/Articles';
import AdminAdvertisements from './pages/admin/Advertisements';
import ArticleForm from './components/ArticleForm';
import AdvertisementForm from './components/AdvertisementForm';

// Type for API errors
interface ApiError extends Error {
  response?: {
    status: number;
  };
}

// Type for user stored in localStorage
interface User {
  _id: string;
  role: 'individual' | 'agent' | 'agency' | 'promoter' | 'admin' | 'sub-admin';
  [key: string]: any;
}

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        const apiError = error as ApiError;
        if (apiError?.response?.status === 401 || apiError?.response?.status === 403) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// Protected Route with token validation
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // Optional: Validate token with API (uncomment to enable)
  /*
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    };
    validateToken();
  }, [token]);
  */

  return <>{children}</>;
};

// Admin Route with role validation
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  let user: User | null = null;

  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser) as User;
    }
  } catch {
    user = null;
  }

  if (!token || !user?.role || !['admin', 'sub-admin'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Focus management for accessibility
const FocusManager = () => {
  useEffect(() => {
    const handleRouteChange = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        mainContent.removeAttribute('tabindex');
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <FocusManager />
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:category/:id" element={<PropertyDetails />} />
              <Route path="/properties/:id/reviews" element={<Reviews />} />
              <Route path="/agents" element={<AllAgentsPage />} />
              <Route path="/agencies" element={<AllAgenciesPage />} />
              <Route path="/agent/:id" element={<AgentPage />} />
              <Route path="/agency/:id" element={<AgencyPage />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/article/:id" element={<Articles />} />

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
                path="/promoters"
                element={
                  <ProtectedRoute>
                    <PromoterPage />
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
                path="/properties/:id/verify"
                element={
                  <ProtectedRoute>
                    <Verification />
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
                path="/admin/promoters"
                element={
                  <AdminRoute>
                    <AdminPromoters />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <AdminRoute>
                    <AdminRequests />
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
  path="/admin/articles"
  element={
    <AdminRoute>
      <AdminArticles />
    </AdminRoute>
  }
/>
<Route
  path="/admin/articles/:id/edit"
  element={
    <AdminRoute>
      <ArticleForm />
    </AdminRoute>
  }
/>
<Route
  path="/admin/advertisements"
  element={
    <AdminRoute>
      <AdminAdvertisements />
    </AdminRoute>
  }
/>
<Route
  path="/admin/advertisements/:id/edit"
  element={
    <AdminRoute>
      <AdvertisementForm />
    </AdminRoute>
  }
/>
// Add these new routes in the admin section
<Route
  path="/admin/article/new"
  element={
    <AdminRoute>
      <ArticleForm />
    </AdminRoute>
  }
/>
<Route
  path="/admin/article/edit/:id"
  element={
    <AdminRoute>
      <ArticleForm />
    </AdminRoute>
  }
/>
<Route
  path="/admin/advertisement/new"
  element={
    <AdminRoute>
      <AdvertisementForm />
    </AdminRoute>
  }
/>
<Route
  path="/admin/advertisement/edit/:id"
  element={
    <AdminRoute>
      <AdvertisementForm />
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
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;