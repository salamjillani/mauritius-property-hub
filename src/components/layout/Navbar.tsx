import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, Menu, X, LogOut, UserCircle } from "lucide-react";

interface NavbarProps {
  activeLanguage: "en" | "fr";
  setActiveLanguage: (lang: "en" | "fr") => void;
  activeCurrency: "USD" | "EUR" | "MUR";
  setActiveCurrency: (currency: "USD" | "EUR" | "MUR") => void;
}

const Navbar = ({
  activeLanguage,
  setActiveLanguage,
  activeCurrency,
  setActiveCurrency,
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.invalidateQueries(["user"]);
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="PropertyMauritius Logo" className="h-20 mr-2" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/properties/for-sale" className="text-gray-700 hover:text-teal-600 font-medium transition duration-200">For Sale</Link>
            <Link to="/properties/for-rent" className="text-gray-700 hover:text-teal-600 font-medium transition duration-200">For Rent</Link>
            <Link to="/properties/offices" className="text-gray-700 hover:text-teal-600 font-medium transition duration-200">Offices</Link>
            <Link to="/properties/land" className="text-gray-700 hover:text-teal-600 font-medium transition duration-200">Land</Link>
            <Link to="/agents" className="text-gray-700 hover:text-teal-600 font-medium transition duration-200">Agents</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center hover:bg-gray-100">
                  {activeLanguage.toUpperCase()}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <DropdownMenuItem onClick={() => setActiveLanguage("en")} className="cursor-pointer">English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveLanguage("fr")} className="cursor-pointer">Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center hover:bg-gray-100">
                  {activeCurrency}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <DropdownMenuItem onClick={() => setActiveCurrency("MUR")} className="cursor-pointer">MUR (₨)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCurrency("USD")} className="cursor-pointer">USD ($)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCurrency("EUR")} className="cursor-pointer">EUR (€)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center hover:bg-gray-100">
                    <User className="mr-2 h-5 w-5 text-teal-600" />
                    <span className="mr-1">{user.name || "Account"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="flex items-center border-gray-300 hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4" />Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-teal-600 hover:bg-teal-700 transition duration-200">Register</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu} className="hover:bg-gray-100">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-t space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <Link to="/properties/for-sale" className="block py-2 text-gray-700 hover:text-teal-600 font-medium" onClick={toggleMobileMenu}>For Sale</Link>
          <Link to="/properties/for-rent" className="block py-2 text-gray-700 hover:text-teal-600 font-medium" onClick={toggleMobileMenu}>For Rent</Link>
          <Link to="/properties/offices" className="block py-2 text-gray-700 hover:text-teal-600 font-medium" onClick={toggleMobileMenu}>Offices</Link>
          <Link to="/properties/land" className="block py-2 text-gray-700 hover:text-teal-600 font-medium" onClick={toggleMobileMenu}>Land</Link>
          <Link to="/agents" className="block py-2 text-gray-700 hover:text-teal-600 font-medium" onClick={toggleMobileMenu}>Agents</Link>
          
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <Button variant="ghost" className="w-1/2 justify-start" onClick={() => setActiveLanguage("en")}>
                English {activeLanguage === "en" && "✓"}
              </Button>
              <Button variant="ghost" className="w-1/2 justify-start" onClick={() => setActiveLanguage("fr")}>
                Français {activeLanguage === "fr" && "✓"}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" className="w-1/3 justify-start" onClick={() => setActiveCurrency("MUR")}>
                MUR {activeCurrency === "MUR" && "✓"}
              </Button>
              <Button variant="ghost" className="w-1/3 justify-start" onClick={() => setActiveCurrency("USD")}>
                USD {activeCurrency === "USD" && "✓"}
              </Button>
              <Button variant="ghost" className="w-1/3 justify-start" onClick={() => setActiveCurrency("EUR")}>
                EUR {activeCurrency === "EUR" && "✓"}
              </Button>
            </div>
            
            {user ? (
              <div className="space-y-2 border-t pt-2 mt-2">
                <Link to="/profile" onClick={toggleMobileMenu}>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <UserCircle className="h-4 w-4" />Profile
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />Logout
                </Button>
              </div>
            ) : (
              <div className="flex justify-between pt-2 border-t mt-2">
                <Link to="/login" className="w-1/2 pr-1" onClick={toggleMobileMenu}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="w-1/2 pl-1" onClick={toggleMobileMenu}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Register</Button>
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