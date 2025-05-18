import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              About Us
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-teal-500"></span>
            </h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              The premier real estate platform in Mauritius, connecting buyers, sellers, and 
              renters with the best properties across the island.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="bg-gray-800 p-2.5 rounded-full text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2.5 rounded-full text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2.5 rounded-full text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2.5 rounded-full text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-teal-500"></span>
            </h3>
            <ul className="space-y-3">
              <li className="transition-transform hover:translate-x-2 duration-300">
                <Link to="/properties/for-sale" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-teal-500" />
                  Properties for Sale
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-2 duration-300">
                <Link to="/properties/for-rent" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-teal-500" />
                  Properties for Rent
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-2 duration-300">
                <Link to="/properties/offices" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-teal-500" />
                  Office Spaces
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-2 duration-300">
                <Link to="/properties/land" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-teal-500" />
                  Land for Sale
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-2 duration-300">
                <Link to="/agents" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-teal-500" />
                  Find an Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-teal-500"></span>
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <div className="bg-gray-800 p-2 rounded-lg mr-3 text-teal-400 flex-shrink-0 mt-1">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-gray-300 leading-relaxed">
                  123 Business Avenue, Ebene, Mauritius
                </span>
              </li>
              <li className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-3 text-teal-400 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-gray-300">+230 123 4567</span>
              </li>
              <li className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-3 text-teal-400 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-gray-300">info@propertymauritius.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white relative inline-block">
              Newsletter
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-teal-500"></span>
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Subscribe to our newsletter for the latest property updates and exclusive offers.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  className="bg-gray-800 border-gray-700 text-white h-12 pl-4 pr-12 rounded-lg focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-500"
                />
                <Button type="submit" className="absolute right-0 top-0 bottom-0 bg-teal-600 hover:bg-teal-700 rounded-r-lg px-3">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">We respect your privacy. No spam, ever.</p>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors">About Us</Link>
            <Link to="/terms" className="text-gray-300 hover:text-teal-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-300 hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link to="/faq" className="text-gray-300 hover:text-teal-400 transition-colors">FAQ</Link>
            <Link to="/contact" className="text-gray-300 hover:text-teal-400 transition-colors">Contact</Link>
          </div>
          <p className="text-gray-400">
            © {currentYear} Property Mauritius. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;