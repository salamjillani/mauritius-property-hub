
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, Menu, X } from "lucide-react";

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-teal-600">Property</span>
              <span className="text-2xl font-bold text-blue-800">Mauritius</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/properties/for-sale" className="text-gray-700 hover:text-teal-600 transition">
              For Sale
            </Link>
            <Link to="/properties/for-rent" className="text-gray-700 hover:text-teal-600 transition">
              For Rent
            </Link>
            <Link to="/properties/offices" className="text-gray-700 hover:text-teal-600 transition">
              Offices
            </Link>
            <Link to="/properties/land" className="text-gray-700 hover:text-teal-600 transition">
              Land
            </Link>
            <Link to="/agents" className="text-gray-700 hover:text-teal-600 transition">
              Agents
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  {activeLanguage.toUpperCase()}{" "}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveLanguage("fr")}>
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  {activeCurrency}{" "}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveCurrency("MUR")}>
                  MUR (₨)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCurrency("USD")}>
                  USD ($)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCurrency("EUR")}>
                  EUR (€)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons */}
            <Link to="/login">
              <Button variant="outline" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-teal-600 hover:bg-teal-700">Register</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-t space-y-3">
          <Link
            to="/properties/for-sale"
            className="block py-2 text-gray-700 hover:text-teal-600"
            onClick={toggleMobileMenu}
          >
            For Sale
          </Link>
          <Link
            to="/properties/for-rent"
            className="block py-2 text-gray-700 hover:text-teal-600"
            onClick={toggleMobileMenu}
          >
            For Rent
          </Link>
          <Link
            to="/properties/offices"
            className="block py-2 text-gray-700 hover:text-teal-600"
            onClick={toggleMobileMenu}
          >
            Offices
          </Link>
          <Link
            to="/properties/land"
            className="block py-2 text-gray-700 hover:text-teal-600"
            onClick={toggleMobileMenu}
          >
            Land
          </Link>
          <Link
            to="/agents"
            className="block py-2 text-gray-700 hover:text-teal-600"
            onClick={toggleMobileMenu}
          >
            Agents
          </Link>
          <div className="pt-2 flex justify-between">
            <Link to="/login" className="w-1/2 pr-1">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
            <Link to="/register" className="w-1/2 pl-1">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Register</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
