import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgentLinkRequests = ({ user }) => {
  const [agencyId, setAgencyId] = useState("");
  const [linkRequests, setLinkRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLinkRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents?user=${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const data = await response.json();
        setLinkRequests(data.data[0]?.linkingRequests || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load link requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkRequests();
  }, [user, toast]);

  const handleRequestLink = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${user._id}/link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agencyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request agency link");
      }

      const data = await response.json();
      setLinkRequests(data.data.linkingRequests);
      setAgencyId("");
      toast({
        title: "Success",
        description: "Agency link request submitted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to request agency link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Agency Link Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestLink} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="agencyId">Agency ID</Label>
            <Input
              id="agencyId"
              value={agencyId}
              onChange={(e) => setAgencyId(e.target.value)}
              placeholder="Enter agency ID"
            />
          </div>
          <Button type="submit">Request Link</Button>
        </form>
        {linkRequests.length === 0 ? (
          <p className="text-gray-500">No pending link requests.</p>
        ) : (
          <div className="space-y-4">
            {linkRequests.map((request) => (
              <div key={request._id} className="border p-4 rounded-lg">
                <p><strong>Agency:</strong> {request.agency?.name || 'Unknown'}</p>
                <p><strong>Status:</strong> {request.status}</p>
                {request.status === 'pending' && (
                  <p className="text-yellow-600">
                    Waiting for agency approval. Ensure the agency is approved before linking.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentLinkRequests;