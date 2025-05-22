import React, { useCallback, useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fireRandomConfetti } from '@/lib/confetti-utils';
import { useToast } from '@/hooks/use-toast';

// Type for our AgentItem component
interface AgentItemProps {
  id: string;
  name: string;
  role: string;
  photo: string;
  rating: number;
  onClick: (id: string) => void;
}

// AgentItem component to display each agent
const AgentItem: React.FC<AgentItemProps> = ({ id, name, role, photo, rating, onClick }) => {
  return (
    <motion.div 
      className="flex flex-col items-center space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Agent name */}
      <div className="text-center mb-1">
        <h3 className="font-semibold text-sm md:text-base line-clamp-1">{name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{role}</p>
      </div>
      
      {/* Agent photo - reduced size */}
      <div 
        className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden cursor-pointer border-2 border-primary/10 hover:border-primary/50 transition-colors"
        onClick={() => onClick(id)}
      >
        <img 
          src={photo} 
          alt={name} 
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" 
        />
      </div>
      
      {/* Agent rating */}
      <div className="flex">
        {Array.from({ length: rating || 0 }).map((_, i) => (
          <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
    </motion.div>
  );
};

// Main carousel component
interface AgentCarouselProps {
  className?: string;
}

const AgentCarousel: React.FC<AgentCarouselProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate the number of agents to show based on screen size
  const [agentsToShow, setAgentsToShow] = useState(4);
  
  useEffect(() => {
    // Function to update agents to show based on window width
    const updateAgentsToShow = () => {
      if (window.innerWidth < 640) {
        setAgentsToShow(2); // Show 2 on mobile
      } else if (window.innerWidth < 768) {
        setAgentsToShow(3); // Show 3 on tablet
      } else if (window.innerWidth < 1024) {
        setAgentsToShow(4); // Show 4 on small desktop
      } else {
        setAgentsToShow(4); // Show 4 on large desktop
      }
    };
    
    updateAgentsToShow();
    window.addEventListener('resize', updateAgentsToShow);
    return () => window.removeEventListener('resize', updateAgentsToShow);
  }, []);

  // Fetch all agents from the API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/agents?limit=10`);
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        // Map API response to match expected agent structure
        const mappedAgents = data.data.map((agent: any) => ({
          id: agent._id,
          name: `${agent.user?.firstName || ''} ${agent.user?.lastName || ''}`.trim() || 'Unknown Agent',
          role: agent.title || 'Real Estate Agent',
          photo: agent.user?.avatarUrl?.startsWith('http') 
            ? agent.user.avatarUrl 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${agent.user?.avatarUrl || 'default-avatar.jpg'}`,
          rating: agent.rating || 4, // Default rating if not provided
        }));
        setAgents(mappedAgents);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching agents');
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || 'Failed to load agents',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);
  
  // Handle click on agent photo
  const handleAgentClick = (id: string) => {
    navigate(`/agent/${id}`);
  };
  
  // View all agents with confetti effect
  const handleViewAllClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    fireRandomConfetti(event);
    navigate('/agents');
  };
  
  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % agents.length);
  }, [agents.length]);
  
  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + agents.length) % agents.length);
  }, [agents.length]);
  
  // Auto rotation
  useEffect(() => {
    if (agents.length > 0) {
      const interval = setInterval(() => {
        goToNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [agents.length, goToNext]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading agents...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No agents state
  if (agents.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <p className="text-gray-500">No agents available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the current agents to display
  const visibleAgents = Array.from({ length: Math.min(agentsToShow, agents.length) }).map((_, i) => {
    const index = (currentIndex + i) % agents.length;
    return agents[index];
  }).filter(agent => agent && agent.id);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative px-4">
        {/* Main carousel container */}
        <div className="flex justify-center">
          <AnimatePresence mode="sync">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
              {visibleAgents.map((agent) => (
                <motion.div
                  key={`${agent.id}-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AgentItem
                    id={agent.id}
                    name={agent.name}
                    role={agent.role}
                    photo={agent.photo}
                    rating={agent.rating}
                    onClick={handleAgentClick}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
        
        {/* Navigation buttons and View All button */}
        <div className="flex flex-col sm:flex-row items-center justify-center mt-6 gap-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              aria-label="Previous agent"
              className="rounded-full h-9 w-9 hover:bg-primary/10"
              disabled={agents.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              aria-label="Next agent"
              className="rounded-full h-9 w-9 hover:bg-primary/10"
              disabled={agents.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleViewAllClick} 
            className="mt-2 sm:mt-0 text-xs py-1 px-3 h-8 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
            variant="outline"
            size="sm"
          >
            <Users className="mr-1 h-3 w-3" />
            View All Agents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;