import { useState, useEffect } from "react";
import { Star, MapPin, Phone, Mail, Home, MessageCircle, Bed, Bath, Square } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PropertyStatusBadge from "@/components/PropertyStatusBadge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AgencyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agency, setAgency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/${id}`);
        if (!response.ok) throw new Error("Failed to fetch agency");
        const data = await response.json();
        setAgency(data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load agency", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgency();
  }, [id, toast]);

  const handlePropertyClick = (property) => {
    navigate(`/properties/${property._id}`);
  };

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
          <p className="text-gray-500">Agency not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/agents" label="Back to Agents" className="mb-10" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white p-8 rounded-3xl shadow-lg mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={agency.logoUrl || "/default-agency-logo.png"}
              alt={agency.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{agency.name}</h1>
              <p className="text-white/90 mt-2">{agency.description}</p>
              <div className="flex items-center gap-2 mt-4 text-white/80">
                <MapPin size={18} />
                <span>{agency.address.city}, {agency.address.country}</span>
              </div>
              <div className="flex gap-4 mt-4">
                <a href={`mailto:${agency.contactDetails.email}`} className="text-white hover:text-amber-300">
                  <Mail size={20} />
                </a>
                <a href={`tel:${agency.contactDetails.phone}`} className="text-white hover:text-amber-300">
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agency.agents?.map((agent) => (
              <Card
                key={agent._id}
                className="group rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/agent/${agent._id}`)}
              >
                <div className="relative">
                  <img
                    src={agent.user?.avatarUrl || "/default-avatar.jpg"}
                    alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold">{agent.user?.firstName} {agent.user?.lastName}</h3>
                  <p className="text-sm text-blue-600">{agent.title}</p>
                  <p className="text-sm text-slate-500">{agent.listingsCount || 0} Listings</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agency.properties?.map((property) => (
              <Card
                key={property._id}
                className="rounded-2xl overflow-hidden shadow-xl border-0 hover:scale-105 transition-all duration-300 group cursor-pointer"
                onClick={() => handlePropertyClick(property)}
              >
                <div className="relative">
                  <img
                    src={property.images?.[0]?.url || "/placeholder.jpg"}
                    alt={property.title}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <PropertyStatusBadge status={property.category} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600">{property.title}</h3>
                  <div className="text-amber-600 font-bold">
                    {activeCurrency} {property.price?.toLocaleString()}
                    {property.rentalPeriod && <span className="text-sm text-slate-500">/{property.rentalPeriod}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={16} />
                    <p className="text-sm">{property.address?.city}, {property.address?.country || 'Mauritius'}</p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default AgencyPage;