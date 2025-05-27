// components/admin/AdminLayout.tsx (update)
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Building, MapPin, Settings, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-4">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/dashboard')}
          >
            <Home className="h-5 w-5" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/users')}
          >
            <Users className="h-5 w-5" /> Users
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/agents')}
          >
            <Users className="h-5 w-5" /> Agents
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/agencies')}
          >
            <Building className="h-5 w-5" /> Agencies
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/properties')}
          >
            <MapPin className="h-5 w-5" /> Properties
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/subscriptions')}
          >
            <DollarSign className="h-5 w-5" /> Subscriptions
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/logs')}
          >
            <FileText className="h-5 w-5" /> Logs
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin/settings')}
          >
            <Settings className="h-5 w-5" /> Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" /> Logout
          </Button>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
};

export default AdminLayout;