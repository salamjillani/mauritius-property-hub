import { useState, useEffect } from "react";

// Mock Link component (simulating react-router-dom's Link)
const Link = ({ to, children }) => (
  <a href={to} style={{ textDecoration: "none" }}>{children}</a>
);

// Mock Button component (simulating @/components/ui/button)
const Button = ({ size, className, variant, children }) => (
  <button className={className}>{children}</button>
);

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
    <div className="relative min-h-screen max-h-none lg:max-h-[700px] overflow-hidden">
      
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
      <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/20 blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-600/10 blur-3xl animate-pulse z-0" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-r from-teal-300/20 to-cyan-400/30 blur-2xl animate-pulse z-0" style={{ animationDelay: '2s' }}></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center relative z-20">
        <div className="max-w-4xl mx-auto text-center lg:text-left">
          {/* Enhanced Typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 lg:mb-8 tracking-tight leading-tight">
            <span className="block mb-2 lg:mb-4 animate-fadeInUp">
              Find Your Dream
            </span>
            <span className="block bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-400 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              Property in Mauritius
            </span>
          </h1>
          
          {/* Enhanced Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 lg:mb-12 font-light leading-relaxed max-w-3xl mx-auto lg:mx-0 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            Discover the perfect property for you, from luxurious beachfront villas to modern city apartments in the heart of paradise.
          </p>
          
          {/* Enhanced Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <Link to="/properties/for-sale">
              <Button 
                size="lg" 
                variant="solid" 
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-8 py-4 lg:px-10 lg:py-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-teal-400/20"
              >
                <span className="flex items-center justify-center">
                  Browse Properties For Sale
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link to="/properties/for-rent">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 px-8 py-4 lg:px-10 lg:py-5 rounded-xl backdrop-blur-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center justify-center">
                  Explore Rental Options
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-sm mb-2 hidden sm:block">Scroll Down</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
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
        `}
      </style>
    </div>
  );
};

export default Hero;