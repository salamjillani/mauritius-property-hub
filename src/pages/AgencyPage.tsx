// pages/AgencyPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Home, Building2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import PropertyCard from "@/components/PropertyCard";
import { useToast } from "@/hooks/use-toast";

const AgencyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agency, setAgency] = useState(null);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    setIsLoggedIn(!!localStorage.getItem('token'));
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xl font-medium text-gray-600">Loading agency details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Agency Not Found</h2>
            <p className="text-gray-600 mb-6">The agency you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/agencies')} className="bg-blue-600 hover:bg-blue-700">
              Back to Agencies
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <BackButton to="/agencies" label="Back to Agencies" className="mb-8 lg:mb-10" />

        {/* Hero Agency Card */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 lg:mb-16"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Agency Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-3xl p-6 shadow-2xl">
                  <img
                    src={agency.logoUrl || "/default-agency-logo.png"}
                    alt={agency.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Agency Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  {agency.name}
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 mb-6 max-w-2xl">
                  {agency.description}
                </p>
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                  {/* Location - always visible */}
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-blue-100 text-sm">
                        {agency.address?.city}, {agency.address?.country || "Mauritius"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Phone - conditional visibility */}
                  {isLoggedIn ? (
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-blue-100 text-sm">
                          {agency.user?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-center lg:justify-start gap-3 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-colors duration-200"
                      onClick={() => navigate('/login')}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-blue-100 text-sm">
                          Login to view phone
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Email - conditional visibility */}
                  {isLoggedIn ? (
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-blue-100 text-sm">
                          {agency.user?.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-center lg:justify-start gap-3 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-colors duration-200"
                      onClick={() => navigate('/contact')}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-blue-100 text-sm">
                          Send a message
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Our Agents Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 lg:mb-16"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold  bg-gradient-to-b from-gray-900 to-gray-950 bg-clip-text mb-4">
              Our Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our dedicated team of real estate professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {agents.map((agent, index) => (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 ${
                  agent.isPremium ? "ring-4 ring-yellow-400 ring-opacity-50" : ""
                }`}
                onClick={() => navigate(`/agent/${agent._id}`)}
              >
                {/* Premium Badge */}
                {agent.isPremium && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-800 fill-current" />
                    <span className="text-xs font-bold text-yellow-800">Premium</span>
                  </div>
                )}
                
                {/* Agent Photo */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={agent.photoUrl || "/default-avatar.jpg"}
                    alt={`${agent.user.firstName} ${agent.user.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Hover Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="bg-white/90 hover:bg-white text-gray-800 rounded-full px-6 py-2 font-medium backdrop-blur-sm">
                      View Profile
                    </Button>
                  </div>
                </div>
                
                {/* Agent Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    {agent.user.firstName} {agent.user.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-2">{agent.title}</p>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-500">Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Properties Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-b from-gray-900 to-gray-950 bg-clip-text mb-4">
              Our Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our premium collection of properties
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PropertyCard
                  property={property}
                  isExpired={property.isExpired}
                  variant="featured"
                  currency="USD"
                />
              </motion.div>
            ))}
          </div>
          
          {/* No Properties Message */}
          {properties.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                This agency is currently adding new properties to their portfolio. Check back soon for amazing listings!
              </p>
            </div>
          )}
        </motion.section>

      </div>
      <Footer />
    </div>
  );
};

export default AgencyPage;