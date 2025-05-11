import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  count: number;
}

// Default categories if API fails or during development
const defaultCategories: Category[] = [
  {
    id: "for-sale",
    title: "Properties For Sale",
    description: "Find your dream property to own in Mauritius",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0
  },
  {
    id: "for-rent",
    title: "Properties For Rent",
    description: "Discover rental properties across the island",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0
  },
  {
    id: "offices",
    title: "Office Spaces",
    description: "Professional spaces for your business needs",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0
  },
  {
    id: "land",
    title: "Land For Sale",
    description: "Build your future on prime Mauritius land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 0
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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading property categories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse By Category</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our extensive portfolio of properties across various categories to find what you're looking for
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} to={`/properties/${category.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-blue-800 text-white text-sm font-medium rounded-full py-1 px-2">
                  {category.count} Listings
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PropertyCategories;
