import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
}

const PropertySection: React.FC<PropertySectionProps> = ({ category, title, description, currency }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
        setProperties(data.data || []);
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
    // Check if property has images array and it contains at least one item
    if (property.images && property.images.length > 0 && property.images[0]?.url) {
      const image = property.images[0];
      // Check if the URL is already absolute
      if (image.url.startsWith('http')) {
        return image.url;
      }
      // Otherwise construct URL from backend
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${image.url}`;
    }
    // Default image if none available
    return "https://images.unsplash.com/photo-1582560475093-ba66accbc095?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <p className="text-gray-600">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 mt-2">
            {description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={scrollLeft}
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 border-gray-300 hover:bg-gray-100 hover:text-blue-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            onClick={scrollRight}
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 border-gray-300 hover:bg-gray-100 hover:text-blue-700"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
       {properties.length > 0 ? (
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 pb-6 hide-scrollbar" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((property) => (
            <div key={property._id} className="min-w-[320px] max-w-[320px]">
              <PropertyCard
                property={property} 
                currency={currency}
                variant="simple"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No properties available in this category at the moment.</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link to={`/properties/${category}`}>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium px-6 py-2 rounded-lg">
            Discover More {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertySection;