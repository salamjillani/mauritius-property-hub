import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Home, Users, Building, Building2, MapPin, Settings, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">{t('Admin Panel')}</h1>
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/dashboard') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/dashboard')}
            aria-label={t('navigate_to_dashboard')}
          >
            <Home className="h-5 w-5" /> {t('Dashboard')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/users') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/users')}
            aria-label={t('navigate_to_users')}
          >
            <Users className="h-5 w-5" /> {t('Users')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/agents') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/agents')}
            aria-label={t('navigate_to_agents')}
          >
            <Users className="h-5 w-5" /> {t('agents')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/agencies') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/agencies')}
            aria-label={t('navigate_to_agencies')}
          >
            <Building className="h-5 w-5" /> {t('agencies')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/promoters') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/promoters')}
            aria-label={t('navigate_to_promoters')}
          >
            <Building2 className="h-5 w-5" /> {t('promoters')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/properties') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/properties')}
            aria-label={t('navigate_to_properties')}
          >
            <MapPin className="h-5 w-5" /> {t('properties')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/subscriptions') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/subscriptions')}
            aria-label={t('navigate_to_subscriptions')}
          >
            <DollarSign className="h-5 w-5" /> {t('Subscriptions')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/logs') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/logs')}
            aria-label={t('navigate_to_logs')}
          >
            <FileText className="h-5 w-5" /> {t('Logs')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex items-center gap-2 text-white hover:bg-gray-700 ${
              isActive('/admin/settings') ? 'bg-gray-700' : ''
            }`}
            onClick={() => navigate('/admin/settings')}
            aria-label={t('navigate_to_settings')}
          >
            <Settings className="h-5 w-5" /> {t('Settings')}
          </Button>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-white hover:bg-gray-700"
            onClick={handleLogout}
            aria-label={t('logout')}
          >
            <LogOut className="h-5 w-5" /> {t('logout')}
          </Button>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;