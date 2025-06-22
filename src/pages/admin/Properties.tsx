import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Calendar, Search, Filter, SortAsc, Eye, Crown, MapPin, User, AlertCircle } from 'lucide-react';
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

  const getStatusConfig = (status) => {
    const configs = {
      approved: { 
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: '✓'
      },
      rejected: { 
        bg: 'bg-gradient-to-r from-red-50 to-rose-50', 
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: '✕'
      },
      pending: { 
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        icon: '⏳'
      },
      active: { 
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: '🟢'
      },
      inactive: { 
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50', 
        text: 'text-gray-600', 
        border: 'border-gray-200',
        icon: '⚫'
      }
    };
    return configs[status] || configs.inactive;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-indigo-400 opacity-20 mx-auto"></div>
            </div>
            <p className="text-lg font-medium text-slate-600">Loading properties...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#171F2E]">
  Property Management
</h1>
                <p className="text-slate-600 mt-2">Manage and oversee all property listings</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">{properties.length} Properties</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4  group-focus-within:text-indigo-800 transition-colors" />
                  <Input
                    placeholder="Search properties by title, location, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 bg-white/70 rounded-xl transition-all duration-200"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative group">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full lg:w-48 h-12 border-slate-200 focus:border-indigo-300 bg-white/70 backdrop-blur-sm rounded-xl transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Filter by Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200 rounded-xl shadow-xl">
                      <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                      <SelectItem value="pending" className="rounded-lg">⏳ Pending</SelectItem>
                      <SelectItem value="approved" className="rounded-lg">✅ Approved</SelectItem>
                      <SelectItem value="rejected" className="rounded-lg">❌ Rejected</SelectItem>
                      <SelectItem value="active" className="rounded-lg">🟢 Active</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">⚫ Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="relative group">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48 h-12 border-slate-200 focus:border-indigo-300 bg-white/70 backdrop-blur-sm rounded-xl transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Sort By" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200 rounded-xl shadow-xl">
                      <SelectItem value="createdAt" className="rounded-lg">🕐 Newest First</SelectItem>
                      <SelectItem value="-createdAt" className="rounded-lg">🕐 Oldest First</SelectItem>
                      <SelectItem value="title" className="rounded-lg">🔤 Title A-Z</SelectItem>
                      <SelectItem value="-title" className="rounded-lg">🔤 Title Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="space-y-6">
            {properties.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-slate-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Search className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700">No Properties Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      No properties match your current search criteria. Try adjusting your filters or search terms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              properties.map((property) => {
                const statusConfig = getStatusConfig(property.status);
                return (
                  <Card key={property._id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {property.isGoldCard && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full">
                              <Crown className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-semibold text-amber-700">Gold Card</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <span className="text-sm">{statusConfig.icon}</span>
                            <span className="text-sm font-semibold capitalize">{property.status}</span>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Description */}
                      <p className="text-slate-600 leading-relaxed line-clamp-2 text-sm sm:text-base">
                        {property.description}
                      </p>

                      {/* Property Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-100">
                          <MapPin className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {property.address?.city}, {property.address?.country}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700">
                              {new Date(property.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 sm:col-span-2 lg:col-span-1">
                          <User className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {property.owner?.firstName} {property.owner?.lastName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {property.rejectionReason && (
                        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                              <p className="text-sm text-red-600 leading-relaxed">{property.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                        <Select
                          value={property.status}
                          onValueChange={(value) => handleStatusChange(property._id, value)}
                        >
                          <SelectTrigger className="w-full sm:w-48 h-11 border-slate-200 focus:border-indigo-300 bg-white rounded-xl transition-all duration-200">
                            <div className="flex items-center gap-2">
                              <SelectValue placeholder="Change Status" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200 rounded-xl shadow-xl">
                            <SelectItem value="pending" className="rounded-lg">⏳ Pending</SelectItem>
                            <SelectItem value="approved" className="rounded-lg">✅ Approved</SelectItem>
                            <SelectItem value="rejected" className="rounded-lg">❌ Rejected</SelectItem>
                            <SelectItem value="active" className="rounded-lg">🟢 Active</SelectItem>
                            <SelectItem value="inactive" className="rounded-lg">⚫ Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-3 flex-1">
                          <Link to={`/properties/${property.category}/${property._id}`} className="flex-1">
                            <Button variant="outline" className="w-full h-11 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl transition-all duration-200 group">
                              <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              View Details
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = `mailto:${property.owner?.email}`}
                            className="flex-1 h-11 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200 group"
                          >
                            <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Contact Owner</span>
                            <span className="sm:hidden">Contact</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProperties;