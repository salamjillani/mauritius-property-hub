
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

interface Agency {
  _id: string;
  name: string;
  logoUrl: string;
}

interface Agent {
  _id: string;
  title: string;
  location: string;
  isPremium: boolean;
  user: User;
  agency: Agency | null;
  listingsCount: number;
}

const PremiumAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPremiumAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/agents/premium`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch premium agents');
        }
        
        const data = await response.json();
        setAgents(data.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching agents');
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || 'Failed to load premium agents',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumAgents();
  }, [toast]);

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${imageUrl}`;
  };

  const getAgencyLogoUrl = (agency: Agency | null) => {
    if (!agency || !agency.logoUrl) {
      return "https://via.placeholder.com/100";
    }
    
    if (agency.logoUrl.startsWith('http')) {
      return agency.logoUrl;
    }
    
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${agency.logoUrl}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading premium agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Our Premium Agents</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our experienced agents are here to help you find the perfect property in Mauritius
        </p>
      </div>
      
      {agents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No premium agents available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Link key={agent._id} to={`/agents/${agent._id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border-amber-400 border">
                <div className="relative pt-6 pb-20 px-6 flex flex-col items-center">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-semibold py-1 px-2">
                    Premium
                  </div>
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <img 
                      src={agent.user?.avatarUrl ? getImageUrl(agent.user.avatarUrl) : "https://via.placeholder.com/100"} 
                      alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-1">
                    {agent.user ? `${agent.user.firstName} ${agent.user.lastName}` : "Unknown Agent"}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-2">{agent.title}</p>
                  
                  {agent.agency && (
                    <div className="flex items-center justify-center mb-3">
                      <img 
                        src={getAgencyLogoUrl(agent.agency)} 
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
                    {agent.listingsCount || 0} Listings
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
      )}
      
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
