import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Building2, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const Agencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/agencies`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch agencies');
        
        const data = await response.json();
        setAgencies(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load agencies',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencies();
  }, [toast]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-200 mx-auto"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading agencies...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">


        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">All Agencies</h2>
            <p className="text-gray-600 text-sm mt-1">Complete list of registered agencies</p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-4">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency, index) => (
                  <TableRow 
                    key={agency._id} 
                    className={`hover:bg-gray-50/80 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{agency.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-gray-700">{agency.user?.email}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(agency.approvalStatus)}`}>
                          {getStatusIcon(agency.approvalStatus)}
                          <span className="ml-1 capitalize">{agency.approvalStatus}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-gray-600">{new Date(agency.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {agencies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No agencies found</p>
              <p className="text-gray-400 text-sm">Agencies will appear here once they register</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Agencies;