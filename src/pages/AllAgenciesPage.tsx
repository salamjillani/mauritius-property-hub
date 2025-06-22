// AllAgenciesPage Component
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building, Star, MapPin, Users, Award, TrendingUp } from "lucide-react";

interface Agency {
  _id: string;
  name: string;
  logoUrl: string;
  isPremium: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  agents: Array<{ _id: string }>;
  listingsCount: number;
}

const AllAgenciesPage = () => {
  const { data: agencies = [], isLoading, error } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agencies?approvalStatus=approved`
      );
      if (!response.ok) throw new Error("Failed to fetch agencies");
      const data = await response.json();
      return data.data || [];
    },
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
        
        <div className="relative container mx-auto py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          {/* Centered Title */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="relative inline-block">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-b from-gray-900 to-gray-950 bg-clip-text leading-tight">
                Our Partner Agencies
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl -z-10 rounded-full"></div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover trusted real estate agencies committed to excellence and outstanding service
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-6 shadow-xl">
                <p className="text-slate-700 font-semibold text-lg">Loading agencies...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-md mx-auto border border-red-200/50">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-semibold mb-6">Failed to load agencies. Please try again later.</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-3 rounded-xl font-semibold"
                >
                  Retry Loading
                </Button>
              </div>
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-6">No agencies available at the moment.</p>
                <Link 
                  to="/" 
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-3 rounded-xl font-semibold"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="text-center mb-12">
                <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-white/20 inline-block">
                  <p className="text-slate-700 font-medium">
                    <span className="font-bold text-2xl text-blue-600">{agencies.length}</span>
                    <span className="ml-2">Trusted Partner Agencies</span>
                  </p>
                </div>
              </div>

              {/* Agencies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {agencies.map((agency, index) => (
                  <Link
                    to={`/agency/${agency._id}`}
                    key={agency._id}
                    className="group relative block"
                  >
                    <div className="relative bg-white/90 backdrop-blur-lg p-6 sm:p-8 border border-white/20 rounded-2xl hover:bg-white/95 transition-all duration-500 flex flex-col items-center shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2">
                      {/* Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Premium Badge */}
                      {agency.isPremium && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Premium
                          </div>
                        </div>
                      )}

                      {/* Logo */}
                      <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg p-3 flex items-center justify-center">
                          <img
                            src={agency.logoUrl || "/default-agency-logo.png"}
                            alt={agency.name}
                            className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src = "/default-agency-logo.png";
                            }}
                          />
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>
                      </div>

                      {/* Agency Name */}
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-3 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                        {agency.name}
                      </h2>

                      {/* Stats */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
                          <Building className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {agency.listingsCount} Listing{agency.listingsCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            {agency.agents?.length || 0} Agent{agency.agents?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="w-full text-center">
                        <p className="text-sm text-slate-600 mb-4 font-medium">
                          {agency.user?.firstName} {agency.user?.lastName}
                        </p>
                        
                        {/* View Button */}
                        <div className="w-full py-3 px-6 bg-gradient-to-b from-gray-900 to-gray-950 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                       
                          View Agency
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAgenciesPage;