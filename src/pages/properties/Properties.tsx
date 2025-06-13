import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, Heart, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties`
        );
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        
        // Sort properties: Gold cards first, then by creation date
        const sortedProperties = data.data.sort((a, b) => {
          // Gold cards first
          if (a.isGoldCard && !b.isGoldCard) return -1;
          if (!a.isGoldCard && b.isGoldCard) return 1;
          
          // Then by creation date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setProperties(sortedProperties);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast]);

  const filteredProperties =
    activeTab === "all"
      ? properties
      : properties.filter((property) => property.category === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Properties</h1>
          <p className="text-gray-600">Explore our wide range of properties.</p>
        </motion.div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex justify-center">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="for-sale">For Sale</TabsTrigger>
            <TabsTrigger value="for-rent">For Rent</TabsTrigger>
            <TabsTrigger value="offices">Offices</TabsTrigger>
            <TabsTrigger value="land">Land</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-500 cursor-pointer ${
                    property.isGoldCard
                      ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-4 border-amber-400 shadow-2xl transform hover:scale-[1.02] ring-4 ring-amber-200 ring-opacity-50 z-10"
                      : "bg-white shadow-sm hover:shadow-lg"
                  }`}
                  onClick={() =>
                    navigate(`/properties/${property.category}/${property._id}`)
                  }
                >
                  {property.isGoldCard && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl transform rotate-12 animate-bounce">
                          <div className="text-center">
                            <div className="text-2xl">👑</div>
                            <div className="text-xs font-bold text-amber-900 -mt-1">
                              GOLD
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const favorites = JSON.parse(
                          localStorage.getItem("favorites") || "[]"
                        );
                        if (favorites.includes(property._id)) {
                          localStorage.setItem(
                            "favorites",
                            JSON.stringify(
                              favorites.filter((id) => id !== property._id)
                            )
                          );
                          toast({
                            title: "Removed from Favorites",
                            description: `${property.title} removed`,
                          });
                        } else {
                          favorites.push(property._id);
                          localStorage.setItem(
                            "favorites",
                            JSON.stringify(favorites)
                          );
                          toast({
                            title: "Added to Favorites",
                            description: `${property.title} added`,
                          });
                        }
                      }}
                    >
                      <Heart
                        size={16}
                        className={
                          JSON.parse(
                            localStorage.getItem("favorites") || "[]"
                          ).includes(property._id)
                            ? "fill-red-500"
                            : "text-slate-600"
                        }
                      />
                    </Button>
                  </div>
                  <div className="relative">
                    <img
                      src={property.images?.[0]?.url || "/placeholder.jpg"}
                      alt={property.title}
                      className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button className="w-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-sm">
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 space-y-3 bg-white">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-amber-600 font-bold">
                          ${property.price?.toLocaleString()}
                          {property.category === "for-rent" && (
                            <span className="text-sm text-slate-500">
                              /{property.rentalPeriod || "month"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={16} />
                      <p className="text-sm">
                        {property.address?.city},{" "}
                        {property.address?.country || "Mauritius"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed size={16} />
                          <span>{property.bedrooms} bed</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath size={16} />
                          <span>{property.bathrooms} bath</span>
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center gap-1">
                          <Square size={16} />
                          <span>{property.size} m²</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {property.description}
                    </p>
                    {property.agency && (
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            property.agency.logoUrl ||
                            "/default-agency-logo.png"
                          }
                          alt={property.agency.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <p className="text-sm text-slate-600">
                          {property.agency.name}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;