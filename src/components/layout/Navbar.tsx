// components/layout/Navbar.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Navbar = ({ activeLanguage, setActiveLanguage, activeCurrency, setActiveCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <img src="/logo.png" alt="PropertyMauritius Logo" className="h-12" />
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link to="/properties" className="text-gray-600 hover:text-teal-600">Properties</Link>
          <Link to="/agents" className="text-gray-600 hover:text-teal-600">Agents</Link>
          <Link to="/agencies" className="text-gray-600 hover:text-teal-600">Agencies</Link>
          <Link to="/promoters" className="text-gray-600 hover:text-teal-600">Promoters</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-gray-600 hover:text-teal-600">Profile</Link>
              <Link to="/favorites" className="text-gray-600 hover:text-teal-600">Favorites</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-teal-600">Admin</Link>
              )}
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-teal-600">Login</Link>
              <Link to="/register" className="text-gray-600 hover:text-teal-600">Register</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select value={activeLanguage} onValueChange={setActiveLanguage}>
            <SelectTrigger className="w-24">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeCurrency} onValueChange={setActiveCurrency}>
            <SelectTrigger className="w-24">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="MUR">MUR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white p-4">
          <Link to="/properties" className="block py-2 text-gray-600 hover:text-teal-600">Properties</Link>
          <Link to="/agents" className="block py-2 text-gray-600 hover:text-teal-600">Agents</Link>
          <Link to="/agencies" className="block py-2 text-gray-600 hover:text-teal-600">Agencies</Link>
          <Link to="/promoters" className="block py-2 text-gray-600 hover:text-teal-600">Promoters</Link>
          {user ? (
            <>
              <Link to="/profile" className="block py-2 text-gray-600 hover:text-teal-600">Profile</Link>
              <Link to="/favorites" className="block py-2 text-gray-600 hover:text-teal-600">Favorites</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block py-2 text-gray-600 hover:text-teal-600">Admin</Link>
              )}
              <Button onClick={handleLogout} className="w-full mt-2">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-600 hover:text-teal-600">Login</Link>
              <Link to="/register" className="block py-2 text-gray-600 hover:text-teal-600">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;