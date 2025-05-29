import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Home, DollarSign, Clock, Star, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Interfaces for type safety
interface Activity {
  _id: string;
  title: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  category: string;
}

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalSubscriptions: number;
  pendingRequests: number;
  goldCardsUsed: number;
  recentActivity: Activity[];
  propertyStatusCounts?: {
    pending: number;
    approved: number;
    rejected: number;
    inactive: number;
  };
  userRoleCounts?: {
    individual: number;
    agent: number;
    agency: number;
    promoter: number;
    admin: number;
    subAdmin: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalSubscriptions: 0,
    pendingRequests: 0,
    goldCardsUsed: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const { toast } = useToast();

  // Initialize user data from session storage or API
  useEffect(() => {
    // Replace localStorage with sessionStorage or API call
    const initializeUser = async () => {
      try {
        // You can replace this with an API call to get current user
        const userData = sessionStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };
    
    initializeUser();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = sessionStorage.getItem('token'); // Changed from localStorage
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();

      // Fetch additional data for charts
      const [propertiesResponse, usersResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!propertiesResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const propertiesData = await propertiesResponse.json();
      const usersData = await usersResponse.json();

      const propertyStatusCounts = propertiesData.data.reduce(
        (acc: { [key: string]: number }, property: { status: string }) => {
          acc[property.status] = (acc[property.status] || 0) + 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0, inactive: 0 }
      );

      const userRoleCounts = usersData.data.reduce(
        (acc: { [key: string]: number }, user: { role: string }) => {
          const roleKey = user.role === 'sub-admin' ? 'subAdmin' : user.role;
          acc[roleKey] = (acc[roleKey] || 0) + 1;
          return acc;
        },
        { individual: 0, agent: 0, agency: 0, promoter: 0, admin: 0, subAdmin: 0 }
      );

      setStats({
        ...data.data,
        propertyStatusCounts,
        userRoleCounts,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prepare chart data
  const propertyChartData = [
    { name: 'Pending', value: stats.propertyStatusCounts?.pending || 0, color: '#eab308' },
    { name: 'Approved', value: stats.propertyStatusCounts?.approved || 0, color: '#10b981' },
    { name: 'Rejected', value: stats.propertyStatusCounts?.rejected || 0, color: '#ef4444' },
    { name: 'Inactive', value: stats.propertyStatusCounts?.inactive || 0, color: '#6b7280' },
  ];

  const userRoleChartData = [
    { name: 'Individual', value: stats.userRoleCounts?.individual || 0 },
    { name: 'Agent', value: stats.userRoleCounts?.agent || 0 },
    { name: 'Agency', value: stats.userRoleCounts?.agency || 0 },
    { name: 'Promoter', value: stats.userRoleCounts?.promoter || 0 },
    { name: 'Admin', value: stats.userRoleCounts?.admin || 0 },
    { name: 'Sub-Admin', value: stats.userRoleCounts?.subAdmin || 0 },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Skeleton className="h-10 w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-8 w-1/4 mt-8 mb-4" />
          <div className="bg-white rounded-lg shadow p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-500" /> Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalProperties}</p>
            </CardContent>
          </Card>
          {currentUser?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" /> Total Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" /> Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" /> Gold Cards Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.goldCardsUsed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Property Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-4">
                      {propertyChartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-4">
                      {userRoleChartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-blue-500"></div>
                          <span className="text-sm">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity available.</p>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity._id}
                    className="border-b py-3 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        <span className="font-bold">
                          {activity.owner?.firstName} {activity.owner?.lastName}
                        </span>{' '}
                        added a{' '}
                        <Link
                          to={`/admin/properties/${activity._id}`}
                          className="text-blue-600 hover:underline"
                          aria-label={`View property ${activity.title}`}
                        >
                          {activity.title}
                        </Link>{' '}
                        ({activity.category})
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                      <p
                        className={`text-sm capitalize ${
                          activity.status === 'approved'
                            ? 'text-green-600'
                            : activity.status === 'rejected'
                            ? 'text-red-600'
                            : activity.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        Status: {activity.status}
                      </p>
                    </div>
                    <Link
                      to={`/admin/properties/${activity._id}`}
                      className="text-sm text-blue-600 hover:underline"
                      aria-label={`View details of property ${activity.title}`}
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;