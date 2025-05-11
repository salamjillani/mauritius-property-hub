
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";

// Sample data for premium agents
const premiumAgents = [
  {
    id: "a1",
    name: "Marie Laurent",
    title: "Senior Property Consultant",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    location: "Grand Baie",
    phone: "+230 5789 1234",
    email: "marie@propertymauritius.com",
    listingsCount: 24,
    isPremium: true,
    agency: {
      id: "ag1",
      name: "Island Prestige Properties",
      logo: "https://via.placeholder.com/100"
    }
  },
  {
    id: "a2",
    name: "Jean Dupont",
    title: "Luxury Property Specialist",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    location: "Port Louis",
    phone: "+230 5789 5678",
    email: "jean@propertymauritius.com",
    listingsCount: 18,
    isPremium: true,
    agency: {
      id: "ag2",
      name: "Mauritius Luxury Estates",
      logo: "https://via.placeholder.com/100"
    }
  },
  {
    id: "a3",
    name: "Sarah Johnson",
    title: "Commercial Property Expert",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    location: "Ebene",
    phone: "+230 5789 9876",
    email: "sarah@propertymauritius.com",
    listingsCount: 15,
    isPremium: true,
    agency: null
  },
  {
    id: "a4",
    name: "Michael Wong",
    title: "Investment Property Advisor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    location: "Flic en Flac",
    phone: "+230 5789 4321",
    email: "michael@propertymauritius.com",
    listingsCount: 20,
    isPremium: true,
    agency: {
      id: "ag1",
      name: "Island Prestige Properties",
      logo: "https://via.placeholder.com/100"
    }
  }
];

const PremiumAgents = () => {
  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Our Premium Agents</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our experienced agents are here to help you find the perfect property in Mauritius
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {premiumAgents.map((agent) => (
          <Link key={agent.id} to={`/agents/${agent.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border-amber-400 border">
              <div className="relative pt-6 pb-20 px-6 flex flex-col items-center">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-semibold py-1 px-2">
                  Premium
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-2">{agent.title}</p>
                
                {agent.agency && (
                  <div className="flex items-center justify-center mb-3">
                    <img 
                      src={agent.agency.logo} 
                      alt={agent.agency.name}
                      className="h-5 mr-1" 
                    />
                    <span className="text-xs text-gray-600">{agent.agency.name}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{agent.location}</span>
                </div>
                
                <div className="bg-blue-100 rounded-full text-blue-800 text-sm py-1 px-3 mb-4">
                  {agent.listingsCount} Listings
                </div>
                
                <Button className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/agents">
          <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            View All Agents
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PremiumAgents;
