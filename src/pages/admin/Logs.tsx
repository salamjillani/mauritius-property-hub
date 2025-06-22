import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  FileText, 
  User, 
  Calendar, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Filter,
  Search
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Logs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Fix: Check both sessionStorage and localStorage like in Dashboard
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/logs`, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized access. Please login again.");
          }
          if (response.status === 403) {
            throw new Error("Access forbidden. Admin privileges required.");
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Fix: Access logs from data.data (based on your controller response structure)
        setLogs(data.data || []);
        setError(null); // Clear any previous errors
      } catch (error: any) {
        console.error('Fetch logs error:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message || "Failed to load logs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [toast]);

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Info className="h-4 w-4 text-blue-600" />;
    }
    return <Activity className="h-4 w-4 text-slate-600" />;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'from-green-50 to-emerald-50 border-green-200';
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'from-red-50 to-pink-50 border-red-200';
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'from-blue-50 to-cyan-50 border-blue-200';
    }
    return 'from-slate-50 to-gray-50 border-slate-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-300"></div>
            </div>
            <p className="text-slate-600 font-medium">Loading system logs...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                System Logs
              </h1>
              <p className="text-slate-600 mt-1">Monitor system activities and user actions</p>
            </div>
          </div>
          
          {logs.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Activity className="h-4 w-4" />
                <span>{logs.length} log entr{logs.length !== 1 ? 'ies' : 'y'}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Clock className="h-4 w-4" />
                <span>Real-time monitoring</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Logs</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs Content */}
        <div className="space-y-4 lg:space-y-6">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 lg:py-24">
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-6">
                <FileText className="h-16 w-16 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {error ? "Unable to load logs" : "No logs available"}
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                {error 
                  ? "There was an issue loading the system logs. Please try refreshing the page." 
                  : "System logs will appear here as activities occur throughout the platform."
                }
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <Card 
                key={log._id} 
                className={`overflow-hidden bg-gradient-to-r ${getActionColor(log.action)} backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{log.action}</h3>
                        <p className="text-sm text-slate-600 font-normal mt-1">
                          Resource: {log.resource}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white/50 rounded-lg px-3 py-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {log.resourceId && (
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                          <Search className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-slate-500">Resource ID</p>
                            <p className="font-medium text-slate-900 break-all">{log.resourceId}</p>
                          </div>
                        </div>
                      )}
                      
                      {log.details && (
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                          <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-slate-500">Details</p>
                            <p className="font-medium text-slate-900 break-words">{log.details}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                      <User className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-500">Performed by</p>
                        <div className="mt-1">
                          <p className="font-medium text-slate-900">
                            {log.user?.firstName} {log.user?.lastName}
                          </p>
                          <p className="text-sm text-slate-600 break-all">
                            {log.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
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