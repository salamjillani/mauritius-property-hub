import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ChevronLeft, MapPin, Home, Bed, Bath, Square } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <div className="min-h-screen flex flex-col">
      <Navbar 
        activeLanguage="en"
        setActiveLanguage={() => {}}
        activeCurrency={currency}
        setActiveCurrency={setCurrency}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {formatCategoryName(categorySlug)}
          </h1>
          <p className="text-gray-600 mt-2">
            Discover available {formatCategoryName(categorySlug).toLowerCase()} across Mauritius
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getImageUrl(property)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.type && (
                    <div className="absolute top-2 left-2 bg-blue-800 text-white text-sm font-medium rounded-full py-1 px-2">
                      {property.type}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                    <span className="text-teal-600 font-bold">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {property.address?.city || 'Unknown City'}, {property.address?.country || 'Unknown Country'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                  <div className="flex justify-between border-t pt-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms || 0} Beds</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms || 0} Baths</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.size || 0} m²</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 border-t">
                  <Link 
                    to={`/properties/${property.category || categorySlug}/${property._id}`}
                    className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                  >
                    View Details
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">
              We couldn't find any {formatCategoryName(categorySlug).toLowerCase()} at the moment.
              <br />Please check back later or try a different category.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyCategoryPage;