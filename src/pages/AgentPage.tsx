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
        setProperties(propertiesData.data);
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Agent not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <BackButton
          to="/agents"
          label="Back to Agents"
          className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-3xl shadow-lg p-8 mb-12 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={agent.photoUrl || "/default-avatar.jpg"}
              alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">
              {agent.user?.firstName} {agent.user?.lastName}
            </h1>
            <p className="text-lg text-blue-100">{agent.title}</p>
            {agent.agency && (
              <div
                className="mt-2 flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(`/agency/${agent.agency._id}`)}
              >
                <img
                  src={agent.agency.logoUrl || "/default-agency-logo.png"}
                  alt={agent.agency.name}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-blue-100 font-medium">{agent.agency.name}</p>
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-center md:justify-end gap-4">
            {localStorage.getItem("token") ? (
              <>
                <div className="flex items-center gap-2 text-blue-100">
                  <Phone size={20} />
                  <span>
                    {agent.user?.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Mail size={20} />
                  <span>
                   {agent.user?.email || "Not provided"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-blue-100">Log in to view contact details</p>
            )}
          </div>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex justify-center flex-wrap gap-2">
              <TabsTrigger value="all">All Properties</TabsTrigger>
              <TabsTrigger value="for-sale">For Sale</TabsTrigger>
              <TabsTrigger value="for-rent">For Rent</TabsTrigger>
              <TabsTrigger value="offices">Offices</TabsTrigger>
              <TabsTrigger value="land">Land</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <motion.div
                      key={property._id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeInUp}
                      className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                        property.isPremium
                          ? "border-2 border-amber-400 animate-pulse"
                          : ""
                      }`}
                      onClick={() => navigate(`/properties/${property._id}`)}
                    >
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
                          className={`h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                            property.status !== "active" ? "grayscale" : ""
                          }`}
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
              ) : (
                <div className="text-center py-16">
                  <Home size={64} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    No {activeTab !== "all" ? activeTab : ""} properties found
                  </h3>
                  <p className="text-slate-500">
                    {activeTab === "all"
                      ? `${agent.user?.firstName} doesn't have any properties listed yet.`
                      : `${agent.user?.firstName} doesn't have any ${activeTab} properties.`}
                  </p>
                  {activeTab !== "all" && (
                    <Button
                      onClick={() => setActiveTab("all")}
                      className="mt-4 bg-amber-500 hover:bg-amber-600"
                    >
                      View All Properties
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.section>

        {(agent.specializations?.length > 0 || agent.languages?.length > 0) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {agent.specializations?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {agent.languages?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MessageCircle size={24} className="text-amber-500" /> Client
            Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="flex gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <blockquote className="italic text-slate-700 text-lg">
                "Working with {agent.user?.firstName} was an absolute pleasure.
                Their expertise and dedication made finding our perfect property
                a seamless experience."
              </blockquote>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                  JD
                </div>
                <div>
                  <p className="font-medium text-slate-800">John Doe</p>
                  <p className="text-sm text-slate-500">
                    Purchased in Grand Baie
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="flex gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <blockquote className="italic text-slate-700 text-lg">
                "Exceptional market knowledge and personalized service.{" "}
                {agent.user?.firstName} understood exactly what we were looking
                for and delivered beyond our expectations."
              </blockquote>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                  SM
                </div>
                <div>
                  <p className="font-medium text-slate-800">Sarah Miller</p>
                  <p className="text-sm text-slate-500">Rented in Port Louis</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default AgentPage;
