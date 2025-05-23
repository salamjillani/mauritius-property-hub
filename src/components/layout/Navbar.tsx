import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
  Heart,
  Globe,
  DollarSign,
  Building,
} from "lucide-react";

interface NavbarProps {
  activeLanguage?: "en" | "fr";
  setActiveLanguage: (lang: "en" | "fr") => void;
  activeCurrency?: "USD" | "EUR" | "MUR";
  setActiveCurrency: (currency: "USD" | "EUR" | "MUR") => void;
}

const Navbar = ({
  activeLanguage = "en",
  setActiveLanguage,
  activeCurrency = "MUR",
  setActiveCurrency,
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Not authenticated");
      const data = await response.json();
      return data.data || { name: "User", email: "user@example.com" }; // Fallback user data
    },
    retry: 1,
    enabled: !!localStorage.getItem("token"),
  });

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.includes(`${path}/`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#374163] shadow-md" : "bg-[#374163]/95 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="PropertyMauritius Logo"
                className="h-20 mr-2"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-logo.png"; // Fallback logo
                }}
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/properties/for-sale"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 flex items-center gap-1 ${
                isActive("/properties/for-sale")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <span>For Sale</span>
            </Link>
            <Link
              to="/properties/for-rent"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 flex items-center gap-1 ${
                isActive("/properties/for-rent")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <span>For Rent</span>
            </Link>
            <Link
              to="/properties/offices"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 flex items-center gap-1 ${
                isActive("/properties/offices")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <span>Offices</span>
            </Link>
            <Link
              to="/properties/land"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 flex items-center gap-1 ${
                isActive("/properties/land")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <span>Land</span>
            </Link>
            <Link
              to="/agents"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 ${
                isActive("/agents") ? "bg-[#4c5985] text-white" : "hover:bg-[#4c5985]"
              }`}
            >
              <span>Agents</span>
            </Link>
            <Link
              to="/agencies"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 ${
                isActive("/agencies")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <span>Agencies</span>
            </Link>
            <Link
              to="/favorites"
              className={`px-4 py-2 rounded-full text-white hover:text-white font-medium transition duration-200 flex items-center gap-1 ${
                isActive("/favorites")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985]"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isActive("/favorites")
                    ? "fill-white text-white"
                    : "fill-transparent hover:fill-red-100"
                }`}
              />
              <span>Favorites</span>
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center hover:bg-[#4c5985] rounded-full text-white"
                >
                  <Globe className="mr-1 h-4 w-4" />
                  {activeLanguage.toUpperCase()}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36 rounded-xl shadow-lg border-[#4c5985] bg-[#374163] text-white">
                <DropdownMenuItem
                  onClick={() => setActiveLanguage("en")}
                  className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                >
                  {activeLanguage === "en" && (
                    <span className="mr-2 text-white">✓</span>
                  )}
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveLanguage("fr")}
                  className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                >
                  {activeLanguage === "fr" && (
                    <span className="mr-2 text-white">✓</span>
                  )}
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center hover:bg-[#4c5985] rounded-full text-white"
                >
                  <DollarSign className="mr-1 h-4 w-4" />
                  {activeCurrency}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36 rounded-xl shadow-lg border-[#4c5985] bg-[#374163] text-white">
                <DropdownMenuItem
                  onClick={() => setActiveCurrency("MUR")}
                  className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                >
                  {activeCurrency === "MUR" && (
                    <span className="mr-2 text-white">✓</span>
                  )}
                  MUR (₨)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveCurrency("USD")}
                  className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                >
                  {activeCurrency === "USD" && (
                    <span className="mr-2 text-white">✓</span>
                  )}
                  USD ($)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveCurrency("EUR")}
                  className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                >
                  {activeCurrency === "EUR" && (
                    <span className="mr-2 text-white">✓</span>
                  )}
                  EUR (€)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 hover:bg-[#4c5985] rounded-full px-4 text-white ${
                      user.isPremium ? "border-2 border-yellow-400" : ""
                    }`} // Premium styling
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium ${
                        user.isPremium ? "bg-yellow-500" : "bg-[#5a6894]"
                      }`}
                    >
                      {userLoading
                        ? "U"
                        : user.name
                        ? user.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <span className="hidden lg:inline mr-1 font-medium">
                      {userLoading ? "Loading..." : user.name || "Account"}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl shadow-lg border-[#4c5985] bg-[#374163] text-white">
                  <div className="px-4 py-2 text-sm font-medium text-white">
                    {userLoading
                      ? "Loading..."
                      : userError
                      ? "Error loading user"
                      : user.email}
                  </div>
                  <DropdownMenuSeparator className="bg-[#4c5985]" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                    onClick={() => navigate("/profile")}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg hover:bg-[#4c5985] text-white"
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#4c5985]" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-300 rounded-lg hover:bg-[#4c5985]"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="flex items-center rounded-full border-[#5a6894] hover:bg-[#4c5985] text-white hover:border-white"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-[#374163] hover:bg-gray-200 transition duration-200 rounded-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex gap-2">
            <Link to="/favorites">
              <Button
                variant="ghost"
                className="p-2 rounded-full hover:bg-[#4c5985] text-white"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isActive("/favorites")
                      ? "fill-white text-white"
                      : "fill-transparent"
                  }`}
                />
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-[#4c5985] text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-[#374163] border-t border-[#4c5985] space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1 py-2">
            <Link
              to="/properties/for-sale"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/properties/for-sale")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="font-medium">For Sale</span>
            </Link>
            <Link
              to="/properties/for-rent"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/properties/for-rent")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="font-medium">For Rent</span>
            </Link>
            <Link
              to="/properties/offices"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/properties/offices")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="font-medium">Offices</span>
            </Link>
            <Link
              to="/properties/land"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/properties/land")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="font-medium">Land</span>
            </Link>
            <Link
              to="/agents"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/agents")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Agents</span>
            </Link>
            <Link
              to="/agencies"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/agencies")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <Building className="h-5 w-5" />
              <span className="font-medium">Agencies</span>
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
                isActive("/favorites")
                  ? "bg-[#4c5985] text-white"
                  : "hover:bg-[#4c5985] text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <Heart
                className={`h-5 w-5 ${
                  isActive("/favorites") ? "fill-white text-white" : ""
                }`}
              />
              <span className="font-medium">Favorites</span>
            </Link>
          </div>

          <div className="space-y-4 pt-3 border-t border-[#4c5985]">
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant={activeLanguage === "en" ? "default" : "outline"}
                className={`flex-1 rounded-full px-4 py-2 text-sm ${
                  activeLanguage === "en"
                    ? "bg-white text-[#374163]"
                    : "text-white border-white"
                }`}
                onClick={() => setActiveLanguage("en")}
              >
                <Globe className="h-4 w-4 mr-1" />
                English
              </Button>
              <Button
                variant={activeLanguage === "fr" ? "default" : "outline"}
                className={`flex-1 rounded-full px-4 py-2 text-sm ${
                  activeLanguage === "fr"
                    ? "bg-white text-[#374163]"
                    : "text-white border-white"
                }`}
                onClick={() => setActiveLanguage("fr")}
              >
                <Globe className="h-4 w-4 mr-1" />
                Français
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCurrency === "MUR" ? "default" : "outline"}
                className={`flex-1 rounded-full px-3 py-2 text-sm ${
                  activeCurrency === "MUR"
                    ? "bg-white text-[#374163]"
                    : "text-white border-white"
                }`}
                onClick={() => setActiveCurrency("MUR")}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                MUR (₨)
              </Button>
              <Button
                variant={activeCurrency === "USD" ? "default" : "outline"}
                className={`flex-1 rounded-full px-3 py-2 text-sm ${
                  activeCurrency === "USD"
                    ? "bg-white text-[#374163]"
                    : "text-white border-white"
                }`}
                onClick={() => setActiveCurrency("USD")}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                USD ($)
              </Button>
              <Button
                variant={activeCurrency === "EUR" ? "default" : "outline"}
                className={`flex-1 rounded-full px-3 py-2 text-sm ${
                  activeCurrency === "EUR"
                    ? "bg-white text-[#374163]"
                    : "text-white border-white"
                }`}
                onClick={() => setActiveCurrency("EUR")}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                EUR (€)
              </Button>
            </div>

            {user ? (
              <div className="space-y-2 border-t border-[#4c5985] pt-3">
                <div className="flex items-center gap-3 px-4 mb-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${
                      user.isPremium ? "bg-yellow-500" : "bg-[#5a6894]"
                    }`}
                  >
                    {userLoading
                      ? "U"
                      : user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {userLoading ? "Loading..." : user.name || "User"}
                    </div>
                    <div className="text-sm text-gray-300">
                      {userLoading
                        ? "Loading..."
                        : userError
                        ? "Error loading user"
                        : user.email}
                    </div>
                  </div>
                </div>
                <Link to="/profile" onClick={toggleMobileMenu}>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg flex items-center justify-center gap-2 border-white text-white hover:bg-[#4c5985]"
                  >
                    <UserCircle className="h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" onClick={toggleMobileMenu}>
                    <Button
                      variant="outline"
                      className="w-full rounded-lg flex items-center justify-center gap-2 border-white text-white hover:bg-[#4c5985]"
                    >
                      <UserCircle className="h-5 w-5" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full rounded-lg flex items-center justify-center gap-2 border-red-300 text-red-300 hover:bg-[#4c5985]"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex justify-between pt-3 border-t border-[#4c5985] gap-3">
                <Link to="/login" className="w-1/2" onClick={toggleMobileMenu}>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border-white text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="w-1/2" onClick={toggleMobileMenu}>
                  <Button className="w-full bg-white text-[#374163] hover:bg-gray-200 rounded-lg">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;