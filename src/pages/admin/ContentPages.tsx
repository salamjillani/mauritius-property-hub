import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const ContentPages = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ slug: "", title: "", content: "", metaDescription: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content`);
        if (!response.ok) throw new Error("Failed to fetch pages");
        const data = await response.json();
        setPages(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_pages"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create page");
      const data = await response.json();
      setPages([...pages, data.data]);
      setFormData({ slug: "", title: "", content: "", metaDescription: "" });
      toast({ title: t("page_created"), description: t("page_created_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_create_page"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete page");
      setPages(pages.filter((page) => page._id !== id));
      toast({ title: t("page_deleted"), description: t("page_deleted_message") });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_delete_page"), variant: "destructive" });
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
          <h1 className="text-3xl font-bold mb-6">{t("content_pages")}</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("create_page")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("slug")}</label>
                  <Input name="slug" value={formData.slug} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("title")}</label>
                  <Input name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("content")}</label>
                  <Textarea name="content" value={formData.content} onChange={handleChange} required rows={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("meta_description")}</label>
                  <Input name="metaDescription" value={formData.metaDescription} onChange={handleChange} />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {pages.map((page) => (
              <Card key={page._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} /> {page.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{t("slug")}: {page.slug}</p>
                  <p className="text-sm text-gray-600">{t("meta_description")}: {page.metaDescription || "N/A"}</p>
                  <Button variant="destructive" onClick={() => handleDelete(page._id)} className="mt-2">
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

export default ContentPages;