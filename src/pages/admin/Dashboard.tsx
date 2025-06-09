import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Home, DollarSign, Clock, Star, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  // Initialize state with all required fields
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalSubscriptions: 0,
    pendingRequests: 0,
    goldCardsUsed: 0,
    recentActivity: [] as any[],
    propertyStatusCounts: {
      pending: 0,
      approved: 0,
      rejected: 0,
      inactive: 0,
      active: 0,
    },
    userRoleCounts: {
      individual: 0,
      agent: 0,
      agency: 0,
      promoter: 0,
      admin: 0,
      subAdmin: 0,
    },
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };
    initializeUser();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/dashboard`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      console.log('Dashboard API Response:', data); // Debug log
      
      // Handle the API response properly
      const apiData = data.data || data;
      
      // Update stats with proper handling of nested objects
      setStats({
        totalUsers: apiData.totalUsers || 0,
        totalProperties: apiData.totalProperties || 0,
        totalSubscriptions: apiData.totalSubscriptions || 0,
        pendingRequests: apiData.pendingRequests || 0,
        goldCardsUsed: apiData.goldCardsUsed || 0,
        recentActivity: apiData.recentActivity || [],
        propertyStatusCounts: {
          pending: apiData.propertyStatusCounts?.pending || 0,
          approved: apiData.propertyStatusCounts?.approved || 0,
          rejected: apiData.propertyStatusCounts?.rejected || 0,
          inactive: apiData.propertyStatusCounts?.inactive || 0,
          active: apiData.propertyStatusCounts?.active || 0,
        },
        userRoleCounts: {
          individual: apiData.userRoleCounts?.individual || 0,
          agent: apiData.userRoleCounts?.agent || 0,
          agency: apiData.userRoleCounts?.agency || 0,
          promoter: apiData.userRoleCounts?.promoter || 0,
          admin: apiData.userRoleCounts?.admin || 0,
          subAdmin: apiData.userRoleCounts?.subAdmin || 0,
        }
      });
    } catch (error: any) {
      console.error('Dashboard fetch error:', error); // Debug log
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
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

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
        </div>

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
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm">Pending: {stats.propertyStatusCounts.pending}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">Approved: {stats.propertyStatusCounts.approved}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">Rejected: {stats.propertyStatusCounts.rejected}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm">Active: {stats.propertyStatusCounts.active}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-500"></div>
                        <span className="text-sm">Inactive: {stats.propertyStatusCounts.inactive}</span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm">Individual: {stats.userRoleCounts.individual}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">Agent: {stats.userRoleCounts.agent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm">Agency: {stats.userRoleCounts.agency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="text-sm">Promoter: {stats.userRoleCounts.promoter}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">Admin: {stats.userRoleCounts.admin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm">Sub-Admin: {stats.userRoleCounts.subAdmin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
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
                        added a new property: {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                      <p className={`text-sm capitalize ${
                        activity.status === 'approved' ? 'text-green-600' :
                        activity.status === 'rejected' ? 'text-red-600' :
                        activity.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        Status: {activity.status}
                      </p>
                    </div>
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