import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Home, MapPin, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
// Add this import
import AdBanner from '@/components/AdBanner';


const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "MUR");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsAuthenticated(!!token);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser({});
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    navigate("/login");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const changeCurrency = (curr) => {
    setCurrency(curr);
    localStorage.setItem("currency", curr);
  };

  return (
    <header>
      {/* Add this right after the opening <header> tag */}
      <AdBanner />
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="PropertyVueMauritius Logo" 
                className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-lg shadow-lg group-hover:shadow-teal-500/50 transition-all duration-300 group-hover:scale-105 object-contain bg-white/5 p-1"
                onError={(e) => {
                  e.target.src = "/default-logo.png";
                  e.target.onerror = null;
                }}
              />
              <div className="absolute inset-0 bg-teal-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-teal-400 font-medium transition-all duration-300 relative group px-3 py-2"
            >
              {t("home")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/properties" 
              className="text-gray-300 hover:text-teal-400 font-medium transition-all duration-300 relative group px-3 py-2"
            >
              {t("properties")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/agents" 
              className="text-gray-300 hover:text-teal-400 font-medium transition-all duration-300 relative group px-3 py-2"
            >
              {t("agents")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/agencies" 
              className="text-gray-300 hover:text-teal-400 font-medium transition-all duration-300 relative group px-3 py-2"
            >
              {t("agencies")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/promoters" 
              className="text-gray-300 hover:text-teal-400 font-medium transition-all duration-300 relative group px-3 py-2"
            >
              {t("promoters")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/articles" className="text-gray-700 hover:text-blue-600">
  {t('articles')}
</Link>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm"
                  >
                    {i18n.language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
                  <DropdownMenuItem 
                    onClick={() => changeLanguage("en")}
                    className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeLanguage("fr")}
                    className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                  >
                    Français
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm"
                  >
                    {currency}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
                  <DropdownMenuItem 
                    onClick={() => changeCurrency("MUR")}
                    className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                  >
                    MUR
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeCurrency("USD")}
                    className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                  >
                    USD
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeCurrency("EUR")}
                    className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                  >
                    EUR
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-300 rounded-full flex items-center justify-center">
                      <User size={14} className="text-gray-900" />
                    </div>
                    {user.firstName || "Profile"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      <User size={16} /> {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/favorites" 
                      className="flex items-center gap-2 text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      <Home size={16} /> {t("favorites")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/notifications" 
                      className="flex items-center gap-2 text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      <Home size={16} /> {t("notifications")}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "agent" && (
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/properties/add" 
                        className="flex items-center gap-2 text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                      >
                        <Home size={16} /> {t("add_property")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-gray-700/50"
                  >
                    <LogOut size={16} /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300 backdrop-blur-sm"
                  >
                    {t("login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white border-0 shadow-lg hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-105">
                    {t("register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              onClick={toggleMenu}
              className="text-gray-300 hover:text-teal-400 hover:bg-gray-800/50 transition-all duration-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 shadow-2xl">
            <div className="flex flex-col p-6 space-y-4">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                onClick={toggleMenu}
              >
                {t("home")}
              </Link>
              <Link 
                to="/properties" 
                className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                onClick={toggleMenu}
              >
                {t("properties")}
              </Link>
              <Link 
                to="/agents" 
                className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                onClick={toggleMenu}
              >
                {t("agents")}
              </Link>
              <Link 
                to="/agencies" 
                className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                onClick={toggleMenu}
              >
                {t("agencies")}
              </Link>
              <Link 
                to="/promoters" 
                className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                onClick={toggleMenu}
              >
                {t("promoters")}
              </Link>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                    >
                      {i18n.language.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
                    <DropdownMenuItem 
                      onClick={() => changeLanguage("en")}
                      className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => changeLanguage("fr")}
                      className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      Français
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                    >
                      {currency}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
                    <DropdownMenuItem 
                      onClick={() => changeCurrency("MUR")}
                      className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      MUR
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => changeCurrency("USD")}
                      className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      USD
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => changeCurrency("EUR")}
                      className="text-gray-300 hover:text-teal-400 hover:bg-gray-700/50"
                    >
                      EUR
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                  <Link 
                    to="/profile" 
                    className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                    onClick={toggleMenu}
                  >
                    {t("profile")}
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                    onClick={toggleMenu}
                  >
                    {t("favorites")}
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                    onClick={toggleMenu}
                  >
                    {t("notifications")}
                  </Link>
                  {user.role === "agent" && (
                    <Link 
                      to="/properties/add" 
                      className="text-gray-300 hover:text-teal-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-700/50" 
                      onClick={toggleMenu}
                    >
                      {t("add_property")}
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => { handleLogout(); toggleMenu(); }} 
                    className="flex items-center gap-2 justify-start bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-400 transition-all duration-300"
                  >
                    <LogOut size={16} /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                  <Link to="/login" onClick={toggleMenu}>
                    <Button 
                      variant="outline" 
                      className="w-full bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                    >
                      {t("login")}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white border-0 shadow-lg hover:shadow-teal-500/25 transition-all duration-300">
                      {t("register")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;