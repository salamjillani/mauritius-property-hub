import { useState, useEffect } from "react";
import { Star, MapPin, Phone, Mail, Filter, Building, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AllPromotersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoters, setPromoters] = useState([]);
  const [hoveredPromoter, setHoveredPromoter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    setIsLoggedIn(!!localStorage.getItem('token'));
    
    const fetchPromoters = async () => {
      try {
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/promoters?approvalStatus=approved`
);
        if (!response.ok) {
          throw new Error("Failed to fetch promoters");
        }
        const data = await response.json();
        setPromoters(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load promoters",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoters();
  }, [toast]);

  const handlePromoterClick = (id) => {
    navigate(`/promoter/${id}`);
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
            </div>
            <p className="text-slate-700 font-semibold text-lg">Loading promoters...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>

        <main className="relative flex-1 container mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <BackButton
            to="/"
            label="Back to Home"
            className="mb-8 sm:mb-12 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300 hover:translate-x-1"
          />

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="relative inline-block">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-b from-gray-900 to-gray-950 bg-clip-text leading-tight">
                Our Promoters
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl -z-10 rounded-full"></div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Meet our trusted promoters creating exceptional residential and commercial projects
              with innovative designs and quality construction
            </p>
          </motion.div>

          {/* Stats and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0"
          >
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
              <p className="text-slate-700 font-medium">
                <span className="font-bold text-2xl text-blue-600">{promoters.length}</span>
                <span className="ml-2">Verified Promoters</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-600 cursor-pointer hover:text-slate-900 transition-all duration-300 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/80 border border-white/30">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter & Sort</span>
            </div>
          </motion.div>

          {/* Promoters Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {promoters.map((promoter) => (
              <motion.div
                key={promoter._id}
                className="group relative bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/20 hover:border-blue-200/50"
                onClick={() => handlePromoterClick(promoter._id)}
                variants={itemVariants}
                onMouseEnter={() => setHoveredPromoter(promoter._id)}
                onMouseLeave={() => setHoveredPromoter(null)}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient Header */}
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-80"></div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-8 right-8 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-40 animate-pulse delay-300"></div>

                <div className="relative p-6 sm:p-8 flex flex-col items-center">
                  {/* Company Logo */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-all duration-500 bg-gradient-to-r from-blue-100 to-purple-100">
                      <img
                        src={promoter.logoUrl || "/default-logo.jpg"}
                        alt={promoter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-md"></div>
                  </div>

                  {/* Promoter Info */}
                  <h3 className="font-bold text-lg sm:text-xl text-center mb-2 text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
                    {promoter.name}
                  </h3>
                  <p className="text-sm sm:text-base text-blue-600 font-semibold text-center mb-4 px-3 py-1 bg-blue-50 rounded-full">
                    Property Developer
                  </p>

                  {/* Rating Stars */}
                  <div className="flex mb-4 gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 transition-transform duration-200 hover:scale-110"
                      />
                    ))}
                  </div>

                  {/* Established Year Badge */}
                  <div className="bg-gradient-to-b from-gray-900 to-gray-950 text-white px-4 sm:px-6 py-2 rounded-full mb-5 shadow-lg">
                    <p className="text-sm font-semibold">
                      {promoter.establishedYear ? `Est. ${promoter.establishedYear}` : "Established"}
                    </p>
                  </div>

                  {/* Contact Details - Animated on Hover */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: hoveredPromoter === promoter._id ? 1 : 0,
                      height: hoveredPromoter === promoter._id ? "auto" : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full overflow-hidden"
                  >
                    <div className="pt-4 border-t border-slate-200/50 mt-3 flex flex-col gap-3">
                      {isLoggedIn ? (
                        <>
                          {promoter.user?.phone && (
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50/80 rounded-lg px-3 py-2">
                              <Phone className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">
                                {promoter.user?.phone}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-slate-600 bg-slate-50/80 rounded-lg px-3 py-2">
                            <Mail className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium truncate">
                              {promoter.user?.email}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="flex flex-col gap-2 items-center p-3 bg-slate-50/80 rounded-lg cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/login');
                          }}
                        >
                          <div className="flex items-center gap-2 text-blue-500">
                            <Phone className="w-4 h-4" />
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-center">
                            Login to view contact details
                          </span>
                        </div>
                      )}
                      {promoter.website && (
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50/80 rounded-lg px-3 py-2">
                          <Building className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium truncate">
                            {promoter.website}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <button className="mt-6 w-full py-3 px-6 bg-gradient-to-b from-gray-900 to-gray-950 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {promoters.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No Promoters Found
                </h3>
                <p className="text-slate-500">
                  We're working on adding more verified property developers to our platform.
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AllPromotersPage;