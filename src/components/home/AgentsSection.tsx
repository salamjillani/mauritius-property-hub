import React from 'react';
import AgentCarousel from './AgentCarousel';

/**
 * AgentsSection Component
 * Displays a section with a carousel of top agents
 */
interface AgentsSectionProps {
  className?: string;
}

const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  return (
    <section className={`py-12 px-4 bg-white ${className}`} id="agents-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Meet Our Top Agents</h2>
          <p className="text-muted-foreground">Experienced professionals ready to help you find your dream home</p>
        </div>
        
        <div className="py-4">
          <AgentCarousel />
        </div>
      </div>
    </section>
  );
};

export default AgentsSection;