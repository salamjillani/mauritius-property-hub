import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/Dashboard";
import AgentPage from '@/pages/AgentPage';
import AllAgentsPage from '@/pages/AllAgentsPage';
import AdminUsers from "./pages/admin/Users";
import AdminProperties from "./pages/admin/Properties";
import NotFound from "./pages/NotFound";
//import Agents from "./pages/agents/Agents";
//import AgentDetails from "./pages/agents/AgentDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
            <Route path="/agent/:id" element={<AgentPage />} />
            <Route path="/agents" element={<AllAgentsPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/properties/for-sale" element={<PropertiesForSale />} />
          <Route path="/properties/for-rent" element={<PropertiesForRent />} />
          <Route path="/properties/offices" element={<Offices />} />
          <Route path="/properties/land" element={<Land />} />

          {/* Add category-specific detail routes */}
          <Route path="/properties/for-sale/:id" element={<PropertyDetails />} />
          <Route path="/properties/for-rent/:id" element={<PropertyDetails />} />
          <Route path="/properties/offices/:id" element={<PropertyDetails />} />
          <Route path="/properties/land/:id" element={<PropertyDetails />} />
          {/* Keep the general routes below */}
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/properties" element={<AdminProperties />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
