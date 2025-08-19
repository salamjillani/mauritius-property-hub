import React, { useState, useEffect } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';
import { Building2 } from 'lucide-react';

interface AgencyLogosSectionProps {
  className?: string;
}

/**
 * AgencyLogosSection Component
 * Displays logos of real trusted agencies from the database
 * Includes grayscale-to-color transition on hover
 */
const AgencyLogosSection: React.FC<AgencyLogosSectionProps> = ({ className }) => {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        // Fetch approved agencies from your API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/approved`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch agencies');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Filter agencies that have logos and take a reasonable number for the slider
          const agenciesWithLogos = data.data
            .filter(agency => agency.logoUrl && agency.logoUrl !== 'default-agency-logo.png')
            .slice(0, 12); // Limit to 12 agencies for performance
          
          setAgencies(agenciesWithLogos);
        }
      } catch (err) {
        console.error('Error fetching agencies:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  // Don't render anything if loading, error, or no agencies
  if (isLoading) {
    return (
      <section className={cn(
        'relative py-16 px-4 overflow-hidden',
        'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50',
        className
      )}>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-lg mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                Loading Agencies
              </span>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || agencies.length === 0) {
    return null; // Don't render the section if there's an error or no agencies
  }
  
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
              REGISTERED AGENCIES WE WORK WITH
            </span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>
        
        {/* Enhanced infinite slider with real agency data */}
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
              <div key={agency._id} className="min-w-[160px] sm:min-w-[180px] md:min-w-[220px] lg:min-w-[240px] flex-shrink-0 px-2">
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
                          
                          {agency.logoUrl ? (
                            <img 
                              src={agency.logoUrl} 
                              alt={`${agency.name} logo`}
                              className="w-full h-full object-contain rounded-lg filter grayscale-[0.8] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 relative z-10"
                              onError={(e) => {
                                // Fallback to default icon if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback icon */}
                          <div 
                            className="w-full h-full flex items-center justify-center relative z-10"
                            style={{ display: agency.logoUrl ? 'none' : 'flex' }}
                          >
                            <Building2 className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                          </div>
                        </div>
                      </AspectRatio>
                      
                      {/* Enhanced text section */}
                      <div className="p-3 text-center bg-gradient-to-t from-white to-slate-50/30 border-t border-slate-100/50">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300 truncate">
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