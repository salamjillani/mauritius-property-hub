import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserCheck, Users, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/agents`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch agents');
        
        const data = await response.json();
        setAgents(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load agents',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-green-200 mx-auto"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading agents...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}

     

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">All Agents</h2>
            <p className="text-gray-600 text-sm mt-1">Complete list of registered agents</p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-4">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Agency</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent, index) => (
                  <TableRow 
                    key={agent._id} 
                    className={`hover:bg-gray-50/80 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(agent.user?.firstName, agent.user?.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {agent.user?.firstName} {agent.user?.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-gray-700">{agent.user?.email}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(agent.approvalStatus)}`}>
                          {getStatusIcon(agent.approvalStatus)}
                          <span className="ml-1 capitalize">{agent.approvalStatus}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        {agent.agency?.name ? (
                          <>
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{agent.agency.name}</span>
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Independent
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-gray-600">{new Date(agent.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No agents found</p>
              <p className="text-gray-400 text-sm">Agents will appear here once they register</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Agents;