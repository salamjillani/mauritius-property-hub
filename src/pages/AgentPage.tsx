import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Home, Check, MapPin, MessageCircle, Phone, Mail, Share2, Bookmark, Calendar, Award, Bath, Bed, Square, Eye } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import PropertyStatusBadge from "@/components/common/PropertyStatusBadge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AgentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState(null);
  const [agentProperties, setAgentProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

 useEffect(() => {
  const fetchAgentData = async () => {
    try {
      const agentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${id}`);
      if (!agentResponse.ok) {
        throw new Error("Failed to fetch agent data");
      }
      const agentData = await agentResponse.json();
      setAgent(agentData.data);

      const propertiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${id}&limit=100`);
      if (!propertiesResponse.ok) {
        throw new Error("Failed to fetch properties");
      }
      const propertiesData = await propertiesResponse.json();
      console.log('Properties fetched:', propertiesData); // Debug log
      setAgentProperties(propertiesData.data);
    } catch (error) {
      console.error('Error fetching agent data:', error);
      toast({
        title: "Error",
        description: "Failed to load agent or properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (id) {
    fetchAgentData();
  }
}, [id, toast]);

  const handlePropertyClick = (property) => {
    navigate(`/properties/${property.category}/${property._id}`);
  };

  const handleContactAgent = () => {
    if (agent?.user?.email) {
      window.location.href = `mailto:${agent.user.email}`;
    }
  };

  const handleCallAgent = () => {
    if (agent?.contactDetails?.phone) {
      window.location.href = `tel:${agent.contactDetails.phone}`;
    }
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${agent?.user?.firstName} ${agent?.user?.lastName} - Real Estate Agent`,
        text: `Check out ${agent?.user?.firstName}'s profile on our platform`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Profile link has been copied to clipboard",
      });
    }
  };

  // Filter properties based on active tab
  const getFilteredProperties = () => {
    switch (activeTab) {
      case 'active':
        return agentProperties.filter(prop => prop.status === 'active');
      case 'sold':
        return agentProperties.filter(prop => prop.status === 'sold');
      case 'rented':
        return agentProperties.filter(prop => prop.status === 'rented');
      case 'pending':
        return agentProperties.filter(prop => prop.status === 'pending');
      default:
        return agentProperties;
    }
  };

  const filteredProperties = getFilteredProperties();

  // Get property counts for each status
  const propertyStats = {
    all: agentProperties.length,
    active: agentProperties.filter(prop => prop.status === 'active').length,
    sold: agentProperties.filter(prop => prop.status === 'sold').length,
    rented: agentProperties.filter(prop => prop.status === 'rented').length,
    pending: agentProperties.filter(prop => prop.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-500 font-medium">Loading agent profile...</p>
          </div>
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
          <div className="text-center">
            <p className="text-gray-500 font-medium text-xl mb-4">Agent not found</p>
            <Button onClick={() => navigate('/agents')} className="bg-amber-500 hover:bg-amber-600">
              Browse All Agents
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      <div className="container mx-auto py-16 px-4">
        <BackButton 
          to="/agents" 
          label="Back to Agents" 
          className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" 
        />

        <div className="space-y-12">
          {/* Agent Profile Header */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70 z-10"></div>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url('/lovable-uploads/42669f7c-63eb-4b15-b527-72200b40cd5c.png')` }}
            ></div>
            <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <img
                  src={agent.user?.avatarUrl || "/default-avatar.jpg"}
                  alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 shadow-lg object-cover"
                />
                {agent.isPremium && (
                  <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-2">
                    <Award size={24} />
                  </div>
                )}
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 px-4 py-1 rounded-full text-amber-400 text-sm mb-2">
                  <Check size={16} className="text-amber-400" /> Verified Agent
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {agent.user?.firstName} {agent.user?.lastName}
                </h1>
                <p className="text-xl text-amber-300 font-light">{agent.title}</p>
                <div className="flex items-center gap-1 justify-center md:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < (agent.rating || 4) ? "text-amber-400 fill-amber-400" : "text-slate-500"}
                    />
                  ))}
                  <span className="text-slate-300 ml-2">{agent.rating || 4}/5</span>
                </div>
                {agent.biography && (
                  <p className="text-slate-300 max-w-xl italic">{agent.biography}</p>
                )}
                {agent.location && (
                  <div className="flex items-center gap-2 justify-center md:justify-start text-slate-300">
                    <MapPin size={16} />
                    <span>{agent.location}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Contact and Stats Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl shadow-lg p-8 flex flex-col lg:flex-row justify-between items-center gap-10"
          >
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleCallAgent}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex gap-2 px-6 py-6 transition-all duration-200 hover:shadow-lg"
              >
                <Phone size={18} /> Call Now
              </Button>
              <Button 
                onClick={handleContactAgent}
                className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 flex gap-2 px-6 py-6 transition-all duration-200"
              >
                <Mail size={18} /> Email
              </Button>
              <Button 
                onClick={handleShareProfile}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 flex gap-2 px-6 py-6 transition-all duration-200"
              >
                <Share2 size={18} /> Share Profile
              </Button>
            </div>
            <div className="flex gap-10 text-center">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{agent.experience || 15}+</p>
                <p className="text-slate-600">Years Experience</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{propertyStats.all}</p>
                <p className="text-slate-600">Total Listings</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{propertyStats.active}</p>
                <p className="text-slate-600">Active Listings</p>
              </div>
            </div>
          </motion.section>

          {/* Properties Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Home size={28} className="text-amber-500" /> 
                {agent.user?.firstName}'s Properties
              </h2>
              <div className="text-slate-600">
                Showing {filteredProperties.length} of {propertyStats.all} properties
              </div>
            </div>

            {/* Property Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-md">
              {[
                { key: 'all', label: 'All Properties', count: propertyStats.all },
                { key: 'active', label: 'Active', count: propertyStats.active },
                { key: 'sold', label: 'Sold', count: propertyStats.sold },
                { key: 'rented', label: 'Rented', count: propertyStats.rented },
                { key: 'pending', label: 'Pending', count: propertyStats.pending },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <Card
                    key={property._id}
                    className="rounded-2xl overflow-hidden shadow-xl border-0 hover:scale-105 transition-all duration-300 group cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <PropertyStatusBadge status={property.category} />
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add bookmark functionality
                          }}
                        >
                          <Bookmark size={16} className="text-slate-600" />
                        </Button>
                        {property.status !== 'active' && (
                          <div className="bg-slate-900/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={property.images?.[0]?.url || "/placeholder.jpg"}
                        alt={property.title}
                        className={`h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          property.status !== 'active' ? 'grayscale' : ''
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
                    <CardContent className="p-6 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300 line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="text-right">
                          <div className="text-amber-600 font-bold">
                            ${property.price?.toLocaleString()}
                            {property.category === "for-rent" && <span className="text-sm text-slate-500">/month</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={16} />
                        <p className="text-sm">{property.address?.city}, {property.address?.country || 'Mauritius'}</p>
                      </div>

                      {/* Property Details */}
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
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-xs text-slate-500">
                          Listed {new Date(property.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {property.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Home size={64} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} properties found
                </h3>
                <p className="text-slate-500">
                  {activeTab === 'all' 
                    ? `${agent.user?.firstName} doesn't have any properties listed yet.`
                    : `${agent.user?.firstName} doesn't have any ${activeTab} properties.`
                  }
                </p>
                {activeTab !== 'all' && (
                  <Button 
                    onClick={() => setActiveTab('all')} 
                    className="mt-4 bg-amber-500 hover:bg-amber-600"
                  >
                    View All Properties
                  </Button>
                )}
              </div>
            )}
          </motion.section>

          {/* Agent Specializations & Languages */}
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
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Specializations</h3>
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
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Languages</h3>
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

          {/* Client Testimonials */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-amber-500" /> Client Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="italic text-slate-700 text-lg">
                  "Working with {agent.user?.firstName} was an absolute pleasure. Their expertise and dedication made finding our perfect property a seamless experience."
                </blockquote>
                <div className="flex items-center gap-4 mt-6">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                    JD
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">John Doe</p>
                    <p className="text-sm text-slate-500">Purchased in Grand Baie</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="italic text-slate-700 text-lg">
                  "Exceptional market knowledge and personalized service. {agent.user?.firstName} understood exactly what we were looking for and delivered beyond our expectations."
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
      </div>
      <Footer />
    </div>
  );
};

export default AgentPage;