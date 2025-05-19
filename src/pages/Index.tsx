import { useState } from "react";
import Hero from "@/components/home/Hero";
import FeaturedListings from "@/components/home/FeaturedListings";
import PropertyCategories from "@/components/home/PropertyCategories";
import PropertySection from "@/components/home/PropertySection";
import PremiumAgents from "@/components/home/PremiumAgents";
import AgentSidebar from '@/components/AgentSidebar';
import AgentToggle from '@/components/AgentToggle';
import { AGENTS } from '@/data/agents';
import SearchBar from "@/components/common/SearchBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AgencyLogosSection from "@/components/home/AgencyLogosSection";
import AgentsSection from '@/components/home/AgentsSection';

const Index = () => {
  const [agentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"en" | "fr">("en");
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");

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
      <AgentSidebar isOpen={agentSidebarOpen} onClose={() => setAgentSidebarOpen(false)} agents={AGENTS} />
      
      <main className="flex-grow">
        <Hero />
        
        <div className="container mx-auto px-4 -mt-10 relative z-10">
          <SearchBar />
        </div>

        <div className="container mx-auto px-4 py-12">
          <AgencyLogosSection />
        </div>

        <div className="w-full px-0 mt-0">
          <AgentsSection className="max-w-full w-full" />
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <PropertyCategories />
        </div>
        
        <div className="container mx-auto px-4 py-12 bg-gray-50">
          <FeaturedListings currency={activeCurrency} />
        </div>
        
        {/* New Property Sections with Carousels */}
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
          <PremiumAgents />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;