import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] max-h-none overflow-hidden">
      
      {/* Video Background with Parallax Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <video 
          className="absolute w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{
            transform: scrolled ? "scale(1.05)" : "scale(1)"
          }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/20 blur-2xl animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 left-1/4 w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-600/10 blur-2xl animate-pulse z-0" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-teal-300/20 to-cyan-400/30 blur-xl animate-pulse z-0" style={{ animationDelay: '2s' }}></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20 py-12">
        <div className="max-w-4xl mx-auto text-center lg:text-left">
          {/* Enhanced Typography */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 tracking-tight leading-tight">
            <span className="block mb-1 lg:mb-2 animate-fadeInUp">
              Find Your Dream
            </span>
            <span className="block bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-400 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              Property in Mauritius
            </span>
          </h1>
          
          {/* Enhanced Description */}
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 lg:mb-8 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            Discover the perfect property for you, from luxurious beachfront villas to modern city apartments in the heart of paradise.
          </p>
          
          {/* Enhanced Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <Link to="/properties/for-sale">
              <Button 
                size="lg" 
                variant="solid" 
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-6 py-3 lg:px-8 lg:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-teal-400/20"
              >
                <span className="flex items-center justify-center text-sm lg:text-base">
                  Browse Properties For Sale
                  <svg className="ml-2 w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link to="/properties/for-rent">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 px-6 py-3 lg:px-8 lg:py-3 rounded-lg backdrop-blur-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center justify-center text-sm lg:text-base">
                  Explore Rental Options
                  <svg className="ml-2 w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-xs mb-1 hidden sm:block">Scroll Down</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @media (max-width: 640px) {
          .animate-fadeInUp {
            animation-delay: 0s !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;