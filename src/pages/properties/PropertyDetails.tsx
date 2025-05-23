import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { Share2, Heart, MapPin, Bed, Bath, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property");
        const data = await response.json();
        setProperty(data.data);
        // Check if property is in favorites (assuming a localStorage-based favorites system)
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(favorites.includes(id));
      } catch (error) {
        toast({ title: "Error", description: "Failed to load property", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id, toast]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.address?.city}, ${property.address?.country || 'Mauritius'}`,
      url: shareUrl,
    };

    // Share via Web Share API if available
    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error("Share failed:", err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied", description: "Property URL copied to clipboard" });
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const updatedFavorites = favorites.filter((favId) => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast({ title: "Removed from Favorites", description: `${property.title} removed from your favorites` });
    } else {
      favorites.push(id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast({ title: "Added to Favorites", description: `${property.title} added to your favorites` });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <BackButton to="/properties" label="Back to Properties" className="mb-6" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Image Grid */}
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={selectedImage || property.images?.[0]?.url || "/placeholder.jpg"}
                alt={property.title}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button onClick={handleShare} variant="secondary">
                  <Share2 size={20} className="mr-2" />
                  Share
                </Button>
                <Button onClick={toggleFavorite} variant={isFavorite ? "default" : "outline"}>
                  <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
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

          {/* Property Details */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{property.title}</h1>
            <Badge variant={property.status === "active" ? "default" : "secondary"} className="mb-4">
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
            <p className="text-2xl font-bold text-amber-600 mb-4">
              ${property.price.toLocaleString()}
              {property.category.includes("rent") && (
                <span className="text-sm text-slate-500">
                  /{property.rentalPeriod || "month"}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MapPin size={20} />
              <p>{property.address?.city}, {property.address?.country || "Mauritius"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bed size={20} />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bath size={20} />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
              {property.size && (
                <div className="flex items-center gap-2">
                  <Square size={20} />
                  <span>{property.size} m²</span>
                </div>
              )}
            </div>
            <p className="text-slate-600 mb-4">{property.description}</p>

            {/* Amenities with Logos */}
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

            {/* Agent Contact Card */}
            {property.agent && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold mb-2">Contact Agent</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={property.agent.user?.avatarUrl || "/default-avatar.jpg"}
                    alt={`${property.agent.user?.firstName} ${property.agent.user?.lastName}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-bold">
                      {property.agent.user?.firstName} {property.agent.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{property.agent.title}</p>
                    {localStorage.getItem("token") ? (
                      <>
                        <p className="text-sm text-slate-600">{property.agent.user?.contactDetails?.phone}</p>
                        <p className="text-sm text-slate-600">{property.agent.user?.contactDetails?.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-600">Log in to view contact details</p>
                    )}
                  </div>
                </div>
                {/* Agency Branding */}
                {property.agency && (
                  <div className="mt-4 flex items-center gap-2">
                    <img
                      src={property.agency.logoUrl || "/default-agency-logo.png"}
                      alt={property.agency.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <p className="font-medium">{property.agency.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Form for Non-Logged-In Users */}
            {!localStorage.getItem("token") && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Send Inquiry</h3>
                <InquiryForm propertyId={id} agentId={property.agent?._id} />
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

// Inquiry Form Component
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
