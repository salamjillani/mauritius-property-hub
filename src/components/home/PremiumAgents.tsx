import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Loader2, Building, Star } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading premium agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg">
        <p className="text-red-600 mb-6 font-medium">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Premium Agents</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our experienced professionals are here to help you find the perfect property in Mauritius
          </p>
        </div>
        
        {agents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No premium agents available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <Link key={agent._id} to={`/agents/${agent._id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-0 bg-white rounded-xl shadow-sm hover:translate-y-[-5px]">
                  <div className="relative pt-8 pb-24 px-6 flex flex-col items-center">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-semibold py-1 px-3 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Premium
                    </div>
                    <div className="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-teal-100 shadow-md">
                      <img 
                        src={agent.user?.avatarUrl ? getImageUrl(agent.user.avatarUrl) : "https://via.placeholder.com/100"} 
                        alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-1">
                      {agent.user ? `${agent.user.firstName} ${agent.user.lastName}` : "Unknown Agent"}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium text-center mb-3">{agent.title}</p>
                    
                    {agent.agency && (
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-white p-1 rounded-md shadow-sm mr-2">
                          <img 
                            src={getAgencyLogoUrl(agent.agency)} 
                            alt={agent.agency.name}
                            className="h-6" 
                          />
                        </div>
                        <span className="text-xs text-gray-600">{agent.agency.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1.5 text-teal-600" />
                      <span>{agent.location}</span>
                    </div>
                    
                    <div className="bg-teal-100 rounded-full text-teal-800 text-sm py-1.5 px-4 mb-4 font-medium">
                      {agent.listingsCount || 0} Listings
                    </div>
                    
                    <Button className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-6">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link to="/agents">
            <Button variant="outline" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full px-8 py-6 font-medium text-base">
              View All Agents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PremiumAgents;

