import React, { useCallback, useEffect, useState } from 'react';
import { AGENTS } from '@/data/agents';
import { Star, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fireRandomConfetti } from '@/lib/confetti-utils';

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
      className="flex flex-col items-center space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Agent photo - modernized with glow effect */}
      <div 
        className="relative group cursor-pointer"
        onClick={() => onClick(id)}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-300"></div>
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden relative border-2 border-white">
          <img 
            src={photo} 
            alt={name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
          />
        </div>
      </div>
      
      {/* Agent name with gradient text effect */}
      <div className="text-center mt-1">
        <h3 className="font-semibold text-sm md:text-base line-clamp-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">{name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{role}</p>
      </div>
      
      {/* Agent rating with animated stars */}
      <div className="flex">
        {Array.from({ length: rating || 0 }).map((_, i) => (
          <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
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
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
    
    // Initial call
    updateAgentsToShow();
    
    // Add resize listener
    window.addEventListener('resize', updateAgentsToShow);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateAgentsToShow);
    };
  }, []);
  
  // Handle click on agent photo
  const handleAgentClick = (id: string) => {
    navigate(`/agent/${id}`);
  };
  
  // View all agents with confetti effect
  const handleViewAllClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    fireRandomConfetti(event);
    navigate('/agents');
  };
  
  // Get the current agents to display
  const visibleAgents = Array.from({ length: agentsToShow }).map((_, i) => {
    const index = (currentIndex + i) % AGENTS.length;
    return AGENTS[index];
  });
  
  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % AGENTS.length);
  };
  
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + AGENTS.length) % AGENTS.length);
  };
  
  // Auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative px-4">
        {/* Main carousel container with glass morphism effect */}
        <div className="flex justify-center">
          <AnimatePresence mode="sync">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 p-6 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 shadow-xl">
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
        <div className="flex flex-col sm:flex-row items-center justify-center mt-8 gap-4">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              aria-label="Previous agent"
              className="rounded-full h-10 w-10 hover:bg-primary/10 border border-gray-200 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              aria-label="Next agent"
              className="rounded-full h-10 w-10 hover:bg-primary/10 border border-gray-200 shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            onClick={handleViewAllClick} 
            className="mt-2 sm:mt-0 py-2 px-4 h-10 bg-gradient-to-r from-primary/80 to-primary text-white shadow-md hover:shadow-lg transition-shadow"
            size="sm"
          >
            <Users className="mr-2 h-4 w-4" />
            View All Agents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentCarousel;