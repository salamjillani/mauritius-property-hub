import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const ContentPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { toast } = useToast();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch page");
        const data = await response.json();
        setPage(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_page"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug, toast, t]);

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

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">{t("page_not_found")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ContentPage;