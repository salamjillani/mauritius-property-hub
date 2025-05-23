import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const AgentLinkRequestForm = ({ user }) => {
  const { toast } = useToast();
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAgencies, setIsFetchingAgencies] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies`);
        if (!response.ok) throw new Error("Failed to fetch agencies");
        const data = await response.json();
        if (data.success) setAgencies(data.data);
      } catch (error) {
        toast({ title: "Error", description: `Failed to load agencies: ${error.message}`, variant: "destructive" });
      } finally {
        setIsFetchingAgencies(false);
      }
    };

    fetchAgencies();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgency) {
      toast({ title: "Error", description: "Please select an agency", variant: "destructive" });
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
        throw new Error(errorData.error || "Failed to send link request");
      }

      toast({ title: "Success", description: "Link request sent successfully" });
      setSelectedAgency("");
    } catch (error) {
      toast({ title: "Error", description: `Failed to send link request: ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingAgencies) {
    return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Agency</label>
        <Select value={selectedAgency} onValueChange={setSelectedAgency}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an agency" />
          </SelectTrigger>
          <SelectContent>
            {agencies.map((agency) => (
              <SelectItem key={agency._id} value={agency._id}>{agency.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Request to Link"}
      </Button>
    </form>
  );
};

export default AgentLinkRequestForm;