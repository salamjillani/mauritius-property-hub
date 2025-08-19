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
      className={`group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg rounded-2xl cursor-pointer relative border border-gray-200 hover:-translate-y-1 ${
        property.isGoldCard
          ? "bg-gradient-to-br from-amber-100 via-yellow-100/95 to-orange-100/80 border-amber-400/70 shadow-lg shadow-amber-200/30"
          : "bg-white"
      } ${isExpired ? "opacity-75 grayscale-[0.3]" : ""}`}
    >
      <Link
        to={`/properties/${property.category || ""}/${property._id}`}
        className="block relative"
      >
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-20">
            {property.isFeatured && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full py-1.5 px-3 shadow-md">
                Featured
              </div>
            )}
            {property.isGoldCard && !property.isFeatured && (
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full py-1.5 px-3 shadow-md">
                PREMIUM
              </div>
            )}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium rounded-full py-1 px-3 shadow-md">
              {property.type || "Property"}
            </div>
          </div>

          {property.agency?.name && property.agency?.logoUrl && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full py-1.5 pl-3 pr-2 shadow-md flex items-center gap-1.5 max-w-[140px] truncate z-20">
              <span className="truncate">{property.agency.name}</span>
              <img
                src={property.agency.logoUrl}
                alt={property.agency.name}
                className="h-4 w-4 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = "/default-agency-logo.png")}
              />
            </div>
          )}

          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={toggleFavorite}
              className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>

          {isExpired && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-full py-1.5 px-3 z-30 shadow-md">
              EXPIRED
            </div>
          )}
        </div>

        {/* Clean separator line */}
        <div className="h-px bg-gray-100"></div>

        <CardContent className={`p-4 ${property.isGoldCard ? "bg-gradient-to-b from-amber-100/90 to-yellow-100/70" : "bg-white"}`}>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
              {property.title}
            </h3>
            <div className="flex justify-end">
              <div className="text-xl font-bold text-blue-600 whitespace-nowrap">
                {formatPrice(property.price)}
                {property.category === "for-rent" && (
                  <span className="text-sm text-gray-500 font-medium">/{property.rentalPeriod}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-orange-500 mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {property.address?.street}, {property.address?.city}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span className="text-sm">
                  {property.bedrooms || "N/A"} beds
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span className="text-sm">
                  {property.bathrooms || "N/A"} baths
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span className="text-sm">
                  {property.size} sq ft
                </span>
              </div>
            </div>
            {property.isPremium && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full py-1 px-2 flex items-center">
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