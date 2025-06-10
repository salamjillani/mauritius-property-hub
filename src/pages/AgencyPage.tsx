// pages/AgencyPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Home, Bed, Bath, Square, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const AgencyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agency, setAgency] = useState(null);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const agencyResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/agencies/${id}?approvalStatus=approved`
        );
        if (!agencyResponse.ok) throw new Error("Failed to fetch agency");
        const agencyData = await agencyResponse.json();
        setAgency(agencyData.data);

        const agentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/agents?agency=${id}`
        );
        if (!agentsResponse.ok) throw new Error("Failed to fetch agents");
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.data);

        const propertiesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties?agency=${id}`
        );
        
        if (!propertiesResponse.ok) {
          console.error("Properties fetch failed:", propertiesResponse.status);
          throw new Error("Failed to fetch properties");
        }
      
        const propertiesData = await propertiesResponse.json();
        console.log("Fetched properties:", propertiesData); // Log for debugging
        // Sort properties to show Gold Card listings first
        setProperties(
          propertiesData.data.sort((a, b) => (b.isGoldCard ? 1 : 0) - (a.isGoldCard ? 1 : 0))
        );
      } catch (error) {
        console.error("Agency fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load agency data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgency();
  }, [id, toast]);

  const handleFavoriteToggle = (e, property) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (favorites.includes(property._id)) {
      localStorage.setItem(
        "favorites",
        JSON.stringify(favorites.filter((id) => id !== property._id))
      );
      toast({ 
        title: "Removed from Favorites", 
        description: `${property.title} removed` 
      });
    } else {
      favorites.push(property._id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      toast({ 
        title: "Added to Favorites", 
        description: `${property.title} added` 
      });
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

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Agency not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <BackButton to="/agencies" label="Back to Agencies" className="mb-10" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-3xl shadow-lg p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={agency.logoUrl || "/default-agency-logo.png"}
              alt={agency.name}
              className="h-32 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold">{agency.name}</h1>
              <p className="text-blue-100">{agency.description}</p>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <p>
                  {agency.address?.city},{" "}
                  {agency.address?.country || "Mauritius"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={20} />
                <p>
                  {agency.user?.phone || "Not provided"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={20} />
                <p>
                 {agency.user?.email || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Our Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  agent.isPremium ? "border-2 border-amber-400" : ""
                }`}
                onClick={() => navigate(`/agent/${agent._id}`)}
              >
                <img
                  src={agent.photoUrl || "/default-avatar.jpg"}
                  alt={`${agent.user.firstName} ${agent.user.lastName}`}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold">
                    {agent.user.firstName} {agent.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{agent.title}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Our Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  property.isGoldCard ? "border-4 border-yellow-400 scale-105" : ""
                }`}
                onClick={() => navigate(`/properties/${property.category}/${property._id}`)}
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={(e) => handleFavoriteToggle(e, property)}
                  >
                    <Heart
                      size={16}
                      className={JSON.parse(localStorage.getItem("favorites") || "[]").includes(property._id) ? "fill-red-500 text-red-500" : "text-slate-600"}
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
                    <p className="text-sm">{property.address?.city}, {property.address?.country || "Mauritius"}</p>
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
                  
                  <p className="text-sm text-slate-600 line-clamp-2">{property.description}</p>
                  
                  {property.agency && (
                    <div className="flex items-center gap-2">
                      <img
                        src={property.agency.logoUrl || "/default-agency-logo.png"}
                        alt={property.agency.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="text-sm text-slate-600">{property.agency.name}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default AgencyPage;