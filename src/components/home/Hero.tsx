
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative bg-blue-900 h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Dream Property in Mauritius
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover the perfect property for you, from luxurious beachfront villas to modern city apartments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/properties/for-sale">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-medium">
                Browse Properties For Sale
              </Button>
            </Link>
            <Link to="/properties/for-rent">
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                Explore Rental Options
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
