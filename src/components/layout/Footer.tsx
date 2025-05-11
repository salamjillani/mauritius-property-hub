
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Property Mauritius</h3>
            <p className="text-gray-400 mb-6">
              The premier real estate platform in Mauritius, connecting buyers, sellers, and 
              renters with the best properties across the island.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties/for-sale" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties/for-rent" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/properties/offices" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Office Spaces
                </Link>
              </li>
              <li>
                <Link to="/properties/land" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Land for Sale
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Find an Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Business Avenue, Ebene, Mauritius
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-teal-400" />
                <span className="text-gray-400">+230 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-teal-400" />
                <span className="text-gray-400">info@propertymauritius.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest property updates.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Your Email Address"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link>
            <Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-teal-400 transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
          </div>
          <p>
            © {currentYear} Property Mauritius. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
