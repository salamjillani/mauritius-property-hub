import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const AgentLinkRequestForm = ({ agent }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("");

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies`);
        if (!response.ok) throw new Error("Failed to fetch agencies");
        const data = await response.json();
        setAgencies(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agencies",
          variant: "destructive",
        });
      }
    };

    fetchAgencies();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgency) {
      toast({
        title: "Error",
        description: "Please select an agency",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/request-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agencyId: selectedAgency }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send link request");
      }

      toast({
        title: "Success",
        description: "Link request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send link request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4">Request to Link with Agency</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agency">Select Agency</Label>
          <select
            id="agency"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            className="w-full border border-gray-200 rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
          >
            <option value="">Select an agency</option>
            {agencies.map((agency) => (
              <option key={agency._id} value={agency._id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Sending Request...</span>
            </div>
          ) : (
            "Send Link Request"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AgentLinkRequestForm;