import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";

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
  const { data: agencies = [], isLoading, error } = useQuery<Agency[]>({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies?approvalStatus=approved`);
      if (!response.ok) throw new Error("Failed to fetch agencies");
      const data = await response.json();
      return data.data || [];
    },
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[#374163]">Our Partner Agencies</h1>
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#374163] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agencies...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>Failed to load agencies. Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#374163] text-white hover:bg-[#4c5985]"
          >
            Retry
          </Button>
        </div>
      ) : agencies.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No agencies available at the moment.</p>
          <Link to="/" className="mt-4 inline-block text-[#374163] hover:underline">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <Link
              to={`/agency/${agency._id}`}
              key={agency._id}
              className="p-6 border border-[#4c5985] rounded-lg hover:bg-[#4c5985]/10 transition duration-200 flex flex-col items-center"
            >
              <img
                src={agency.logoUrl || "/default-agency-logo.png"}
                alt={agency.name}
                className="h-16 w-auto object-contain mb-4"
                onError={(e) => {
                  e.currentTarget.src = "/default-agency-logo.png";
                }}
              />
              <h2 className="text-xl font-semibold text-[#374163] text-center">
                {agency.name}
              </h2>
              {agency.isPremium && (
                <span className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Premium
                </span>
              )}
              <p className="mt-2 text-sm text-gray-600">
                {agency.listingsCount} Listing{agency.listingsCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAgenciesPage;