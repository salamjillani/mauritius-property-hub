import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Phone, Mail, Home, Bed, Bath, Square, Eye} from "lucide-react";
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/${id}`);
        if (!response.ok) throw new Error("Failed to fetch agency");
        const data = await response.json();
        setAgency(data.data);

        const agentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/agents?agency=${id}`);
        if (!agentsResponse.ok) throw new Error("Failed to fetch agents");
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.data);

        const propertiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agency=${id}`);
        if (!propertiesResponse.ok) throw new Error("Failed to fetch properties");
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.data);
      } catch (error) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Agency not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <BackButton to="/agents" label="Back to Agents" className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-3xl shadow-lg p-8 mb-12 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={agency.logoUrl || "/default-agency-logo.png"}
              alt={agency.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{agency.name}</h1>
            <p className="text-lg text-blue-100">{agency.description}</p>
          </div>
          <div className="flex-1 flex justify-center md:justify-end gap-4">
            <div className="flex items-center gap-2 text-blue-100">
              <Phone size={20} />
              <span>{agency.contactDetails?.phone || "(555) 123-4567"}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Mail size={20} />
              <span>{agency.contactDetails?.email || "agency@example.com"}</span>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/agent/${agent._id}`)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={agent.user?.avatarUrl || "/default-avatar.jpg"}
                    alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-bold">{agent.user?.firstName} {agent.user?.lastName}</p>
                    <p className="text-sm text-slate-600">{agent.title}</p>
                    <p className="text-sm text-slate-600">{agent.listingsCount || 0} Properties</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                  property.isPremium ? "border-2 border-amber-400 animate-pulse" : ""
                }`}
                onClick={() => navigate(`/properties/${property._id}`)}
              >
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
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default AgencyPage;