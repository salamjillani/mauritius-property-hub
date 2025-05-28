import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const SubAdmins = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [subAdmins, setSubAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/sub-admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch sub-admins");
        const data = await response.json();
        setSubAdmins(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_sub_admins"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubAdmins();
  }, [toast, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/sub-admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create sub-admin");
      const data = await response.json();
      setSubAdmins([...subAdmins, data.data]);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      toast({ title: t("sub_admin_created"), description: t("sub_admin_created_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_create_sub_admin"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/sub-admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete sub-admin");
      setSubAdmins(subAdmins.filter((subAdmin) => subAdmin._id !== id));
      toast({ title: t("sub_admin_deleted"), description: t("sub_admin_deleted_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_delete_sub_admin"), variant: "destructive" });
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
          <h1 className="text-3xl font-bold mb-6">{t("sub_admins")}</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("create_sub_admin")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("first_name")}</label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("last_name")}</label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("email")}</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("password")}</label>
                  <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {subAdmins.map((subAdmin) => (
              <Card key={subAdmin._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} /> {subAdmin.firstName} {subAdmin.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{t("email")}: {subAdmin.email}</p>
                  <Button variant="destructive" onClick={() => handleDelete(subAdmin._id)} className="mt-2">
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

export default SubAdmins;