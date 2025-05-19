import React from 'react';
import AgentCarousel from './AgentCarousel';
import { motion } from 'framer-motion';

/**
 * AgentsSection Component
 * Displays a section with a carousel of top agents
 */
interface AgentsSectionProps {
  className?: string;
}

const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  return (
    <section 
      className={`py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 ${className}`} 
      id="agents-section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section highlight badge */}
          <div className="inline-block mb-3">
            <div className="flex items-center bg-primary/10 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="text-xs font-medium text-primary">Expert Agents</span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
            Meet Our Top Agents
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experienced professionals ready to help you find your dream home. 
            Our agents combine market expertise with personalized service to ensure you find the perfect property.
          </p>
        </motion.div>
        
        <motion.div 
          className="py-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AgentCarousel />
        </motion.div>
        
        {/* Stats section */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, staggerChildren: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-center p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-primary mb-1">15+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-primary mb-1">250+</div>
            <div className="text-sm text-gray-600">Properties Sold</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-primary mb-1">98%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-primary mb-1">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgentsSection;