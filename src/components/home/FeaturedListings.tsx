import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, Share2, ArrowLeft, ArrowRight, Bed, Bath, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading featured properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our handpicked selection of premium properties across Mauritius
        </p>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No featured properties available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card 
              key={property._id} 
              className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                property.isPremium 
                  ? "border-2 border-amber-400 shadow-md transform hover:-translate-y-1" 
                  : ""
              }`}
            >
              {/* Image carousel */}
              <div className="relative h-52 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  property.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        currentSlide[property._id] === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img 
                        src={getImageUrl(image)} 
                        alt={image.caption || property.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Image navigation buttons */}
                {property.images && property.images.length > 1 && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white p-1"
                      onClick={(e) => {
                        e.preventDefault();
                        prevSlide(property._id);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white p-1"
                      onClick={(e) => {
                        e.preventDefault();
                        nextSlide(property._id);
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Premium badge */}
                {property.isPremium && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Premium
                  </div>
                )}
                
                {/* Favorite and share buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`rounded-full p-1 ${
                      favorites.includes(property._id) 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "bg-white/80 hover:bg-white text-gray-700"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(property._id);
                    }}
                  >
                    <Heart className="h-4 w-4" fill={favorites.includes(property._id) ? "currentColor" : "none"} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-full bg-white/80 hover:bg-white p-1"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{property.address?.city || "Location unavailable"}</span>
                </div>
                
                <Link to={`/properties/${property._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-700 transition mb-1">
                    {property.title}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 line-clamp-2">{property.description || "No description available"}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-blue-900">
                      {formatPrice(property.price)}
                    </span>
                    {property.rentalPeriod && (
                      <span className="text-sm text-gray-500">
                        /{property.rentalPeriod}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.type || "Property"}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                  {property.bedrooms !== undefined && property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                  )}
                  {property.bathrooms !== undefined && property.bathrooms > 0 && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  )}
                  {property.size !== undefined && (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      <span>{property.size} m²</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 border-t">
                {property.agent ? (
                  <div className="flex items-center w-full">
                    <img 
                      src={getAgentImage(property.agent)} 
                      alt={getAgentName(property.agent)}
                      className="h-8 w-8 rounded-full object-cover mr-2" 
                    />
                    <span className="text-sm font-medium">{getAgentName(property.agent)}</span>
                    <Link 
                      to={`/properties/${property.category || ""}/${property._id}`}
                      className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                ) : (
                  <Link 
                    to={`/properties/${property.category || ""}/${property._id}`}
                    className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                  >
                    View Details
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link to="/properties">
          <Button className="bg-blue-800 hover:bg-blue-900">View All Properties</Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedListings;