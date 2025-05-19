import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, Share2, ArrowLeft, ArrowRight, Bed, Bath, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "../PropertyCard";

interface FeaturedListingsProps {
  currency: "USD" | "EUR" | "MUR";
}

interface PropertyImage {
  url?: string;
  caption?: string;
  isMain?: boolean;
}

interface Agent {
  _id: string;
  user?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  title?: string;
}

interface Agency {
  _id: string;
  name?: string;
  logoUrl?: string;
}

interface Property {
  _id: string;
  title: string;
  address?: {
    city?: string;
    country?: string;
  };
  description?: string;
  price: number;
  rentalPeriod?: string;
  type?: string;
  category?: string;
  isPremium?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  images?: PropertyImage[];
  agent?: Agent;
  agency?: Agency;
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ currency }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/properties/featured`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured properties');
        }
        
        const data = await response.json();
        setProperties(data.data);
        
        // Initialize current slide for each listing
        const initialSlides: Record<string, number> = {};
        data.data.forEach((property: Property) => {
          initialSlides[property._id] = 0;
        });
        setCurrentSlide(initialSlides);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching properties');
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || 'Failed to load featured properties',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, [toast]);

  const formatPrice = (price: number) => {
    let convertedPrice = price;
    let currencySymbol = "₨";
    
    // Convert price based on currency
    if (currency === "USD") {
      convertedPrice = price / 45; // Example exchange rate
      currencySymbol = "$";
    } else if (currency === "EUR") {
      convertedPrice = price / 50; // Example exchange rate
      currencySymbol = "€";
    }
    
    return `${currencySymbol} ${convertedPrice.toLocaleString()}`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const nextSlide = (id: string) => {
    const property = properties.find(p => p._id === id);
    if (!property || !property.images || property.images.length === 0) return;
    
    const totalSlides = property.images.length;
    setCurrentSlide(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % totalSlides
    }));
  };

  const prevSlide = (id: string) => {
    const property = properties.find(p => p._id === id);
    if (!property || !property.images || property.images.length === 0) return;
    
    const totalSlides = property.images.length;
    setCurrentSlide(prev => ({
      ...prev,
      [id]: prev[id] === 0 ? totalSlides - 1 : prev[id] - 1
    }));
  };
  
  const getImageUrl = (image: PropertyImage) => {
    // Handle undefined image or url
    if (!image || !image.url) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }
    
    // Check if the image URL includes http or https
    if (image.url.startsWith('http')) {
      return image.url;
    }
    
    // Otherwise, construct URL from backend uploads folder
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${image.url}`;
  };

  const getAgentName = (agent?: Agent) => {
    if (!agent || !agent.user) return "Unknown Agent";
    return `${agent.user.firstName || ''} ${agent.user.lastName || ''}`.trim() || "Unknown Agent";
  };

  const getAgentImage = (agent?: Agent) => {
    if (!agent || !agent.user || !agent.user.avatarUrl) {
      return "https://via.placeholder.com/100";
    }
    
    if (agent.user.avatarUrl.startsWith('http')) {
      return agent.user.avatarUrl;
    }
    
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${agent.user.avatarUrl}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Discovering exceptional properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-lg">
        <div className="bg-white p-8 max-w-md mx-auto rounded-xl shadow-md">
          <p className="text-red-600 font-medium mb-4">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-teal-600 bg-clip-text text-transparent mb-4">
          Featured Properties
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-teal-500 mx-auto rounded-full mb-4"></div>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Explore our handpicked selection of premium properties across Mauritius
        </p>
      </div>
      
        {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No featured properties available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard
              key={property._id} 
              property={property} 
              currency={currency}
              variant="featured"
              showAgent={true}
            />
          ))}
        </div>
      )}
      
      <div className="mt-16 text-center">
        <Link to="/properties">
          <Button className="bg-gradient-to-r from-blue-800 to-teal-700 hover:from-blue-900 hover:to-teal-800 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
            View All Properties
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedListings;