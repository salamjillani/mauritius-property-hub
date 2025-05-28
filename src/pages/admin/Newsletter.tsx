import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface CampaignForm {
  subject: string;
  content: string;
}

const Newsletter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaignForm, setCampaignForm] = useState<CampaignForm>({ subject: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch subscribers");
        const data = await response.json();
        setSubscribers(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_subscribers"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, [toast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignForm),
      });
      if (!response.ok) throw new Error("Failed to send newsletter");
      toast({ title: t("newsletter_sent"), description: t("newsletter_sent_message") });
      setCampaignForm({ subject: "", content: "" });
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_send_newsletter"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold mb-6">{t("newsletter_management")}</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("send_newsletter")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("subject")}</label>
                  <Input name="subject" value={campaignForm.subject} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("content")}</label>
                  <Textarea name="content" value={campaignForm.content} onChange={handleChange} required rows={6} />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? t("sending") : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} /> {t("subscribers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscribers.map((subscriber) => (
                  <div key={subscriber._id} className="text-sm text-gray-600">
                    {subscriber.email} - {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Newsletter;