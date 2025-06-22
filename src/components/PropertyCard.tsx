import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Check } from "lucide-react";

const PropertyCard = ({
  property,
  isExpired,
  currency = "MUR",
  variant = "standard",
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price) => {
    let convertedPrice = price;
    let currencySymbol = "₨";

    if (currency === "USD") {
      convertedPrice = price / 45;
      currencySymbol = "$";
    } else if (currency === "EUR") {
      convertedPrice = price / 50;
      currencySymbol = "€";
    }

    return `${currencySymbol} ${convertedPrice.toLocaleString()}`;
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getImageUrl = () => {
    if (!property.images || property.images.length === 0) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    const image = property.images[0];
    if (!image || !image.url) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (image.url.startsWith("http")) {
      return image.url;
    }

    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${image.url}`;
  };

  return (
    <Card
      className={`group overflow-hidden transition-all duration-500 ease-in-out hover:shadow-2xl rounded-2xl cursor-pointer relative ${
        property.isGoldCard
          ? "bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-orange-50/70 border-2 border-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 shadow-xl transform hover:scale-[1.03] hover:shadow-amber-200/50 ring-1 ring-amber-200/30 backdrop-blur-sm"
          : variant === "featured"
          ? "bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700/50 shadow-lg transform hover:-translate-y-3 hover:shadow-teal-500/20 ring-1 ring-gray-700/30"
          : "bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700/60 transform hover:-translate-y-2 hover:shadow-xl shadow-md"
      } ${isExpired ? "opacity-75 grayscale-[0.3]" : ""}`}
    >
      {property.isGoldCard && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent transform -skew-x-12 animate-pulse opacity-60 pointer-events-none"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-yellow-400/30 to-orange-400/20 rounded-2xl blur-sm opacity-60 animate-pulse"></div>
        </>
      )}

      <Link
        to={`/properties/${property.category || ""}/${property._id}`}
        className="block relative z-10"
      >
        <div
          className={`relative ${
            variant === "simple" ? "h-48 sm:h-52" : "h-56 sm:h-64 lg:h-72"
          } overflow-hidden ${property.isGoldCard ? "ring-2 ring-amber-300/50 ring-inset" : ""}`}
        >
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
          />

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-20">
            {property.isFeatured && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full py-1.5 px-3 shadow-lg">
                Featured
              </div>
            )}
            {property.isGoldCard && !property.isFeatured && (
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full py-1.5 px-3 shadow-lg">
                Gold Card
              </div>
            )}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-full py-1.5 px-3 shadow-lg">
              {property.type || "Property"}
            </div>
          </div>

          {property.agency?.name && property.agency?.logoUrl && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/95 backdrop-blur-md text-gray-800 text-xs sm:text-sm font-semibold rounded-full py-1.5 sm:py-2 pl-2 sm:pl-3 pr-3 sm:pr-4 shadow-lg flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-[160px] truncate z-20 border border-white/40">
              <img
                src={property.agency.logoUrl}
                alt={property.agency.name}
                className="h-4 w-4 sm:h-6 sm:w-6 rounded-full object-cover ring-2 ring-white/50"
                onError={(e) => (e.currentTarget.src = "/default-agency-logo.png")}
              />
              <span className="truncate">{property.agency.name}</span>
            </div>
          )}

          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
            <button
              onClick={toggleFavorite}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                isFavorite
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110"
                  : "bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:scale-105"
              } border border-white/30`}
            >
              <Heart
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className={`absolute inset-0 ${
            property.isGoldCard 
              ? "bg-gradient-to-t from-amber-50 via-amber-50/20 to-transparent" 
              : "bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"
          } transition-opacity duration-300`}></div>

          {isExpired && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full py-1.5 sm:py-2 px-3 sm:px-4 z-30 shadow-lg animate-pulse">
              EXPIRED
            </div>
          )}
        </div>

        <CardContent
          className={`p-4 sm:p-6 -mt-1 ${
            property.isGoldCard
              ? "bg-gradient-to-b from-amber-50 to-yellow-50/70 backdrop-blur-sm"
              : "bg-gradient-to-b from-gray-900 to-gray-950"
          }`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${property.isGoldCard ? 'text-amber-900' : 'text-white'} line-clamp-2 mb-2 sm:mb-3 group-hover:text-opacity-80 transition-colors duration-300`}>
            {property.title}
          </h3>

          <div className="mb-3 sm:mb-4">
            <div className={`text-xl sm:text-2xl font-bold ${property.isGoldCard ? 'text-amber-700 drop-shadow-sm' : 'text-teal-400'} transition-colors duration-300`}>
              {formatPrice(property.price)}
              {property.category === "for-rent" && (
                <span className={`text-sm ${property.isGoldCard ? 'text-amber-600' : 'text-gray-300'} font-medium`}>/{property.rentalPeriod}</span>
              )}
            </div>
          </div>

          <div className={`flex items-center text-sm ${property.isGoldCard ? 'text-gray-600' : 'text-gray-300'} mb-3 sm:mb-4`}>
            <MapPin className={`h-4 w-4 mr-2 flex-shrink-0 ${property.isGoldCard ? 'text-amber-600' : 'text-teal-400'}`} />
            <span className="font-medium truncate">
              {property.address?.street}, {property.address?.city}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Bed className={`h-4 w-4 ${property.isGoldCard ? 'text-amber-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${property.isGoldCard ? 'text-gray-700' : 'text-gray-300'}`}>
                  {property.bedrooms || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className={`h-4 w-4 ${property.isGoldCard ? 'text-amber-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${property.isGoldCard ? 'text-gray-700' : 'text-gray-300'}`}>
                  {property.bathrooms || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Square className={`h-4 w-4 ${property.isGoldCard ? 'text-amber-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${property.isGoldCard ? 'text-gray-700' : 'text-gray-300'}`}>
                  {property.size} m²
                </span>
              </div>
            </div>
            {property.isPremium && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full py-1 px-2 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Premium
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default PropertyCard;