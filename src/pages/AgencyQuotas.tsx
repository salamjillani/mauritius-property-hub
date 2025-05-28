import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const AgencyQuotas = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agency, setAgency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/my-agency`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch agency");
        const data = await response.json();
        setAgency(data.data);
      } catch (error) {
        toast({ title: t("error"), description: t("failed_to_load_agency"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgency();
  }, [toast, t]);

  const handleUpgradePlan = async (plan) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/upgrade-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) throw new Error("Failed to upgrade plan");
      toast({ title: t("plan_upgraded"), description: t("plan_upgraded_message") });
      navigate(0); // Refresh page
    } catch (error) {
      toast({ title: t("error"), description: t("failed_to_upgrade_plan"), variant: "destructive" });
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

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">{t("agency_not_found")}</p>
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
          <h1 className="text-3xl font-bold mb-6">{t("agency_quotas")}</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={24} /> {agency.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{t("subscription_plan")}</h3>
                  <p className="text-slate-600">
                    {t("current_plan")}: {agency.subscription?.plan || "Basic"}
                  </p>
                  <p className="text-slate-600">
                    {t("listing_limit")}: {agency.subscription?.listingLimit || "Unlimited"}
                  </p>
                  <p className="text-slate-600">
                    {t("listings_used")}: {agency.subscription?.listingsUsed || 0}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t("upgrade_plan")}</h3>
                  <div className="flex gap-4">
                    <Button onClick={() => handleUpgradePlan("premium")}>{t("upgrade_to_premium")}</Button>
                    <Button onClick={() => handleUpgradePlan("enterprise")}>{t("upgrade_to_enterprise")}</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t("billing_info")}</h3>
                  <p className="text-slate-600">{t("last_billed")}: {agency.subscription?.lastBilled || "N/A"}</p>
                  <p className="text-slate-600">{t("next_billing")}: {agency.subscription?.nextBilling || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AgencyQuotas;