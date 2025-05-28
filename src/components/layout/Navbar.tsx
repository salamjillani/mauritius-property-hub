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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          PropertyHub
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-primary">
            {t("home")}
          </Link>
          <Link to="/properties" className="text-gray-600 hover:text-primary">
            {t("properties")}
          </Link>
          <Link to="/agents" className="text-gray-600 hover:text-primary">
            {t("agents")}
          </Link>
          <Link to="/agencies" className="text-gray-600 hover:text-primary">
            {t("agencies")}
          </Link>
          <Link to="/map" className="text-gray-600 hover:text-primary">
            {t("map_view")}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{i18n.language.toUpperCase()}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("fr")}>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{currency}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeCurrency("MUR")}>MUR</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeCurrency("USD")}>USD</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeCurrency("EUR")}>EUR</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User size={16} />
                  {user.firstName || "Profile"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User size={16} /> {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2">
                    <Home size={16} /> {t("favorites")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="flex items-center gap-2">
                    <Home size={16} /> {t("notifications")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "agent" && (
                  <DropdownMenuItem asChild>
                    <Link to="/properties/add" className="flex items-center gap-2">
                      <Home size={16} /> {t("add_property")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">{t("login")}</Button>
              </Link>
              <Link to="/register">
                <Button>{t("register")}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
              {t("home")}
            </Link>
            <Link to="/properties" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
              {t("properties")}
            </Link>
            <Link to="/agents" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
              {t("agents")}
            </Link>
            <Link to="/agencies" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
              {t("agencies")}
            </Link>
            <Link to="/map" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
              {t("map_view")}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{i18n.language.toUpperCase()}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("fr")}>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{currency}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeCurrency("MUR")}>MUR</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeCurrency("USD")}>USD</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeCurrency("EUR")}>EUR</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
                  {t("profile")}
                </Link>
                <Link to="/favorites" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
                  {t("favorites")}
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
                  {t("notifications")}
                </Link>
                {user.role === "agent" && (
                  <Link to="/properties/add" className="text-gray-600 hover:text-primary" onClick={toggleMenu}>
                    {t("add_property")}
                  </Link>
                )}
                <Button variant="outline" onClick={() => { handleLogout(); toggleMenu(); }} className="flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">{t("login")}</Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button className="w-full">{t("register")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;