
import { useState } from "react";
import Hero from "@/components/home/Hero";
import FeaturedListings from "@/components/home/FeaturedListings";
import PropertyCategories from "@/components/home/PropertyCategories";
import PremiumAgents from "@/components/home/PremiumAgents";
import SearchBar from "@/components/common/SearchBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const [activeLanguage, setActiveLanguage] = useState<"en" | "fr">("en");
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        activeLanguage={activeLanguage}
        setActiveLanguage={setActiveLanguage}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
      />
      
      <main className="flex-grow">
        <Hero />
        
        <div className="container mx-auto px-4 -mt-10 relative z-10">
          <SearchBar />
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <PropertyCategories />
        </div>
        
        <div className="container mx-auto px-4 py-12 bg-gray-50">
          <FeaturedListings currency={activeCurrency} />
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
