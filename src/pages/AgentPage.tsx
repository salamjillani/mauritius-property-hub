import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Home, Check, MapPin, MessageCircle, Phone, Mail, Share2, Bookmark, Calendar, Award } from "lucide-react";
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
  const { toast } = useToast();
  const [agent, setAgent] = useState<any>(null);
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const agentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${id}`);
        if (!agentResponse.ok) {
          throw new Error("Failed to fetch agent data");
        }
        const agentData = await agentResponse.json();
        setAgent(agentData.data);

        const propertiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${id}`);
        if (!propertiesResponse.ok) {
          throw new Error("Failed to fetch properties");
        }
        const propertiesData = await propertiesResponse.json();
        setAgentProperties(propertiesData.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agent or properties",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [id, toast]);

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
          <p className="text-gray-500 font-medium">Agent not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />

      <div className="container mx-auto py-16 px-4">
        <BackButton to="/agents" label="Back to Agents" className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" />

        <div className="space-y-12">
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
                  src={agent.user?.avatarUrl || "default-avatar.jpg"}
                  alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-2">
                  <Award size={24} />
                </div>
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
                <p className="text-slate-300 max-w-xl italic">{agent.biography}</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl shadow-lg p-8 flex flex-col sm:flex-row justify-between items-center gap-10"
          >
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex gap-2 px-6 py-6 transition-all duration-200 hover:shadow-lg">
                <Phone size={18} /> Call Now
              </Button>
              <Button className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 flex gap-2 px-6 py-6 transition-all duration-200">
                <Mail size={18} /> Email
              </Button>
              <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 flex gap-2 px-6 py-6 transition-all duration-200">
                <Share2 size={18} /> Share Profile
              </Button>
            </div>
            <div className="flex gap-10 text-center">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{agent.experience || 15}+</p>
                <p className="text-slate-600">Years Experience</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">$2.5M</p>
                <p className="text-slate-600">Avg. Listing</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{agent.listingsCount || 0}</p>
                <p className="text-slate-600">Properties</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Home size={24} className="text-amber-500" /> Available Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties
                .filter((prop) => prop.status === "active")
                .map((property) => (
                  <Card
                    key={property._id}
                    className="rounded-2xl overflow-hidden shadow-xl border-0 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <PropertyStatusBadge status={property.category} />
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                      >
                        <Bookmark size={16} className="text-slate-600" />
                      </Button>
                    </div>
                    <div className="relative">
                      <img
                        src={property.images[0]?.url || "/placeholder.jpg"}
                        alt={property.title}
                        className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-6 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300">
                          {property.title}
                        </h3>
                        <span className="text-amber-600 font-bold">
                          {property.category === "for-rent"
                            ? `$${property.price}/month`
                            : `$${property.price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={16} />
                        <p className="text-sm">{property.address.city}, Mauritius</p>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{property.description}</p>
                      <Button className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Check size={24} className="text-green-500" /> Recently Sold Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties
                .filter((prop) => prop.status === "sold" || prop.status === "rented")
                .map((property) => (
                  <Card
                    key={property._id}
                    className="rounded-2xl overflow-hidden shadow-md border-0 relative group"
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <PropertyStatusBadge status={property.status} />
                    </div>
                    <div className="relative">
                      <img
                        src={property.images[0]?.url || "/placeholder.jpg"}
                        alt={property.title}
                        className="h-64 w-full object-cover grayscale group-hover:grayscale-[70%] transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/60 backdrop-blur-sm px-6 py-2 rounded-full">
                          <p className="text-white font-bold uppercase tracking-wide">
                            {property.status === "sold" ? "Sold" : "Rented"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-3 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-slate-700">{property.title}</h3>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs">
                            {new Date(property.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={16} />
                        <p className="text-sm">{property.address.city}, Mauritius</p>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {property.status === "rented"
                          ? `Rented: $${property.price}/month`
                          : `Sold: $${property.price.toLocaleString()}`}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2">{property.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-amber-500" /> Property Locations
            </h2>
            <div className="h-[500px] bg-slate-100 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <MapPin size={48} className="text-slate-300 mb-4" />
                <p className="text-lg font-medium">Interactive Map Coming Soon</p>
                <p className="text-sm text-slate-400">Explore all properties in their exact locations</p>
              </div>
            </div>
          </motion.section>

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