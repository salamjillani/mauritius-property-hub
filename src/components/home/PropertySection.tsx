import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tilt } from "@/components/ui/tilt";
import { Spotlight } from "@/components/ui/spotlight";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import PropertyCard from "../PropertyCard";

interface PropertySectionProps {
  category: "for-sale" | "for-rent" | "land";
  title: string;
  description: string;
  currency: "USD" | "EUR" | "MUR";
}

interface PropertyImage {
  url?: string;
  isMain?: boolean;
}

interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  address?: {
    city?: string;
    country?: string;
  };
  images?: PropertyImage[];
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  type?: string;
  category?: string;
  isGoldCard?: boolean;
}

const PropertySection: React.FC<PropertySectionProps> = ({ category, title, description, currency }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/properties/category/${category}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${category} properties`);
        }
        
        const data = await response.json();
        
        // Sort properties with gold card properties first
        const sortedData = [...(data.data || [])].sort((a, b) => 
          (b.isGoldCard ? 1 : 0) - (a.isGoldCard ? 1 : 0)
        );
        setProperties(sortedData);
      } catch (err: any) {
        setError(err.message || `Failed to load ${category} properties`);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load ${category} properties. Please try again later.`,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [category, toast]);

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

  const getImageUrl = (property: Property) => {
    if (property.images && property.images.length > 0 && property.images[0]?.url) {
      const image = property.images[0];
      if (image.url.startsWith('http')) {
        return image.url;
      }
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${image.url}`;
    }
    return "https://images.unsplash.com/photo-1582560475093-ba66accbc095?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
  };

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(properties.length - 8, 0) : prev - 8));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 8 >= properties.length ? 0 : prev + 8));
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <section className="relative py-16 px-4">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-slate-600 font-medium">Loading properties...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16 px-4">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200/50 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced header matching AgentsCarousel style */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
              Premium Properties
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700">
              {title.toUpperCase()}
            </span>
          </h2>
          
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            {description}
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        {/* Navigation section */}
        <div className="relative mb-8">
          {properties.length > 8 && (
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant="outline"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handlePrev}
                aria-label="Previous properties"
              >
                <ChevronLeft size={20} className="text-blue-600" />
              </Button>
              <Button
                variant="outline"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleNext}
                aria-label="Next properties"
              >
                <ChevronRight size={20} className="text-blue-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Properties Grid with responsive design */}
        {properties.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {properties.slice(currentIndex, currentIndex + 8).map((property) => (
              <motion.div
                key={property._id}
                className="min-w-0 flex-shrink-0"
                variants={itemVariants}
              >
                <Tilt
                  rotationFactor={8}
                  isRevese
                  style={{ transformOrigin: 'center center' }}
                  springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                  className="group h-full w-full"
                >
                  <div className="relative h-full">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    
                    <div className="relative transform group-hover:scale-[1.02] transition-transform duration-300">
                      <PropertyCard
                        property={property} 
                        isExpired={false}
                        currency={currency}
                        variant="simple"
                      />
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-6 py-4 bg-slate-50 border border-slate-200/50 rounded-xl shadow-lg">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-slate-500 font-medium">No properties available in this category at the moment.</p>
            </div>
          </div>
        )}

        {/* View More Button */}
        <div className="flex justify-center mt-12">
          <Link to={`/properties/${category}`}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Discover More {title} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Decorative bottom element */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Optional: Page indicator for mobile */}
        {properties.length > 8 && (
          <div className="flex justify-center mt-6 sm:hidden">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(properties.length / 8) }).map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    Math.floor(currentIndex / 8) === i
                      ? "bg-blue-500 w-6"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  onClick={() => setCurrentIndex(i * 8)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertySection;