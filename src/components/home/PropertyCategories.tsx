
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    id: "for-sale",
    title: "Properties For Sale",
    description: "Find your dream property to own in Mauritius",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 245
  },
  {
    id: "for-rent",
    title: "Properties For Rent",
    description: "Discover rental properties across the island",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 189
  },
  {
    id: "offices",
    title: "Office Spaces",
    description: "Professional spaces for your business needs",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 82
  },
  {
    id: "land",
    title: "Land For Sale",
    description: "Build your future on prime Mauritius land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    count: 67
  }
];

const PropertyCategories = () => {
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
