import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Check } from "lucide-react";

const PropertyCard = ({ 
  property, 
  currency = "MUR",
  variant = "standard" // 'standard', 'featured', or 'simple'
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Format price based on currency
  const formatPrice = (price) => {
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

  // Toggle favorite status
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  // Get image URL (handle various cases)
  const getImageUrl = () => {
    if (!property.images || property.images.length === 0) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }
    
    const image = property.images[0];
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

  // Check if we should display amenities based on variant and availability
  const shouldShowAmenities = () => {
    return variant !== 'simple' && property.amenities && property.amenities.length > 0;
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl rounded-xl cursor-pointer ${
      property.isGoldCard
        ? "ring-2 ring-amber-400 bg-amber-50/50 scale-105"
        : variant === 'featured' 
          ? (property.isPremium ? "ring-2 ring-amber-400 shadow-md transform hover:-translate-y-2" : "transform hover:-translate-y-1")
          : ""
    }`}>
      <Link to={`/properties/${property.category || ""}/${property._id}`} className="block">
        {/* Image container with tag, favorite button, and agency logo/name */}
        <div className={`relative ${variant === 'simple' ? 'h-48' : 'h-64'} overflow-hidden`}>
          <img 
            src={getImageUrl()} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          
          {/* Property type tag */}
          <div className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-semibold rounded-full py-1 px-3 shadow-md z-10">
            {property.type || "Property"}
          </div>
          
          {/* Premium or Gold badge */}
          {(property.isPremium || property.isGoldCard) && (
            <div className="absolute top-3 left-20 bg-amber-500 text-white text-xs font-semibold rounded-full py-1 px-3 shadow-md z-10">
              {property.isGoldCard ? "Gold" : "Premium"}
            </div>
          )}
          
          {/* Agency logo and name (bottom-left) */}
          {property.agency?.name && property.agency?.logoUrl && (
            <div className="absolute bottom-3 left-3 bg-teal-600/90 text-white text-sm font-semibold rounded-full py-1 pl-2 pr-3 shadow-md flex items-center gap-2 max-w-[150px] truncate z-10">
              <img
                src={property.agency.logoUrl}
                alt={property.agency.name}
                className="h-5 w-5 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = "/default-agency-logo.png")}
              />
              <span className="truncate">{property.agency.name}</span>
            </div>
          )}
          
          {/* Heart button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              onClick={toggleFavorite}
              className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md ${
                isFavorite 
                  ? "bg-red-500 text-white" 
                  : "bg-white/60 backdrop-blur-sm text-gray-700"
              } transition-all duration-200`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
        
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            {/* Property details */}
            <div className="flex-1">
              {/* Property title */}
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                {property.title}
              </h3>
              
              {/* Location */}
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1 text-teal-600" />
                <span>{property.address?.city || "Location unavailable"}</span>
              </div>
              
              {/* Amenities section - only show for non-simple variants */}
              {shouldShowAmenities() && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3 mr-1 text-teal-600" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  {property.amenities.length > 3 && (
                    <div className="text-xs text-blue-600 px-2 py-1">
                      +{property.amenities.length - 3} more
                    </div>
                  )}
                </div>
              )}
              
              {/* Beds, Baths, Size */}
              <div className="flex items-center justify-start gap-4 mt-3 py-2 border-t border-gray-100">
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Bed className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="text-xs">{property.bedrooms}</span>
                  </div>
                )}
                
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Bath className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="text-xs">{property.bathrooms}</span>
                  </div>
                )}
                
                {property.size !== undefined && (
                  <div className="flex items-center text-gray-600">
                    <Square className="h-4 w-4 mr-1 text-amber-600" />
                    <span className="text-xs">{property.size} m²</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Price (on the right side) */}
            <div className="flex flex-col items-end">
              {/* Price tag */}
              <div className="font-bold text-blue-900 text-right">
                {formatPrice(property.price)}
                {property.rentalPeriod && (
                  <span className="text-sm text-gray-600 ml-1">
                    /{property.rentalPeriod}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default PropertyCard;