import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, MapPin, Home, Bed, Bath, Square, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const fetchAgent = async (id) => {
  if (!id) throw new Error('Agent ID is required');
  
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${id}?populate=user,agency`);
  if (!res.ok) throw new Error('Agent not found');
  return res.json();
};

const fetchAgentProperties = async (id) => {
  if (!id) throw new Error('Agent ID is required');
  
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${id}`);
  if (!res.ok) throw new Error('Failed to fetch agent properties');
  return res.json();
};

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Redirect if no ID is provided
  useEffect(() => {
    if (!id) {
      navigate('/agents');
    }
  }, [id, navigate]);

  const { data: agentData, isLoading: isLoadingAgent, error: agentError } = useQuery({ 
    queryKey: ['agent', id], 
    queryFn: () => fetchAgent(id),
    enabled: !!id,
    retry: 1
  });

  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = useQuery({
    queryKey: ['agent-properties', id],
    queryFn: () => fetchAgentProperties(id),
    enabled: !!id,
    retry: 1
  });

  if (!id) return (
    <div className="container mx-auto p-4">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No agent ID provided. Redirecting to agents list...
      </div>
    </div>
  );

  if (isLoadingAgent) return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );

  if (agentError) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {agentError.message}
      </div>
      <div className="mt-4">
        <Button asChild>
          <Link to="/agents">Back to Agents</Link>
        </Button>
      </div>
    </div>
  );

  const agent = agentData?.data;
  const user = agent?.user || {};
  const properties = propertiesData?.data || [];

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}/uploads/${url}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={getImageUrl(user?.avatarUrl)} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-center">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-600 text-center mb-4">{agent?.title}</p>
            
            <div className="space-y-4">
              {agent?.contactDetails?.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{agent.contactDetails.phone}</span>
                </div>
              )}
              
              {agent?.contactDetails?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{agent.contactDetails.email}</span>
                </div>
              )}
              
              {user?.email && !agent?.contactDetails?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {agent?.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{agent.location}</span>
                </div>
              )}

              {agent?.agency?.name && (
                <div className="pt-4 border-t mt-4">
                  <p className="font-semibold">Agency:</p>
                  <div className="flex items-center mt-2">
                    {agent.agency.logoUrl && (
                      <img 
                        src={getImageUrl(agent.agency.logoUrl)} 
                        className="h-8 w-8 mr-2 rounded" 
                        alt="Agency logo"
                      />
                    )}
                    <span>{agent.agency.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-600">{agent?.biography || 'No biography available'}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Listings</h2>
            {isLoadingProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                ))}
              </div>
            ) : propertiesError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error loading properties: {propertiesError.message}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <Card key={property._id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-200 relative">
                      {property.images?.[0]?.url ? (
                        <img 
                          src={getImageUrl(property.images[0].url)} 
                          alt={property.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{property.address?.city}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-bold">MUR {property.price?.toLocaleString()}</p>
                        <Button asChild size="sm">
                          <Link to={`/properties/${property._id}`}>View</Link>
                        </Button>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.bedrooms}
                          </div>
                        )}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.bathrooms}
                          </div>
                        )}
                        {property.size > 0 && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            {property.size}m²
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No properties listed by this agent</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Button asChild variant="ghost">
          <Link to="/agents">Back to Agents</Link>
        </Button>
      </div>
    </div>
  );
};

export default AgentDetails;