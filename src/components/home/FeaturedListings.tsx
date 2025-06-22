import { useState, useEffect } from "react";
import PropertyCard from "../PropertyCard";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FeaturedListings = ({ currency = "MUR" }) => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

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
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(featuredProperties.length - 1, prev + 1));
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
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              className="h-10 w-10 rounded-full border border-blue-200 hover:border-blue-400 hover:bg-blue-50"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={20} className="text-blue-600" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-10 rounded-full border border-blue-200 hover:border-blue-400 hover:bg-blue-50"
              onClick={handleNext}
              disabled={currentIndex === featuredProperties.length - 1}
            >
              <ChevronRight size={20} className="text-blue-600" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties
              .slice(currentIndex, currentIndex + 3)
              .map((property) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <PropertyCard 
                    property={property} 
                    currency={currency}
                    variant="featured"
                  />
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;