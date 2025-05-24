import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AgentLinkRequestForm = ({ agent, onRequestSent }) => {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

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

    if (agent?.linkingRequests?.length > 0) {
      const pending = agent.linkingRequests.find(req => req.status === "pending");
      setPendingRequest(pending || null);
      if (pending) {
        setSelectedAgency(pending.agency._id);
      }
    }
  }, [agent, toast]);

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

      onRequestSent();
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
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Request to Link with Agency</h3>
      {pendingRequest ? (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="font-medium">Pending request to {pendingRequest.agency?.name}</p>
          <p className="text-sm text-yellow-600">Awaiting agency approval</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="agency" className="block text-sm font-medium text-gray-700">
              Select Agency
            </label>
            <Select onValueChange={setSelectedAgency} value={selectedAgency}>
              <SelectTrigger id="agency">
                <SelectValue placeholder="Choose an agency" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((agency) => (
                  <SelectItem key={agency._id} value={agency._id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !selectedAgency}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Link Request"
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AgentLinkRequestForm;