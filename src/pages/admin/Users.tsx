import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Mail, User, Shield, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/users`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!response.ok) throw new Error("Failed to fetch users");
        
        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");
      
      const data = await response.json();
      setUsers(users.map(u => u._id === userId ? data.data : u));
      toast({ title: "Success", description: "User updated" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.approvalStatus === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    const colors = {
      individual: 'from-blue-500 to-blue-600',
      agent: 'from-green-500 to-green-600',
      agency: 'from-purple-500 to-purple-600',
      promoter: 'from-orange-500 to-orange-600',
      admin: 'from-red-500 to-red-600',
      subAdmin: 'from-yellow-500 to-yellow-600'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    return icons[status] || Clock;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium">Loading users...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text ">
                Manage Users
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                View and manage all platform users
              </p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="promoter">Promoter</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="subAdmin">Sub-Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                  <Shield className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-1 border border-gray-200">
                <span className="text-sm font-medium text-gray-600">Total Users:</span>
                <span className="text-lg font-bold text-gray-900">{filteredUsers.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="space-y-6">
          {filteredUsers.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  {users.length === 0 
                    ? "No users are available in the system." 
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => {
              const StatusIcon = getStatusIcon(user.approvalStatus);
              return (
                <Card key={user._id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${getRoleColor(user.role)}`} />
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-lg`}>
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                            {user.firstName} {user.lastName}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(user.approvalStatus)}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-xs font-medium capitalize">{user.approvalStatus}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(user.role)} shadow-md`}>
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          defaultValue={user.firstName}
                          onBlur={(e) => handleUpdateUser(user._id, { firstName: e.target.value })}
                          className="bg-white/60 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          defaultValue={user.lastName}
                          onBlur={(e) => handleUpdateUser(user._id, { lastName: e.target.value })}
                          className="bg-white/60 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          defaultValue={user.email}
                          onBlur={(e) => handleUpdateUser(user._id, { email: e.target.value })}
                          className="bg-white/60 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          User Role
                        </label>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleUpdateUser(user._id, { role: value })}
                        >
                          <SelectTrigger className="bg-white/60 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm">
                            <SelectItem value="individual" className="hover:bg-blue-50">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
                                Individual
                              </div>
                            </SelectItem>
                            <SelectItem value="agent" className="hover:bg-green-50">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
                                Agent
                              </div>
                            </SelectItem>
                            <SelectItem value="agency" className="hover:bg-purple-50">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-500" />
                                Agency
                              </div>
                            </SelectItem>
                            <SelectItem value="promoter" className="hover:bg-orange-50">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
                                Promoter
                              </div>
                            </SelectItem>
                            <SelectItem value="admin" className="hover:bg-red-50">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Approval Status
                          </label>
                          <Select
                            defaultValue={user.approvalStatus}
                            onValueChange={(value) => handleUpdateUser(user._id, { approvalStatus: value })}
                          >
                            <SelectTrigger className="w-full sm:w-48 bg-white/60 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm">
                              <SelectItem value="pending" className="hover:bg-yellow-50">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-yellow-600" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="approved" className="hover:bg-green-50">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  Approved
                                </div>
                              </SelectItem>
                              <SelectItem value="rejected" className="hover:bg-red-50">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-3 w-3 text-red-600" />
                                  Rejected
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">User ID</p>
                          <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                            {user._id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;