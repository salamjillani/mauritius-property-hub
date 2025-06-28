import { useState, useEffect, useRef } from "react";
import {  ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import PropertyCard from "../PropertyCard";


// Enhanced FeaturedListings with Carousel
const FeaturedListings = ({ currency = "MUR" }) => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(3);
  const { toast } = useToast();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 768) setCardsPerView(1);
      else if (width < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && featuredProperties.length > cardsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, featuredProperties.length - cardsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, featuredProperties.length, cardsPerView]);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties/featured`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch featured properties");
        }
        
        const data = await response.json();
        setFeaturedProperties(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to load featured properties");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load featured properties. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [toast]);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, featuredProperties.length - cardsPerView);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 rounded-full shadow">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-slate-600 font-medium">Loading featured properties...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredProperties.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, featuredProperties.length - cardsPerView);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
              Premium Selection
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700">
              FEATURED PROPERTIES
            </span>
          </h2>
          
          <p className="text-slate-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium real estate opportunities
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        <div className="relative">
          {/* Navigation Controls */}
          {featuredProperties.length > cardsPerView && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10">
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-2 border-white/80 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl pointer-events-auto -ml-6"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} className="text-blue-600" />
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-2 border-white/80 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl pointer-events-auto -mr-6"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
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
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / cardsPerView}%` }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="group relative">
                    {/* Enhanced glow effect */}
                    <div className="absolute -inset-2 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-all duration-700 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>
                    
                    <div className="relative transform group-hover:scale-[1.03] transition-transform duration-500">
                      <PropertyCard 
                        property={property} 
                        currency={currency}
                        variant="featured"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dot Indicators */}
          {featuredProperties.length > cardsPerView && (
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

          {/* Auto-play control */}
          {featuredProperties.length > cardsPerView && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg",
                  isAutoPlaying
                    ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                )}
              >
                {isAutoPlaying ? "⏸️ Pause Auto-play" : "▶️ Resume Auto-play"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings ;