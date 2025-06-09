import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const AdminPromoters = () => {
  const { toast } = useToast();
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoters = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/promoters?approvalStatus=pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch promoters");
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

  const handleApprove = async (promoterId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/promoters/${promoterId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to approve promoter");
      setPromoters(promoters.filter((promoter) => promoter._id !== promoterId));
      toast({
        title: "Success",
        description: "Promoter approved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve promoter",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (promoterId, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/promoters/${promoterId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) throw new Error("Failed to reject promoter");
      setPromoters(promoters.filter((promoter) => promoter._id !== promoterId));
      toast({
        title: "Success",
        description: "Promoter rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject promoter",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

    return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Promoter Requests</h1>
        {promoters.length === 0 ? (
          <p className="text-gray-500">No pending promoters available.</p>
        ) : (
          <div className="space-y-6">
            {promoters.map((promoter) => (
              <Card key={promoter._id}>
                <CardHeader>
                  <CardTitle>{promoter.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Fixed with optional chaining */}
                  <p><strong>User:</strong> {promoter.user?.firstName} {promoter.user?.lastName}</p>
                  <p><strong>Email:</strong> {promoter.user?.email}</p>
                  <p><strong>Status:</strong> {promoter.approvalStatus}</p>
                  <div className="mt-4 flex space-x-2">
                    <Button onClick={() => handleApprove(promoter._id)}>
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Please provide a reason for rejection:");
                        if (reason) handleReject(promoter._id, reason);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPromoters;