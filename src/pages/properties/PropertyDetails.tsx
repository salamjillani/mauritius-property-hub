// pages/properties/PropertyDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Share2, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property");
        const data = await response.json();
        setProperty(data.data);

        const token = localStorage.getItem("token");
        if (token) {
          const favoritesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            setIsFavorite(favoritesData.data.some(fav => fav.property._id === id));
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load property", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id, toast]);

  const handleShare = (method) => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.address?.city}, ${property.address?.country || 'Mauritius'}`,
      url: shareUrl,
    };

    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareUrl)}`, '_blank');
    } else if (method === 'x') {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (method === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + ' ' + shareUrl)}`, '_blank');
    } else if (method === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied", description: "Property URL copied to clipboard" });
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Authentication Required", description: "Please log in to save favorites", variant: "destructive" });
      navigate("/login");
      return;
    }

    try {
      const method = isFavorite ? "DELETE" : "POST";
      const url = isFavorite
        ? `${import.meta.env.VITE_API_URL}/api/favorites/${id}`
        : `${import.meta.env.VITE_API_URL}/api/favorites`;
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: isFavorite ? null : JSON.stringify({ propertyId: id }),
      });

      if (!response.ok) throw new Error("Failed to update favorite");
      setIsFavorite(!isFavorite);
      toast({ title: isFavorite ? "Removed from Favorites" : "Added to Favorites", description: `Property ${isFavorite ? "removed from" : "added to"} your favorites` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update favorite", variant: "destructive" });
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

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Property not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const convertPrice = (price) => {
    if (activeCurrency === "USD") return (price * 0.021).toFixed(2); // Example conversion
    if (activeCurrency === "EUR") return (price * 0.019).toFixed(2);
    return price.toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <BackButton to={`/properties/${property.category}`} label={`Back to ${property.category.replace('-', ' ')}`} className="mb-6" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={selectedImage || property.images?.[0]?.url || "/placeholder.jpg"}
                alt={property.title}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button onClick={handleFavorite} variant={isFavorite ? "default" : "secondary"}>
                  <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
                  {isFavorite ? "Remove Favorite" : "Add to Favorites"}
                </Button>
                <Button onClick={() => handleShare('copy')} variant="secondary">
                  <Share2 size={20} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {property.images?.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{property.title}</h1>
            <p className="text-sm text-slate-500 capitalize mb-4">{property.status}</p>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MapPin size={20} />
              <p>{property.address?.city}, {property.address?.country || "Mauritius"}</p>
            </div>
            <p className="text-slate-600 mb-4">{property.description}</p>
            <p className="text-lg font-bold mb-4">
              {activeCurrency} {convertPrice(property.price)}
              {property.rentalPeriod && ` / ${property.rentalPeriod}`}
            </p>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Details</h3>
              <p>Bedrooms: {property.bedrooms}</p>
              <p>Bathrooms: {property.bathrooms}</p>
              <p>Size: {property.size} m²</p>
            </div>
            {property.amenities?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <img
                        src={`/amenities/${amenity.toLowerCase().replace(/\s/g, "-")}.webp`}
                        alt={amenity}
                        className="w-6 h-6"
                        onError={(e) => (e.target.src = "/amenities/default.webp")}
                      />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-2">Contact Agent</h3>
              {property.agent ? (
                <div className="flex items-center gap-4">
                  <img
                    src={property.agent?.user?.avatarUrl || "/default-avatar.jpg"}
                    alt={`${property.agent?.user?.firstName} ${property.agent?.user?.lastName}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-bold">{property.agent?.user?.firstName} {property.agent?.user?.lastName}</p>
                    <p className="text-sm text-slate-600">{property.agent?.title}</p>
                    {localStorage.getItem("token") ? (
                      <>
                        <p className="text-sm text-slate-600">{property.agent?.user?.contactDetails?.phone}</p>
                        <p className="text-sm text-slate-600">{property.agent?.user?.contactDetails?.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-600">Log in to view contact details</p>
                    )}
                    {property.agency && (
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={property.agency.logoUrl || "/default-agency-logo.png"}
                          alt={property.agency.name}
                          className="h-8 w-auto"
                        />
                        <p className="text-sm text-slate-600">{property.agency.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>No agent assigned</p>
              )}
            </div>
            {!localStorage.getItem("token") && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Send Inquiry</h3>
                <InquiryForm propertyId={id} agentId={property.agent?._id} />
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleShare('whatsapp')} variant="outline">WhatsApp</Button>
              <Button onClick={() => handleShare('x')} variant="outline">X</Button>
              <Button onClick={() => handleShare('email')} variant="outline">Email</Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const InquiryForm = ({ propertyId, agentId }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, propertyId, agentId }),
      });
      if (!response.ok) throw new Error("Failed to submit inquiry");
      toast({ title: "Inquiry Sent", description: "Your inquiry has been sent to the agent" });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send inquiry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Inquiry"}
      </Button>
    </form>
  );
};

export default PropertyDetails;