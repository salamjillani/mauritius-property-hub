import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
// Update the import path below to the correct location of PropertyCard
import PropertyCard from "@/components/PropertyCard";
import { useToast } from "@/hooks/use-toast";

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties`
        );
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        
        // Sort properties: Gold cards first, then by creation date
        const sortedProperties = data.data.sort((a, b) => {
          // Gold cards first
          if (a.isGoldCard && !b.isGoldCard) return -1;
          if (!a.isGoldCard && b.isGoldCard) return 1;
          
          // Then by creation date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setProperties(sortedProperties);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast]);

  const filteredProperties =
    activeTab === "all"
      ? properties
      : properties.filter((property) => property.category === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Properties</h1>
          <p className="text-gray-600">Explore our wide range of properties.</p>
        </motion.div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex justify-center">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="for-sale">For Sale</TabsTrigger>
            <TabsTrigger value="for-rent">For Rent</TabsTrigger>
            <TabsTrigger value="offices">Offices</TabsTrigger>
            <TabsTrigger value="land">Land</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <PropertyCard
                    property={property}
                    isExpired={property.isExpired}
                    currency="USD"
                    variant="standard"
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;