// pages/Favorites.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const data = await response.json();
        setFavorites(data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load favorites", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate, toast]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
      setFavorites(favorites.filter((fav) => fav.property._id !== propertyId));
      toast({ title: "Removed", description: "Property removed from favorites" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove favorite", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Your Favorite Properties</h1>
          {favorites.length === 0 ? (
            <p className="text-gray-600">You haven't saved any properties yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div
                  key={fav._id}
                  className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${fav.property.isPremium ? 'border-2 border-amber-400' : ''}`}
                >
                  <img
                    src={fav.property.images?.[0]?.url || "/placeholder.jpg"}
                    alt={fav.property.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{fav.property.title}</h3>
                    <p className="text-sm text-gray-600">{fav.property.address.city}, {fav.property.address.country}</p>
                    <p className="text-sm text-gray-600">MUR {fav.property.price.toLocaleString()}</p>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      onClick={() => navigate(`/properties/${fav.property._id}`)}
                      variant="secondary"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => handleRemoveFavorite(fav.property._id)}
                      variant="destructive"
                    >
                      <Heart size={20} className="fill-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;