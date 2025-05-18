import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2, Home, Building2, Briefcase, Map } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  count: number;
  icon: React.ReactNode;
}

// Default categories if API fails or during development
const defaultCategories: Category[] = [
  {
    id: "for-sale",
    title: "Properties For Sale",
    description: "Find your dream property to own in Mauritius",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0,
    icon: <Home className="w-6 h-6" />
  },
  {
    id: "for-rent",
    title: "Properties For Rent",
    description: "Discover rental properties across the island",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0,
    icon: <Building2 className="w-6 h-6" />
  },
  {
    id: "offices",
    title: "Office Spaces",
    description: "Professional spaces for your business needs",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0,
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: "land",
    title: "Land For Sale",
    description: "Build your future on prime Mauritius land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0,
    icon: <Map className="w-6 h-6" />
  }
];

const PropertyCategories = () => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        setLoading(true);
        
        // Create promises for all category count fetches
        const countPromises = defaultCategories.map(async (category) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/properties/category/${category.id}`);
            
            if (!response.ok) {
              return { ...category };
            }
            
            const data = await response.json();
            return {
              ...category,
              count: data.count || 0
            };
          } catch (error) {
            // If individual category fetch fails, return category with default count
            return { ...category };
          }
        });
        
        // Wait for all promises to resolve
        const updatedCategories = await Promise.all(countPromises);
        setCategories(updatedCategories);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch category counts');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property categories. Showing default categories instead.",
        });
        // Keep using default categories if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyCounts();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-400 opacity-20"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">Loading property categories...</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">Browse By Category</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6 rounded-full"></div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explore our extensive portfolio of properties across various categories to find what you're looking for
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <Link key={category.id} to={`/properties/${category.id}`} className="group">
            <Card className="overflow-hidden rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                <img 
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-semibold rounded-full py-1.5 px-3 z-20 flex items-center space-x-1">
                  <span>{category.count}</span>
                  <span className="text-xs">Listings</span>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors duration-300">{category.title}</h3>
                  <p className="text-gray-200 text-sm opacity-85">{category.description}</p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3">
                    {category.icon}
                  </div>
                  <span className="font-medium text-gray-800">View Properties</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PropertyCategories;