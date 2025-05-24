import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Map API agents to the format expected by the 3D carousel
const mapAgentsToCarouselItems = (agents) => {
  return agents.map(agent => ({
    id: agent._id,
    url: agent.photoUrl || '/default-avatar.jpg',
    alt: `${agent.user.firstName} ${agent.user.lastName}`,
    rating: agent.rating || 0,
    isPremium: agent.isPremium || false,
  }));
};

const AgentsCarousel = ({ agents, className }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get our agents data
  const agentItems = mapAgentsToCarouselItems(agents);

  // Handle click on agent photo
  const handleAgentClick = (id) => {
    navigate(`/agent/${id}`);
  };

  // Add onClick handler to each agent
  const agentsWithHandlers = agentItems.map(agent => ({
    ...agent,
    onClick: () => handleAgentClick(agent.id),
  }));

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(agents.length - 8, 0) : prev - 8));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 8 >= agents.length ? 0 : prev + 8));
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <section className={`${className} overflow-hidden py-12`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Meet Our Agents</h2>
        <div className="relative">
          {/* Gradient overlay for 3D carousel */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70 pointer-events-none z-10"></div>


          {/* Navigation buttons */}
          {agents.length > 8 && (
            <>
              <Button
                variant="outline"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
                onClick={handlePrev}
                aria-label="Previous agents"
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="outline"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20"
                onClick={handleNext}
                aria-label="Next agents"
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}
        </div>

        {/* Agent Ratings and Details Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {agents.slice(currentIndex, currentIndex + 8).map((agent) => (
            <motion.div
              key={agent._id}
              className={`flex flex-col items-center ${
                agent.isPremium ? 'border-2 border-amber-400 scale-105 rounded-lg p-2' : ''
              }`}
              variants={itemVariants}
              whileHover="hover"
              onClick={() => handleAgentClick(agent._id)}
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden cursor-pointer mb-2 border-2 ${
                  agent.isPremium ? 'border-amber-400' : 'border-primary/20'
                } hover:border-primary/60 transition-all shadow-md hover:shadow-lg group`}
              >
                <div className="w-full h-full relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={agent.photoUrl || '/default-avatar.jpg'}
                    alt={`${agent.user.firstName} ${agent.user.lastName}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-800 text-center">
                {agent.user.firstName} {agent.user.lastName}
              </p>
              <p className="text-xs text-slate-600 text-center">{agent.title}</p>
              {agent.agency && (
                <div className="flex items-center gap-1 mt-1">
                  <img
                    src={agent.agency.logoUrl || '/default-agency-logo.png'}
                    alt={agent.agency.name}
                    className="w-4 h-4 object-contain"
                  />
                  <p className="text-xs text-slate-600">{agent.agency.name}</p>
                </div>
              )}
              <p className="text-xs text-slate-600 mt-1">Listings: {agent.listingsCount || 0}</p>
              <div className="flex mt-1">
                {Array.from({ length: agent.rating || 0 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                ))}
              </div>
              {agent.isPremium && (
                <span className="text-xs bg-amber-400 text-white px-2 py-1 rounded-full mt-1">
                  Premium
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AgentsCarousel;