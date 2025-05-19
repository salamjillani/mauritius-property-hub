import React, { useState } from 'react';
import { AGENTS } from '@/data/agents';
import { Star, MapPin, Phone, Mail, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';

/**
 * AllAgentsPage Component
 * Displays a grid of all available real estate agents with enhanced UI
 */
const AllAgentsPage = () => {
  const navigate = useNavigate();
  const [hoveredAgent, setHoveredAgent] = useState(null);
  
  // Handle agent card click to navigate to agent details page
  const handleAgentClick = (id) => {
    navigate(`/agent/${id}`);
  };

  // Animation variants for staggered entrance of agent cards
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-16 px-4">
        <BackButton to="/" label="Back to Home" className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-transparent bg-clip-text">Our Real Estate Experts</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet our dedicated team of professionals committed to helping you find your perfect home</p>
        </motion.div>
        
        <div className="mb-8 flex justify-between items-center">
          <p className="text-slate-700"><span className="font-semibold">{AGENTS.length}</span> Agents Available</p>
          <div className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter</span>
          </div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {AGENTS.map((agent) => (
            <motion.div 
              key={agent.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleAgentClick(agent.id)}
              variants={itemVariants}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              whileHover={{ y: -5 }}
            >
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70"></div>
              
              <div className="relative p-6 flex flex-col items-center">
                {/* Agent photo */}
                <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={agent.photo} 
                    alt={agent.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Agent info */}
                <h3 className="font-bold text-lg text-center mb-1">{agent.name}</h3>
                <p className="text-sm text-blue-600 font-medium text-center mb-3">{agent.role}</p>
                
                {/* Agent rating */}
                <div className="flex mb-3">
                  {Array.from({ length: agent.rating || 0 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  {Array.from({ length: 5 - (agent.rating || 0) }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-slate-200" />
                  ))}
                </div>
                
                {/* Properties count */}
                <div className="bg-blue-50 px-4 py-1 rounded-full mb-4">
                  <p className="text-sm font-medium text-blue-700">{agent.properties} Properties</p>
                </div>
                
                {/* Contact info - shows on hover */}
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: hoveredAgent === agent.id ? 1 : 0,
                    height: hoveredAgent === agent.id ? 'auto' : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-full overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{agent.phone || '(555) 123-4567'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{agent.email || `${agent.name.toLowerCase().replace(' ', '.')}@realestate.com`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{agent.location || 'New York, NY'}</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* "View Profile" button */}
                <button className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AllAgentsPage;