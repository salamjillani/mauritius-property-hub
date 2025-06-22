import React from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';

interface AgencyLogosSectionProps {
  className?: string;
}

/**
 * AgencyLogosSection Component
 * Displays logos of trusted real estate agencies with premium tilt effect
 * Includes grayscale-to-color transition on hover
 */
const AgencyLogosSection: React.FC<AgencyLogosSectionProps> = ({ className }) => {
  // Agency logos data for the infinite slider
  const agencies = [
    { 
      id: '1', 
      name: 'Premium Real Estate',
      logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '2', 
      name: 'Urban Living',
      logo: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '3', 
      name: 'Coastal Homes',
      logo: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '4', 
      name: 'Luxury Properties',
      logo: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '5', 
      name: 'Mountain View Realty',
      logo: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '6', 
      name: 'City Dwellers',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '7', 
      name: 'Modern Spaces',
      logo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    { 
      id: '8', 
      name: 'Elite Properties',
      logo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
  ];
  
  return (
    <section className={cn(
      'relative py-16 px-4 overflow-hidden',
      'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50',
      'before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.03)_50%,transparent_75%)]',
      'before:bg-[length:20px_20px] before:animate-pulse',
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced header with modern styling */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
              Partnership Excellence
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700">
              TRUSTED BY LEADING AGENCIES
            </span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>
        
        {/* Enhanced infinite slider with better spacing */}
        <div className="relative">
          {/* Gradient overlays for seamless edges */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
          
          <InfiniteSlider 
            duration={90}
            durationOnHover={150}
            gap={32}
            className="py-8"
          >
            {agencies.map((agency) => (
              <div key={agency.id} className="min-w-[160px] sm:min-w-[180px] md:min-w-[220px] lg:min-w-[240px] flex-shrink-0 px-2">
                <Tilt
                  rotationFactor={8}
                  isRevese
                  style={{ transformOrigin: 'center center' }}
                  springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                  className="group h-full w-full"
                >
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                    
                    <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full bg-white/90 backdrop-blur-sm rounded-2xl group-hover:bg-white group-hover:scale-[1.02]">
                      <AspectRatio ratio={3/1} className="bg-gradient-to-br from-white to-slate-50/50 relative">
                        <Spotlight
                          className="z-10 from-blue-500/20 via-indigo-500/15 to-transparent blur-2xl"
                          size={220}
                          springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                        />
                        
                        {/* Enhanced image container */}
                        <div className="flex items-center justify-center h-full w-full p-4 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                          <img 
                            src={agency.logo} 
                            alt={`${agency.name} logo`}
                            className="w-full h-full object-contain rounded-lg filter grayscale-[0.8] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 relative z-10"
                          />
                        </div>
                      </AspectRatio>
                      
                      {/* Enhanced text section */}
                      <div className="p-3 text-center bg-gradient-to-t from-white to-slate-50/30 border-t border-slate-100/50">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                          {agency.name}
                        </p>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      </div>
                    </Card>
                  </div>
                </Tilt>
              </div>
            ))}
          </InfiniteSlider>
        </div>

        {/* Decorative bottom element */}
        <div className="flex justify-center mt-8">
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
      </div>
    </section>
  );
};

export default AgencyLogosSection;