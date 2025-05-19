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
    <div className="relative h-screen max-h-[700px] overflow-hidden">
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
      
      {/* Gradient Overlay - Lighter */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 h-full flex items-center relative z-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            <span className="block">
              Find Your Dream
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
              Property in Mauritius
            </span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 font-light leading-relaxed">
            Discover the perfect property for you, from luxurious beachfront villas to modern city apartments.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/properties/for-sale">
              <Button size="lg" variant="solid" className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-8 py-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                Browse Properties For Sale
              </Button>
            </Link>
            <Link to="/properties/for-rent">
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/30 px-8 py-6 rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                Explore Rental Options
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-blue-950 to-transparent z-10"></div>
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl z-0"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl z-0"></div>
    </div>
  );
};

export default Hero;