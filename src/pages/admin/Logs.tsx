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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log('Fetching logs from:', `${import.meta.env.VITE_API_URL}/api/admin/logs`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch logs`);
        }

        const data = await response.json();
        console.log('Logs data received:', data);
        
        if (data.success && data.data) {
          setLogs(data.data);
        } else {
          console.warn('Unexpected response format:', data);
          setLogs([]);
        }
      } catch (error) {
        console.error('Fetch logs error:', error);
        setError(error.message);
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-4">
          {logs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center">
                  {error ? "Could not load logs due to an error." : "No logs available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{log.action}</span>
                    <span className="text-sm text-gray-500 font-normal">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Resource:</strong> {log.resource}</p>
                    {log.resourceId && (
                      <p><strong>Resource ID:</strong> {log.resourceId}</p>
                    )}
                    {log.details && (
                      <p><strong>Details:</strong> {log.details}</p>
                    )}
                    <p><strong>User:</strong> {log.user?.firstName} {log.user?.lastName} ({log.user?.email || "N/A"})</p>
                  </div>
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