import React from 'react';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';
import { AGENTS } from '@/data/agents';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Map our agents to the format expected by the 3D carousel
const mapAgentsToCarouselItems = () => {
  // Get agents data
  return AGENTS.map(agent => ({
    id: agent.id,
    url: agent.photo,
    alt: agent.name,
    rating: agent.rating,
  }));
};

interface AgentsCarouselProps {
  className?: string;
}

const AgentsCarousel: React.FC<AgentsCarouselProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // Get our agents data
  const agentItems = mapAgentsToCarouselItems();
  
  // Handle click on agent photo
  const handleAgentClick = (id: string) => {
    navigate(`/agent/${id}`);
  };

  // Add onClick handler to each agent
  const agentsWithHandlers = agentItems.map(agent => ({
    ...agent,
    onClick: (id: string) => handleAgentClick(id)
  }));

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    }
  };
  
  return (
    <div className={`${className} overflow-hidden`}>
      <div className="relative">
        {/* Enhanced 3D carousel with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70 pointer-events-none z-10"></div>
        
        <ThreeDPhotoCarousel 
          images={agentsWithHandlers} 
          height="450px"
          autoRotate={true}
        />
        
        {/* Enhanced Agent Ratings grid with animation */}
        <motion.div 
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 mt-8 px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {agentItems.slice(0, 8).map((agent, index) => (
            <motion.div 
              key={agent.id} 
              className="flex flex-col items-center"
              variants={itemVariants}
              whileHover="hover"
            >
              <div 
                className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden cursor-pointer mb-2 border-2 border-primary/20 hover:border-primary/60 transition-all shadow-md hover:shadow-lg group"
                onClick={() => handleAgentClick(agent.id)}
              >
                <div className="w-full h-full relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img 
                    src={agent.url} 
                    alt={agent.alt} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: agent.rating || 0 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AgentsCarousel;