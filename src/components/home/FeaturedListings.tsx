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
            <Card 
              key={property._id} 
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl rounded-xl ${
                property.isPremium 
                  ? "ring-2 ring-amber-400 shadow-md transform hover:-translate-y-2" 
                  : "transform hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {/* Image carousel */}
              <div className="relative h-64 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  property.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        currentSlide[property._id] === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img 
                        src={getImageUrl(image)} 
                        alt={image.caption || property.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70"></div>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Home className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Image navigation buttons */}
                {property.images && property.images.length > 1 && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/50 text-white p-2 w-8 h-8 shadow-md transition-all duration-200"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/50 text-white p-2 w-8 h-8 shadow-md transition-all duration-200"
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
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Premium
                  </div>
                )}
                
                {/* Favorite and share buttons */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      favorites.includes(property._id) 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "bg-white/20 backdrop-blur-sm hover:bg-white/50 text-white"
                    } transition-all duration-200 shadow-md`}
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
                    className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/50 text-white transition-all duration-200 shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Property price badge at bottom */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-blue-900 px-3 py-1 rounded-lg shadow-md">
                  <span className="font-bold">
                    {formatPrice(property.price)}
                  </span>
                  {property.rentalPeriod && (
                    <span className="text-sm text-gray-600 ml-1">
                      /{property.rentalPeriod}
                    </span>
                  )}
                </div>
                
                {/* Property type badge at bottom */}
                <div className="absolute bottom-3 right-3 bg-blue-900/80 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-md">
                  {property.type || "Property"}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-teal-600" />
                  <span>{property.address?.city || "Location unavailable"}</span>
                </div>
                
                <Link to={`/properties/${property._id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-800 hover:text-teal-700 transition-colors duration-200 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic">
                  {property.description || "No description available"}
                </p>
                
                <div className="flex items-center justify-between mt-4 py-4 border-t border-gray-100">
                  {property.bedrooms !== undefined && property.bedrooms > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-blue-50 p-2 mb-1">
                        <Bed className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                    </div>
                  )}
                  {property.bathrooms !== undefined && property.bathrooms > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-teal-50 p-2 mb-1">
                        <Bath className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="text-xs font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                    </div>
                  )}
                  {property.size !== undefined && (
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-amber-50 p-2 mb-1">
                        <Home className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium">{property.size} m²</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="px-6 py-4 bg-gray-50 border-t">
                {property.agent ? (
                  <div className="flex items-center w-full">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        <img 
                          src={getAgentImage(property.agent)} 
                          alt={getAgentName(property.agent)}
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">{getAgentName(property.agent)}</p>
                        <p className="text-xs text-gray-500">{property.agent.title || "Agent"}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/properties/${property.category || ""}/${property._id}`}
                      className="ml-auto text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center hover:underline"
                    >
                      View Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <Link 
                    to={`/properties/${property.category || ""}/${property._id}`}
                    className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium hover:from-blue-700 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View Property Details
                  </Link>
                )}
              </CardFooter>
            </Card>
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