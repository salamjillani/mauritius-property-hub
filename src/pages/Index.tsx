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
import AgentsCarousel from "@/components/home/AgentsCarousel";
import PromoterProjects from "@/components/home/PromoterProjects";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, GeoJSON, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mauritiusRegions from "@/data/mauritiusRegions.json";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [agentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"en" | "fr">("en");
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "EUR" | "MUR">("MUR");
  const [agents, setAgents] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents`);
        if (!response.ok) throw new Error("Failed to fetch agents");
        const data = await response.json();
        setAgents(
          data.data.sort(
            (a, b) =>
              Number(b.isPremium) - Number(a.isPremium) ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
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
        if (!response.ok) throw new Error("Failed to fetch premium agencies");
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

  const toggleAgentSidebar = () => setAgentSidebarOpen(!agentSidebarOpen);

  const getRegionCenter = (regionName: string) => {
    const feature = mauritiusRegions.features.find(
      f => f.properties.name === regionName
    );
    if (!feature) return null;
    const coordinates = feature.geometry.coordinates[0];
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    return [centerLat, centerLng];
  };

  const RegionMap = () => {
    const regionCenters = {
      "North": [-20.05, 57.55],
      "West": [-20.35, 57.35],
      "East": [-20.25, 57.75],
      "South": [-20.45, 57.55],
      "Central": [-20.30, 57.50]
    };

    return (
      <div className="relative z-0 w-full h-[500px] overflow-hidden rounded-lg">
        <MapContainer 
          center={[-20.2, 57.5]} 
          zoom={9} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {mauritiusRegions.features.map(region => (
            <GeoJSON
              key={region.properties.name}
              data={region}
              eventHandlers={{
                click: () => navigate(`/properties?region=${region.properties.name}`)
              }}
              style={() => ({
                fillColor: "transparent",
                weight: 0,
                color: "transparent",
                fillOpacity: 0,
              })}
            />
          ))}
          {Object.entries(regionCenters).map(([name, center]) => (
            <Marker
              key={name}
              position={center as [number, number]}
              icon={L.divIcon({
                className: "region-label",
                html: `<div class="region-label-text">${name}</div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 20]
              })}
            />
          ))}
        </MapContainer>
      </div>
    );
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

        <AgentsCarousel agents={agents} className="w-full px-0 mt-0" />

        <FeaturedListings currency={activeCurrency} />

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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Find Properties by Region</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore properties in different regions of Mauritius. Click on a region to view available properties.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 relative z-0">
            <style>
              {`
                .leaflet-container {
                  z-index: 0 !important;
                }
                .leaflet-control-container {
                  z-index: 1 !important;
                }
                .region-label {
                  z-index: 2 !important;
                }
                .region-label-text {
                  font-weight: bold;
                  font-size: 16px;
                  color: #333;
                  text-shadow: 
                    1px 1px 0 #fff, 
                    -1px -1px 0 #fff, 
                    -1px 1px 0 #fff, 
                    1px -1px 0 #fff;
                  pointer-events: none;
                }
              `}
            </style>
            <RegionMap />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Index;