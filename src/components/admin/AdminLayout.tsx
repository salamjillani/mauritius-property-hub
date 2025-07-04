import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Home, Users, Building, Building2, MapPin, Settings, FileText, DollarSign, Menu, X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/admin/dashboard', icon: Home, label: t('Dashboard') },
    { path: '/admin/users', icon: Users, label: t('Users') },
    { path: '/admin/agents', icon: Users, label: t('agents') },
    { path: '/admin/agencies', icon: Building, label: t('agencies') },
    { path: '/admin/articles', icon: FileText, label: t('Articles') },
    { path: '/admin/advertisements', icon: Megaphone, label: t('Advertisements') },
    { path: '/admin/promoters', icon: Building2, label: t('promoters') },
    { path: '/admin/properties', icon: MapPin, label: t('properties') },
    { path: '/admin/requests', icon: FileText, label: t('Requests') },
    { path: '/admin/subscriptions', icon: DollarSign, label: t('Subscriptions') },
    { path: '/admin/logs', icon: FileText, label: t('Logs') },
    { path: '/admin/settings', icon: Settings, label: t('Settings') },
 
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-lg border-slate-200 hover:bg-slate-50"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80 xl:w-72
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        backdrop-blur-xl border-r border-slate-700/50
        transition-transform duration-300 ease-in-out
        shadow-2xl lg:shadow-xl
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t('Admin Panel')}
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {navigationItems.map(({ path, icon: Icon, label }) => (
              <Button
                key={path}
                variant="ghost"
                className={`
                  w-full flex items-center gap-3 h-12 px-4 rounded-xl
                  text-slate-300 hover:text-white font-medium
                  transition-all duration-200 ease-in-out
                  ${isActive(path) 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]' 
                    : 'hover:bg-slate-700/50 hover:scale-[1.01]'
                  }
                `}
                onClick={() => handleNavigation(path)}
                aria-label={`navigate_to_${label.toLowerCase()}`}
              >
                <Icon className={`h-5 w-5 ${isActive(path) ? 'text-blue-100' : 'text-slate-400'}`} />
                <span className="text-sm font-medium truncate">{label}</span>
              </Button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-700/50">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 h-12 px-4 rounded-xl
                       text-slate-300 hover:text-white font-medium
                       hover:bg-red-600/20 hover:border-red-500/30 border border-transparent
                       transition-all duration-200 ease-in-out hover:scale-[1.01]"
              onClick={handleLogout}
              aria-label={t('logout')}
            >
              <LogOut className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden h-16 flex items-center justify-center border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            {navigationItems.find(item => isActive(item.path))?.label || t('Admin Panel')}
          </h2>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-6rem)]">
              <div className="p-6 sm:p-8 lg:p-10">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;