import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  ChevronLeft, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  ArrowRight 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "../PropertyCard";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  address: {
    city: string;
    country: string;
  };
  images: {
    url: string;
    isMain: boolean;
  }[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  type: string;
  category: string;
}

const PropertyCategoryPage = () => {
  // Extract category from URL path instead of params
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  // The category will be the last segment in the path (for-sale, for-rent, etc.)
  const categorySlug = pathSegments[pathSegments.length - 1];
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");
  const { toast } = useToast();

  // Helper function to format category name for display
  const formatCategoryName = (slug: string | undefined) => {
    if (!slug) return "";
    
    const nameMap: Record<string, string> = {
      "for-sale": "Properties For Sale",
      "for-rent": "Properties For Rent",
      "offices": "Office Spaces",
      "land": "Land For Sale"
    };
    
    return nameMap[slug] || slug.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      console.log(`Fetching properties for category: ${categorySlug}`);
      
      try {
        let apiUrl;
        
        // Determine API endpoint based on category
        if (categorySlug === "for-sale" || categorySlug === "for-rent" || categorySlug === "offices" || categorySlug === "land") {
          apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/properties/category/${categorySlug}`;
        } else {
          // Fallback for invalid categories
          apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/properties`;
        }
        
        console.log(`Making API request to: ${apiUrl}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.data?.length || 0} properties`);
        
        // Filter properties based on category if needed
        const filteredProperties = data.data || [];
        
        // Set the properties state
        setProperties(filteredProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load properties. Please try again later.",
        });
        // Set empty array if fetch fails
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (categorySlug) {
      fetchProperties();
    }
  }, [categorySlug, toast]);

  // Helper function to format price based on currency
  const formatPrice = (price: number) => {
    switch (currency) {
      case "USD":
        return `$${(price / 45).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      case "EUR":
        return `€${(price / 50).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      default:
        return `Rs ${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
  };

  // Helper function to get property image URL - FIX APPLIED HERE
  const getImageUrl = (property: Property) => {
    // Check if property has images array and it contains at least one item
    if (property.images && property.images.length > 0 && property.images[0]?.url) {
      const image = property.images[0];
      // Check if the URL is already absolute
      if (image.url.startsWith('http')) {
        return image.url;
      }
      // Otherwise construct URL from backend
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${image.url}`;
    }
    // Default image if none available
    return "https://images.unsplash.com/photo-1582560475093-ba66accbc095?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        activeLanguage="en"
        setActiveLanguage={() => {}}
        activeCurrency={currency}
        setActiveCurrency={setCurrency}
      />
      
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            {formatCategoryName(categorySlug)}
          </h1>
          <p className="text-xl text-teal-50">
            Discover exceptional properties across Mauritius
          </p>
        </div>
      </div>
      
        <main className="flex-grow container mx-auto px-4 py-8 -mt-6">
        <div className="mb-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="bg-white hover:bg-gray-100 shadow-sm"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <span className="text-gray-500 font-medium">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
            <p className="text-gray-600 font-medium">Discovering available properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property._id} 
                property={property} 
                currency={currency}
                variant="standard"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 text-teal-600 mb-6">
              <Home className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any {formatCategoryName(categorySlug).toLowerCase()} matching your criteria at the moment.
              <br />Please check back later or try a different category.
            </p>
            <Button className="mt-6 bg-teal-600 hover:bg-teal-700" onClick={() => window.history.back()}>
              Browse Other Categories
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyCategoryPage;