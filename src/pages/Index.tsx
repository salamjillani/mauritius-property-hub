// pages/Index.jsx
import { useState, useEffect } from "react";
import Hero from "@/components/home/Hero";
import FeaturedListings from "@/components/home/FeaturedListings";
import PropertyCategories from "@/components/home/PropertyCategories";
import PropertySection from "@/components/home/PropertySection";
import PremiumAgents from "@/components/home/PremiumAgents";
import AgentSidebar from "@/components/AgentSidebar";
import AgentToggle from "@/components/AgentToggle";
import SearchBar from "@/components/common/SearchBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AgencyLogosSection from "@/components/home/AgencyLogosSection";
import AgentsSection from "@/components/home/AgentsSection";
import PromoterProjects from "@/components/home/PromoterProjects";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Index = () => {
  const [agentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"en" | "fr">("en");
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");
  const [agents, setAgents] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/premium`);
        if (!response.ok) {
          throw new Error("Failed to fetch premium agents");
        }
        const data = await response.json();
        setAgents(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agents",
          variant: "destructive",
        });
      }
    };

    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/premium`);
        if (!response.ok) {
          throw new Error("Failed to fetch premium agencies");
        }
        const data = await response.json();
        setAgencies(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agencies",
          variant: "destructive",
        });
      }
    };

    fetchAgents();
    fetchAgencies();
  }, [toast]);

  const toggleAgentSidebar = () => {
    setAgentSidebarOpen(!agentSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeLanguage={activeLanguage}
        setActiveLanguage={setActiveLanguage}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
      />

      <AgentToggle onClick={toggleAgentSidebar} isActive={agentSidebarOpen} />
      <AgentSidebar isOpen={agentSidebarOpen} onClose={() => setAgentSidebarOpen(false)} agents={agents} />

      <main className="flex-grow">
        <Hero />

        <div className="container mx-auto px-4 -mt-10 relative z-10">
          <SearchBar />
        </div>

        <div className="container mx-auto px-4 py-12">
          <AgencyLogosSection agencies={agencies} />
        </div>

        <div className="w-full px-0 mt-0">
          <AgentsSection className="max-w-full w-full" agents={agents} />
        </div>

        <div className="container mx-auto px-4 py-12">
          <PropertyCategories />
        </div>

        <div className="container mx-auto px-4 py-12 bg-gray-50">
          <FeaturedListings currency={activeCurrency} />
        </div>

        <div className="container mx-auto px-4">
          <PropertySection
            category="for-sale"
            title="Properties For Sale"
            description="Discover a wide range of residential properties available for purchase across Mauritius"
            currency={activeCurrency}
          />
        </div>

        <div className="container mx-auto px-4 bg-gray-50">
          <PropertySection
            category="for-rent"
            title="Properties For Rent"
            description="Browse our selection of rental properties, from apartments to luxury villas"
            currency={activeCurrency}
          />
        </div>

        <div className="container mx-auto px-4">
          <PropertySection
            category="land"
            title="PropertyVueMauritius Projects"
            description="Explore available land and exciting upcoming real estate projects in prime locations"
            currency={activeCurrency}
          />
        </div>

        <div className="container mx-auto px-4 py-12">
          <PremiumAgents agents={agents} />
        </div>

        <div className="container mx-auto px-4 py-12 bg-gray-50">
          <PromoterProjects />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;