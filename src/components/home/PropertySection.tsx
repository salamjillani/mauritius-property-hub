import { useState, useEffect, useRef } from "react";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(4);
  const { toast } = useToast();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setCardsPerView(1);
      else if (width < 768) setCardsPerView(2);
      else if (width < 1024) setCardsPerView(3);
      else setCardsPerView(4);
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && properties.length > cardsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, properties.length - cardsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, properties.length, cardsPerView]);

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

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, properties.length - cardsPerView);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
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

  const maxIndex = Math.max(0, properties.length - cardsPerView);

  return (
    <section className="relative py-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced header */}
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

        {/* Carousel Container */}
        {properties.length > 0 ? (
          <div className="relative">
            {/* Navigation Controls */}
            {properties.length > cardsPerView && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10">
                <Button
                  variant="outline"
                  className="h-12 w-12 rounded-full border-2 border-white/80 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl pointer-events-auto -ml-6"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous properties"
                >
                  <ChevronLeft size={24} className="text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-12 rounded-full border-2 border-white/80 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl pointer-events-auto -mr-6"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  aria-label="Next properties"
                >
                  <ChevronRight size={24} className="text-blue-600" />
                </Button>
              </div>
            )}

            {/* Carousel Track */}
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={property._id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / cardsPerView}%` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
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
            </div>

            {/* Dot Indicators */}
            {properties.length > cardsPerView && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      currentIndex === index
                        ? "bg-blue-500 w-8"
                        : "bg-slate-300 hover:bg-slate-400 w-2"
                    )}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Auto-play indicator */}
            {properties.length > cardsPerView && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                    isAutoPlaying
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  {isAutoPlaying ? "Auto-playing" : "Paused"}
                </button>
              </div>
            )}
          </div>
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
      </div>
    </section>
  );
};

export default PropertySection;