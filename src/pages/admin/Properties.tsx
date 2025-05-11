
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Home, Check, X, Star, Eye, Edit } from "lucide-react";

interface Property {
  _id: string;
  title: string;
  type: string;
  price: number;
  address: {
    city: string;
    country: string;
  };
  category: string;
  status: string;
  featured: boolean;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [toast]);

  const handlePropertyStatus = (property: Property) => {
    setSelectedProperty(property);
    setApproveDialogOpen(true);
  };

  const updatePropertyStatus = async (status: string) => {
    if (!selectedProperty) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/${selectedProperty._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update property status");
      }

      toast({
        title: "Status updated",
        description: `Property status changed to ${status}`,
      });

      // Refresh the properties list
      fetchProperties();
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    } finally {
      setApproveDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  const toggleFeatured = async (property: Property) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/${property._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ featured: !property.featured }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      toast({
        title: property.featured ? "Removed from featured" : "Added to featured",
        description: property.featured
          ? "Property is no longer featured"
          : "Property is now featured",
      });

      // Refresh the properties list
      fetchProperties();
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "sold":
        return <Badge className="bg-blue-500">Sold</Badge>;
      case "rented":
        return <Badge className="bg-purple-500">Rented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "for-sale":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">For Sale</Badge>;
      case "for-rent":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">For Rent</Badge>;
      case "offices":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Offices</Badge>;
      case "office-rent":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">Office Rent</Badge>;
      case "land":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Land</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter ? property.category === categoryFilter : true;
    const matchesStatus = statusFilter ? property.status === statusFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="for-sale">For Sale</SelectItem>
                  <SelectItem value="for-rent">For Rent</SelectItem>
                  <SelectItem value="offices">Offices</SelectItem>
                  <SelectItem value="office-rent">Office Rent</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all properties in the system.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Listed By</TableHead>
                  <TableHead>Listed On</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm || categoryFilter || statusFilter
                        ? "No properties match your filters"
                        : "No properties found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property._id}>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>{getCategoryBadge(property.category)}</TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell>{formatPrice(property.price)}</TableCell>
                      <TableCell>{property.address.city}</TableCell>
                      <TableCell>
                        {property.owner?.firstName} {property.owner?.lastName}
                      </TableCell>
                      <TableCell>{formatDate(property.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Checkbox
                            checked={property.featured}
                            onCheckedChange={() => toggleFeatured(property)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Property"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit Property"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={property.status === "pending" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePropertyStatus(property)}
                          title="Change Status"
                          className={property.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                        >
                          {property.status === "pending" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Approve/Change Status Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Property Status</DialogTitle>
            <DialogDescription>
              Change the status for "{selectedProperty?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => updatePropertyStatus("active")}
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => updatePropertyStatus("pending")}
              >
                Set as Pending
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={() => updatePropertyStatus("sold")}
              >
                Mark as Sold
              </Button>
              <Button
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                onClick={() => updatePropertyStatus("rented")}
              >
                Mark as Rented
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Properties;
