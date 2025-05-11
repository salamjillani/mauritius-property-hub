
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Building, 
  User, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    agents: 0,
    agencies: 0,
    properties: 0,
    activeListings: 0,
    pendingListings: 0,
    featuredListings: 0,
    totalViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // We could fetch actual stats from an API endpoint, but for now using mock data
        // In a real app, you'd make an API call like:
        // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // const data = await response.json();
        // setStats(data);
        
        // Mock data for demonstration
        setStats({
          users: 128,
          agents: 42,
          agencies: 15,
          properties: 234,
          activeListings: 187,
          pendingListings: 47,
          featuredListings: 24,
          totalViews: 4521,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users}
            description="All registered users"
            icon={<User size={20} />}
          />
          <StatCard
            title="Agents"
            value={stats.agents}
            description="Registered real estate agents"
            icon={<Users size={20} />}
          />
          <StatCard
            title="Agencies"
            value={stats.agencies}
            description="Registered real estate agencies"
            icon={<Building size={20} />}
          />
          <StatCard
            title="Total Properties"
            value={stats.properties}
            description="Total number of listings"
            icon={<Home size={20} />}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Listings"
            value={stats.activeListings}
            description="Currently active property listings"
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Pending Listings"
            value={stats.pendingListings}
            description="Listings awaiting approval"
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Featured Listings"
            value={stats.featuredListings}
            description="Premium featured properties"
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            description="Last 30 days"
            icon={<Calendar size={20} />}
          />
        </div>
        
        {/* In a real app, you'd add charts, recent activity, etc. */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No recent activity to display</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Key metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">System running normally</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
