import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

const fetchAgents = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents`);
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL}/uploads/${url}`;
};

const Agents = () => {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['agents'], 
    queryFn: fetchAgents
  });

  if (isLoading) return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">All Agents</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">All Agents</h1>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error.message}
      </div>
    </div>
  );

  // Check if data and data.data exist
  const agents = data?.data || [];
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">All Agents</h1>
      
      {agents.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={getImageUrl(agent.user?.avatarUrl)} />
                    <AvatarFallback>
                      {agent.user?.firstName?.[0]}{agent.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {agent.user?.firstName} {agent.user?.lastName}
                    </h3>
                    <p className="text-gray-600">{agent.title}</p>
                    {agent.agency?.name && (
                      <p className="text-sm text-muted-foreground">
                        {agent.agency.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/agents/${agent._id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;