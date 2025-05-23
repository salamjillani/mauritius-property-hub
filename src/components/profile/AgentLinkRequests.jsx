import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AgentLinkRequests = ({ user }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/linking-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch linking requests");
        const data = await response.json();
        setRequests(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load linking requests",
          variant: "destructive",
        });
      }
    };

    if (user?.role === "agency") {
      fetchRequests();
    }
  }, [user, toast]);

  const handleApprove = async (agentId, requestId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${agentId}/approve/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve request");
      }

      toast({
        title: "Success",
        description: "Agent link request approved successfully",
      });

      // Refresh the requests list
      const updatedResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/linking-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setRequests(updatedData.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (agentId, requestId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${agentId}/reject/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject request");
      }

      toast({
        title: "Success",
        description: "Agent link request rejected successfully",
      });

      // Refresh the requests list
      const updatedResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/linking-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setRequests(updatedData.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== "agency") {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Agent Link Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending link requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((agent) => (
            <div
              key={agent._id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {agent.user?.firstName} {agent.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{agent.user?.email}</p>
                {agent.linkingRequests.map((req) => (
                  <p key={req._id} className="text-sm text-gray-600">
                    Requested on: {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(agent._id, agent.linkingRequests[0]._id)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
                <Button
                  onClick={() => handleReject(agent._id, agent.linkingRequests[0]._id)}
                  disabled={isLoading}
                  variant="destructive"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentLinkRequests;