import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Heart, MessageCircle, Bed, Bath, Square, MapPin, Phone, Mail } from "lucide-react";
import PropertyStatusBadge from "@/components/PropertyStatusBadge";
import ContactForm from "@/components/ContactForm";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property");
        const data = await response.json();
        setProperty(data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load property", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (property?.images?.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [property]);

  const handleShare = async (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this property: ${property.title}`;
    try {
      if (platform === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
      } else if (platform === "x") {
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
      } else if (platform === "email") {
        window.open(`mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
      } else if (platform === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied", description: "Property link copied to clipboard" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to share property", variant: "destructive" });
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorited) {
      localStorage.setItem("favorites", JSON.stringify(favorites.filter((fav) => fav !== id)));
      setIsFavorited(false);
      toast({ title: "Removed from Favorites", description: "Property removed from your favorites" });
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favorites, id]));
      setIsFavorited(true);
      toast({ title: "Added to Favorites", description: "Property added to your favorites" });
    }
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorited(favorites.includes(id));
  }, [id]);

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

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Property not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <BackButton to={`/properties/${property.category}`} label="Back to Listings" className="mb-10" />
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative rounded-3xl overflow-hidden shadow-lg mb-8">
                <img
                  src={property.images?.[currentImageIndex]?.url || "/placeholder.jpg"}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4 z-10">
                  <PropertyStatusBadge status={property.category} />
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                    <Heart size={20} className={isFavorited ? "text-red-500 fill-red-500" : "text-white"} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(true)}>
                    <Share2 size={20} className="text-white" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {property.images?.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.caption}
                    className="h-24 w-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <MapPin size={18} />
                    <span>{property.address.city}, {property.address.country}</span>
                  </div>
                  <div className="text-amber-600 font-bold text-2xl mb-4">
                    {property.price.toLocaleString()} {property.rentalPeriod && `/ ${property.rentalPeriod}`}
                  </div>
                  <p className="text-slate-600 mb-6">{property.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-2">
                        <Bed size={18} />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-2">
                        <Bath size={18} />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                    {property.size && (
                      <div className="flex items-center gap-2">
                        <Square size={18} />
                        <span>{property.size} m²</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {property.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img src={`/amenities/${amenity.toLowerCase().replace(/\s/g, '-')}.webp`} alt={amenity} className="w-6 h-6" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Agent Contact</h3>
                  {property.agent ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={property.agent.user?.avatarUrl || "/default-avatar.jpg"}
                          alt={`${property.agent.user?.firstName} ${property.agent.user?.lastName}`}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <p className="font-bold">{property.agent.user?.firstName} {property.agent.user?.lastName}</p>
                          <p className="text-sm text-slate-500">{property.agent.title}</p>
                        </div>
                      </div>
                      {localStorage.getItem("token") ? (
                        <>
                          <p className="flex items-center gap-2"><Phone size={16} /> {property.agent.user?.contactDetails?.phone}</p>
                          <p className="flex items-center gap-2"><Mail size={16} /> {property.agent.user?.contactDetails?.email}</p>
                        </>
                      ) : (
                        <ContactForm propertyId={property._id} agentId={property.agent._id} />
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">No agent assigned</p>
                  )}
                  {property.agency && (
                    <div className="mt-4">
                      <p className="font-bold">Agency: {property.agency.name}</p>
                      <img src={property.agency.logoUrl} alt={property.agency.name} className="h-12 mt-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 rounded-lg">
            <CardContent>
              <h3 className="text-lg font-bold mb-4">Share Property</h3>
              <div className="flex gap-4">
                <Button onClick={() => handleShare("whatsapp")}>WhatsApp</Button>
                <Button onClick={() => handleShare("x")}>X</Button>
                <Button onClick={() => handleShare("email")}>Email</Button>
                <Button onClick={() => handleShare("copy")}>Copy Link</Button>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setShowModal(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PropertyDetails;