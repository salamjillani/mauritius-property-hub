import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Image, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { uploadToCloudinary } from "@/utils/cloudinaryService";

const Advertising = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", publicId: "", link: "", status: "active" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/advertisements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch advertisements");
        const data = await response.json();
        setAdvertisements(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_advertisements"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdvertisements();
  }, [toast, t]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const result = await uploadToCloudinary(file, "advertisements");
      setFormData((prev) => ({ ...prev, imageUrl: result.url, publicId: result.publicId }));
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_upload_image"), variant: "destructive" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/advertisements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create advertisement");
      const data = await response.json();
      setAdvertisements([...advertisements, data.data]);
      setFormData({ title: "", imageUrl: "", publicId: "", link: "", status: "active" });
      toast({ title: t("advertisement_created"), description: t("advertisement_created_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_create_advertisement"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/advertisements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete advertisement");
      setAdvertisements(advertisements => advertisements.filter((ad) => ad._id !== id));
      toast({ title: "Advertisement Deleted", description: "Advertisement deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <h1 className="text-3xl font-bold mb-6">{t("advertising")}</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("create_advertisement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("title")}</label>
                  <Input name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("image")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded-md border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("link")}</label>
                  <Input name="link" value={formData.link} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("status")}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </select>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {advertisements.map((ad) => (
              <Card key={ad._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image size={20} /> {ad.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-40 object-cover rounded-md mb-2" />
                  <p><a href={ad.link} target="_blank" rel="noopener noreferrer">{ad.link}</a></p>
                  <p className="text-sm text-gray-500">{t("status")}: {t(ad.status)}</p>
                  <Button variant="destructive" onClick={() => handleDelete(ad._id)} className="mt-2">
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

export default Advertising;