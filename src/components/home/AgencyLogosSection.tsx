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
    <section className={cn('py-12 px-4 bg-gradient-to-b from-gray-50 to-gray-100', className)}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm md:text-base font-bold text-center mb-6 text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            TRUSTED BY LEADING AGENCIES
          </span>
        </h2>
        
        <InfiniteSlider 
          duration={90}
          durationOnHover={150}
          gap={24}
          className="py-4"
        >
          {agencies.map((agency) => (
            <div key={agency.id} className="min-w-[180px] md:min-w-[220px] flex-shrink-0 px-2">
              <Tilt
                rotationFactor={5}
                isRevese
                style={{ transformOrigin: 'center center' }}
                springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                className="group h-full w-full"
              >
                <Card className="overflow-hidden border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white rounded-xl">
                  <AspectRatio ratio={3/1} className="bg-white relative">
                    <Spotlight
                      className="z-10 from-primary/30 via-primary/20 to-transparent blur-2xl"
                      size={200}
                      springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                    />
                    <div className="flex items-center justify-center h-full w-full p-3">
                      <img 
                        src={agency.logo} 
                        alt={`${agency.name} logo`}
                        className="w-full h-full object-contain rounded filter grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                    </div>
                  </AspectRatio>
                  <div className="p-2 text-center bg-white">
                    <p className="text-xs font-semibold text-gray-700">{agency.name}</p>
                  </div>
                </Card>
              </Tilt>
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
};

export default AgencyLogosSection;