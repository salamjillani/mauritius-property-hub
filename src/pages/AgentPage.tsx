import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Home,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const AgentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/agents/${id}?approvalStatus=approved`
        );
        if (!response.ok) throw new Error("Failed to fetch agent");
        const data = await response.json();
        setAgent(data.data);

        const propertiesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties?agent=${id}`
        );
        if (!propertiesResponse.ok)
          throw new Error("Failed to fetch properties");
        const propertiesData = await propertiesResponse.json();
        
        // After fetching properties: Sort properties to prioritize gold card items
        const sortedProperties = propertiesData.data.sort((a, b) => 
          (b.isGoldCard ? 1 : 0) - (a.isGoldCard ? 1 : 0)
        );
        setProperties(sortedProperties);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agent data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id, toast]);

  const filteredProperties =
    activeTab === "all"
      ? properties
      : properties.filter((property) => property.category === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
            <div className="absolute top-2 left-2 animate-pulse rounded-full h-12 w-12 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-lg">Agent not found</p>
            <p className="text-slate-400 text-sm mt-2">The agent profile you're looking for doesn't exist</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <BackButton
          to="/agents"
          label="Back to Agents"
          className="mb-8 sm:mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300 hover:gap-3"
        />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-3xl shadow-2xl mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative group"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm">
                  <img
                    src={agent.photoUrl || "/default-avatar.jpg"}
                    alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
              </motion.div>
              
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center lg:text-left flex-1"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  {agent.user?.firstName} {agent.user?.lastName}
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 mb-4 font-medium">{agent.title}</p>
                {agent.agency && (
                  <div
                    className="inline-flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 group"
                    onClick={() => navigate(`/agency/${agent.agency._id}`)}
                  >
                    <img
                      src={agent.agency.logoUrl || "/default-agency-logo.png"}
                      alt={agent.agency.name}
                      className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"
                    />
                    <p className="text-blue-100 font-medium group-hover:text-white transition-colors duration-300">
                      {agent.agency.name}
                    </p>
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6"
              >
                {localStorage.getItem("token") ? (
                  <>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 hover:bg-white/20 transition-all duration-300">
                      <Phone size={20} className="text-blue-200" />
                      <span className="text-sm sm:text-base font-medium">
                        {agent.user?.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3 hover:bg-white/20 transition-all duration-300">
                      <Mail size={20} className="text-blue-200" />
                      <span className="text-sm sm:text-base font-medium">
                        {agent.user?.email || "Not provided"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-center">
                    <p className="text-blue-100 font-medium">Log in to view contact details</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{properties.length}</p>
                <p className="text-slate-600 text-sm">Properties Listed</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">98%</p>
                <p className="text-slate-600 text-sm">Success Rate</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">5+</p>
                <p className="text-slate-600 text-sm">Years Experience</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Properties Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Featured Properties
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover exceptional properties curated by our expert agent
            </p>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-8 flex justify-center flex-wrap gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white rounded-xl px-6 py-2 font-medium transition-all duration-300"
              >
                All Properties
              </TabsTrigger>
              <TabsTrigger 
                value="for-sale"
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white rounded-xl px-6 py-2 font-medium transition-all duration-300"
              >  
                For Sale
              </TabsTrigger>
              <TabsTrigger 
                value="for-rent"
                 className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white rounded-xl px-6 py-2 font-medium transition-all duration-300"
              >
                For Rent
              </TabsTrigger>
              <TabsTrigger 
                value="offices"
                 className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white rounded-xl px-6 py-2 font-medium transition-all duration-300"
              >
                Offices
              </TabsTrigger>
              <TabsTrigger 
                value="land"
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white rounded-xl px-6 py-2 font-medium transition-all duration-300"
              >
                Land
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {filteredProperties.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {filteredProperties.map((property, index) => (
                    <motion.div
                      key={property._id}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${
                        property.isPremium
                          ? "ring-2 ring-amber-400 ring-offset-2"
                          : ""
                      } ${
                        property.isGoldCard
                          ? "ring-2 ring-yellow-500 ring-offset-2"
                          : ""
                      }`}
                      onClick={() => navigate(`/properties/${property._id}`)}
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
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
                                ? "fill-red-500 text-red-500"
                                : "text-slate-600"
                            }
                          />
                        </Button>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <img
                          src={property.images?.[0]?.url || "/placeholder.jpg"}
                          alt={property.title}
                          className={`h-64 sm:h-56 lg:h-64 w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                            property.status !== "active" ? "grayscale" : ""
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          <Button className="w-full bg-white/95 hover:bg-white text-slate-800 backdrop-blur-sm shadow-lg hover:shadow-xl font-medium">
                            <Eye size={16} className="mr-2" />
                            View Details
                          </Button>
                        </div>
                        {property.isPremium && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            Premium
                          </div>
                        )}
                        {property.isGoldCard && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            Gold Card
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 flex-1">
                            {property.title}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${property.price?.toLocaleString()}
                            </div>
                            {property.category === "for-rent" && (
                              <span className="text-sm text-slate-500">
                                /{property.rentalPeriod || "month"}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} className="text-blue-500" />
                          <p className="text-sm font-medium">
                            {property.address?.city},{" "}
                            {property.address?.country || "Mauritius"}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed size={16} className="text-slate-400" />
                              <span className="font-medium">{property.bedrooms} bed</span>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath size={16} className="text-slate-400" />
                              <span className="font-medium">{property.bathrooms} bath</span>
                            </div>
                          )}
                          {property.size && (
                            <div className="flex items-center gap-1">
                              <Square size={16} className="text-slate-400" />
                              <span className="font-medium">{property.size} m²</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {property.description}
                        </p>
                        
                        {property.agency && (
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <img
                              src={
                                property.agency.logoUrl ||
                                "/default-agency-logo.png"
                              }
                              alt={property.agency.name}
                              className="w-8 h-8 rounded-full border border-slate-200"
                            />
                            <p className="text-sm text-slate-600 font-medium">
                              {property.agency.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-white rounded-3xl shadow-lg"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <Home size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">
                    No {activeTab !== "all" ? activeTab : ""} properties found
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {activeTab === "all"
                      ? `${agent.user?.firstName} doesn't have any properties listed yet.`
                      : `${agent.user?.firstName} doesn't have any ${activeTab} properties.`}
                  </p>
                  {activeTab !== "all" && (
                    <Button
                      onClick={() => setActiveTab("all")}
                      className="bg-gradient-to-b from-gray-900 to-gray-950  text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      View All Properties
                    </Button>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* Specializations & Languages */}
        {(agent.specializations?.length > 0 || agent.languages?.length > 0) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Expertise & Languages
              </h3>
              <p className="text-slate-600">Professional qualifications and communication skills</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {agent.specializations?.length > 0 && (
                <motion.div
                  variants={slideInLeft}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Specializations</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {agent.specializations.map((spec, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition-shadow duration-300 border border-amber-200"
                      >
                        {spec}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {agent.languages?.length > 0 && (
                <motion.div
                  variants={slideInRight}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Languages</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {agent.languages.map((lang, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition-shadow duration-300 border border-slate-300"
                      >
                        {lang}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AgentPage;