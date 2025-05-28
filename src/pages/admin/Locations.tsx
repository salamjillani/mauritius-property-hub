import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Locations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", type: "city", country: "Mauritius", coordinates: { lat: "", lng: "" } });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
        if (!response.ok) throw new Error("Failed to fetch locations");
        const data = await response.json();
        setLocations(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_locations"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, [toast, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create location");
      const data = await response.json();
      setLocations([...locations, data.data]);
      setFormData({ name: "", type: "city", country: "Mauritius", coordinates: { lat: "", lng: "" } });
      toast({ title: t("location_created"), description: t("location_created_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_create_location"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete location");
      setLocations(locations.filter((location) => location._id !== id));
      toast({ title: t("location_deleted"), description: t("location_deleted_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_delete_location"), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">{t("locations")}</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("create_location")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("name")}</label>
                  <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("type")}</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    <option value="city">{t("city")}</option>
                    <option value="region">{t("region")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("country")}</label>
                  <Input name="country" value={formData.country} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t("latitude")}</label>
                    <Input name="lat" type="number" value={formData.coordinates.lat} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t("longitude")}</label>
                    <Input name="lng" type="number" value={formData.coordinates.lng} onChange={handleChange} />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {locations.map((location) => (
              <Card key={location._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} /> {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{t("type")}: {t(location.type)}</p>
                  <p className="text-sm text-gray-600">{t("country")}: {location.country}</p>
                  <p className="text-sm text-gray-600">
                    {t("coordinates")}: {location.coordinates?.lat || "N/A"}, {location.coordinates?.lng || "N/A"}
                  </p>
                  <Button variant="destructive" onClick={() => handleDelete(location._id)} className="mt-2">
                    {t("delete")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Locations;