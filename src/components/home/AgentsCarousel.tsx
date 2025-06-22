import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';
import { cn } from '@/lib/utils';

// Map API agents to the format expected by the carousel
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
  };

  return (
    <section className={cn('relative py-16 px-4', className)}>
      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced header with modern styling matching AgencyLogosSection */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
              Professional Excellence
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700">
              MEET OUR AGENTS
            </span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        {/* Navigation section */}
        <div className="relative mb-8">
          {/* Navigation buttons */}
          {agents.length > 8 && (
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant="outline"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handlePrev}
                aria-label="Previous agents"
              >
                <ChevronLeft size={20} className="text-blue-600" />
              </Button>
              <Button
                variant="outline"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleNext}
                aria-label="Next agents"
              >
                <ChevronRight size={20} className="text-blue-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Agent Cards Grid with responsive design */}
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {agents.slice(currentIndex, currentIndex + 8).map((agent) => (
            <motion.div
              key={agent._id}
              className="min-w-0 flex-shrink-0"
              variants={itemVariants}
            >
              <Tilt
                rotationFactor={8}
                isRevese
                style={{ transformOrigin: 'center center' }}
                springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                className="group h-full w-full cursor-pointer"
              >
                <div className="relative" onClick={() => handleAgentClick(agent._id)}>
                  {/* Glow effect on hover */}
                  <div className={cn(
                    "absolute -inset-1 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500",
                    agent.isPremium 
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  )}></div>
                  
                  <Card className={cn(
                    "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white group-hover:scale-[1.02]",
                    agent.isPremium && "ring-2 ring-amber-400/50"
                  )}>
                    {/* Agent Photo Section */}
                    <div className="relative p-4 pb-2">
                      <Spotlight
                        className="z-10 from-blue-500/20 via-indigo-500/15 to-transparent blur-2xl"
                        size={120}
                        springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                      />
                      
                      <AspectRatio ratio={1} className="bg-gradient-to-br from-white to-slate-50/50 relative rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        <img
                          src={agent.photoUrl || '/default-avatar.jpg'}
                          alt={`${agent.user.firstName} ${agent.user.lastName}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 relative z-10"
                        />
                        
                        {/* Premium badge */}
                        {agent.isPremium && (
                          <div className="absolute top-2 right-2 z-20">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              Premium
                            </span>
                          </div>
                        )}
                      </AspectRatio>
                    </div>
                    
                    {/* Agent Details Section */}
                    <div className="p-4 pt-2 text-center bg-gradient-to-t from-white to-slate-50/30 space-y-2">
                      {/* Name */}
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-slate-900 transition-colors duration-300 truncate">
                          {agent.user.firstName} {agent.user.lastName}
                        </h3>
                        {agent.title && (
                          <p className="text-xs text-slate-600 truncate mt-1">{agent.title}</p>
                        )}
                      </div>

                      {/* Agency */}
                      {agent.agency && (
                        <div className="flex items-center justify-center gap-2 min-w-0">
                          <img
                            src={agent.agency.logoUrl || '/default-agency-logo.png'}
                            alt={agent.agency.name}
                            className="w-4 h-4 object-contain flex-shrink-0"
                          />
                          <p className="text-xs text-slate-600 truncate">{agent.agency.name}</p>
                        </div>
                      )}

                      {/* Listings Count */}
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Listings:</span> {agent.listingsCount || 0}
                      </div>


                      {/* Hover indicator line */}
                      <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    </div>
                  </Card>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative bottom element */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Optional: Page indicator for mobile */}
        {agents.length > 8 && (
          <div className="flex justify-center mt-6 sm:hidden">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(agents.length / 8) }).map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    Math.floor(currentIndex / 8) === i
                      ? "bg-blue-500 w-6"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  onClick={() => setCurrentIndex(i * 8)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentsCarousel;