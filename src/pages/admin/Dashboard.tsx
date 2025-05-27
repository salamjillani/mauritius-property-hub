import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const [usersRes, propertiesRes, subscriptionsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!usersRes.ok || !propertiesRes.ok || !subscriptionsRes.ok) {
          throw new Error('Failed to fetch stats');
        }

        const [usersData, propertiesData, subscriptionsData] = await Promise.all([
          usersRes.json(),
          propertiesRes.json(),
          subscriptionsRes.json()
        ]);

        setStats({
          totalUsers: usersData.data.length,
          totalListings: propertiesData.count,
          totalSubscriptions: subscriptionsData.data.length,
          recentActivity: [] // Add logic for recent activity if needed
        });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalListings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Button onClick={() => navigate('/admin/users')}>Manage Users</Button>
          <Button onClick={() => navigate('/admin/properties')}>Manage Listings</Button>
          <Button onClick={() => navigate('/admin/subscriptions')}>Manage Subscriptions</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;