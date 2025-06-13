import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
          status: filterStatus !== 'all' ? filterStatus : '',
          sort: sortBy,
          search: searchQuery,
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties?${queryParams}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch properties');
        
        const data = await response.json();
        setProperties(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load properties',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast, filterStatus, sortBy, searchQuery]);

  const handleStatusChange = async (propertyId, status) => {
    try {
      const token = localStorage.getItem('token');
      let response;

      if (status === 'approved') {
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}/approve`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (status === 'rejected') {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}/reject`,
          {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason }),
          }
        );
      } else {
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}`,
          {
            method: 'PUT',
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status }),
          }
        );
      }

      if (!response.ok) throw new Error('Failed to update property status');
      
      const data = await response.json();
      setProperties(properties.map(p => 
        p._id === propertyId ? { ...p, ...data.data } : p
      ));
      
      toast({ title: 'Success', description: `Property status updated` });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update property',
        variant: 'destructive',
      });
    }
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, rejected: 0, active: 0, inactive: 0 };
    properties.forEach(p => counts[p.status]++);
    return counts;
  };

  const StatusChart = () => {
    const counts = getStatusCounts();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return <p className="text-gray-500 text-center py-4">No data</p>;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold ${
              status === 'pending' ? 'bg-yellow-500' :
              status === 'approved' ? 'bg-green-500' :
              status === 'rejected' ? 'bg-red-500' :
              status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
            }`}>
              {count}
            </div>
            <p className="text-sm mt-2 capitalize">{status}</p>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Properties</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="-createdAt">Oldest</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="-title">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {properties.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No properties found</p>
          ) : (
            properties.map((property) => (
              <Card key={property._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{property.title}</span>
                    <div className="flex items-center gap-2">
        {property.isGoldCard && (
  <span className="text-sm bg-amber-200 text-amber-800 px-2 py-1 rounded mr-2">
    Gold Card
  </span>
)}
                      <span className={`text-sm capitalize px-2 py-1 rounded ${
                        property.status === 'approved' ? 'bg-green-100 text-green-800' :
                        property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        property.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                  <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                    <span>
                      {property.address?.city}, {property.address?.country}
                    </span>
                    <Calendar size={14} />
                    <span>
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Owner: {property.owner?.firstName} {property.owner?.lastName}
                  </p>
                  {property.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejection Reason: {property.rejectionReason}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Select
                      value={property.status}
                      onValueChange={(value) => handleStatusChange(property._id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link to={`/properties/${property.category}/${property._id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `mailto:${property.owner?.email}`}
                      className="flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Contact Owner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProperties;