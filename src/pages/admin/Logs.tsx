import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Logs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch logs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">System Logs</h1>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs available.</p>
          ) : (
            logs.map((log) => (
              <Card key={log._id}>
                <CardHeader>
                  <CardTitle>{log.action}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Resource: {log.resource}</p>
                  <p>Details: {log.details}</p>
                  <p>User: {log.user?.email || "N/A"}</p>
                  <p>Date: {new Date(log.createdAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Logs;