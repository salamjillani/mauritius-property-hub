
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, Share2, ArrowLeft, ArrowRight, Bed, Bath, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data for featured listings
const sampleListings = [
  {
    id: "1",
    title: "Luxury Beach Villa",
    location: "Grand Baie",
    description: "Spectacular beachfront villa with private pool and ocean views",
    price: 15000000,
    type: "Villa",
    category: "for-sale",
    isPremium: true,
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a1",
      name: "Marie Laurent",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: "2",
    title: "Modern City Apartment",
    location: "Port Louis",
    description: "Contemporary apartment in downtown with great city views",
    price: 5500000,
    type: "Apartment",
    category: "for-sale",
    isPremium: false,
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a2",
      name: "Jean Dupont",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: "3",
    title: "Executive Office Space",
    location: "Ebene",
    description: "Premium office space in the Cybercity area",
    price: 65000,
    rentalPeriod: "month",
    type: "Office",
    category: "office-rent",
    isPremium: true,
    area: 200,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a3",
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: "4",
    title: "Beachfront Land",
    location: "Flic en Flac",
    description: "Prime beachfront land suitable for hotel or villa development",
    price: 28000000,
    type: "Land",
    category: "land",
    isPremium: false,
    area: 1500,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499677575031-38fdaa78a3b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a4",
      name: "Michael Wong",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: "5",
    title: "Vacation Rental Villa",
    location: "Trou aux Biches",
    description: "Stunning villa available for short-term vacation rentals",
    price: 15000,
    rentalPeriod: "week",
    type: "Villa",
    category: "for-rent",
    isPremium: true,
    bedrooms: 3,
    bathrooms: 2,
    area: 220,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a5",
      name: "Robert Smith",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  },
  {
    id: "6",
    title: "Mountain View Estate",
    location: "Vacoas",
    description: "Spacious family home with beautiful mountain views",
    price: 8800000,
    type: "House",
    category: "for-sale",
    isPremium: false,
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    images: [
      "https://images.unsplash.com/photo-1600607687644-a48forb3f59d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    agent: {
      id: "a6",
      name: "Anna Lee",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  }
];

interface FeaturedListingsProps {
  currency: "USD" | "EUR" | "MUR";
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ currency }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Record<string, number>>({});
  
  // Sort listings to display premium listings first
  const sortedListings = [...sampleListings].sort((a, b) => {
    if (a.isPremium === b.isPremium) return 0;
    return a.isPremium ? -1 : 1;
  });

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
    const listing = sampleListings.find(l => l.id === id);
    if (!listing) return;
    
    const totalSlides = listing.images.length;
    setCurrentSlide(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % totalSlides || 1
    }));
  };

  const prevSlide = (id: string) => {
    const listing = sampleListings.find(l => l.id === id);
    if (!listing) return;
    
    const totalSlides = listing.images.length;
    setCurrentSlide(prev => ({
      ...prev,
      [id]: prev[id] === 0 ? totalSlides - 1 : prev[id] - 1
    }));
  };

  // Initialize current slide for each listing
  useEffect(() => {
    const initialSlides: Record<string, number> = {};
    sampleListings.forEach(listing => {
      initialSlides[listing.id] = 0;
    });
    setCurrentSlide(initialSlides);
  }, []);

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our handpicked selection of premium properties across Mauritius
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedListings.map((listing) => (
          <Card 
            key={listing.id} 
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
              listing.isPremium 
                ? "border-2 border-amber-400 shadow-md transform hover:-translate-y-1" 
                : ""
            }`}
          >
            {/* Image carousel */}
            <div className="relative h-52 overflow-hidden">
              {listing.images.map((image, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    currentSlide[listing.id] === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Image navigation buttons */}
              {listing.images.length > 1 && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      prevSlide(listing.id);
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
                      nextSlide(listing.id);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Premium badge */}
              {listing.isPremium && (
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
                    favorites.includes(listing.id) 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-white/80 hover:bg-white text-gray-700"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(listing.id);
                  }}
                >
                  <Heart className="h-4 w-4" fill={favorites.includes(listing.id) ? "currentColor" : "none"} />
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
                <span>{listing.location}</span>
              </div>
              
              <Link to={`/properties/${listing.category}/${listing.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-700 transition mb-1">
                  {listing.title}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-blue-900">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.rentalPeriod && (
                    <span className="text-sm text-gray-500">
                      /{listing.rentalPeriod}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {listing.type}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                {listing.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{listing.bedrooms} Beds</span>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{listing.bathrooms} Baths</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  <span>{listing.area} m²</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 border-t">
              <div className="flex items-center w-full">
                <img 
                  src={listing.agent.image} 
                  alt={listing.agent.name}
                  className="h-8 w-8 rounded-full object-cover mr-2" 
                />
                <span className="text-sm font-medium">{listing.agent.name}</span>
                <Link 
                  to={`/properties/${listing.category}/${listing.id}`}
                  className="ml-auto text-sm font-medium text-teal-600 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/properties">
          <Button className="bg-blue-800 hover:bg-blue-900">View All Properties</Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedListings;
