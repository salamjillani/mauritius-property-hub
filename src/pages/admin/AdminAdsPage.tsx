import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { uploadAdvertisementToCloudinary } from '@/utils/cloudinaryService';
import { 
  MoreVertical, 
  Check, 
  X, 
  Shield, 
  Eye, 
  ExternalLink, 
  User, 
  Calendar, 
  Filter,
  Plus,
  Upload,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Trash2
} from 'lucide-react';

const AdminAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }
      
      const data = await response.json();
      setAds(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      throw new Error('Title is required');
    }
    if (!url.trim()) {
      throw new Error('URL is required');
    }
    if (!image) {
      throw new Error('Please select an image');
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new Error('Please enter a valid URL');
    }
    
    // Validate image file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (image.size > maxSize) {
      throw new Error('Image file size must be less than 5MB');
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setUploadProgress('Validating form...');
    
    try {
      validateForm();
      
      setUploadProgress('Uploading image...');
      console.log('Starting image upload for advertisement');
      
      const { url: imageUrl } = await uploadAdvertisementToCloudinary(image, 'advertisements');
      console.log('Image uploaded successfully:', imageUrl);
      
      setUploadProgress('Creating advertisement...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          title, 
          url, 
          imageUrl,
          status: 'approved'  // Admin ads are automatically approved
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create advertisement');
      }
      
      const result = await response.json();
      console.log('Advertisement created successfully:', result);
      
      // Reset form
      setTitle('');
      setUrl('');
      setImage(null);
      setShowCreateForm(false);
      
      // Refresh ads list
      fetchAds();
      
      toast({
        title: 'Success',
        description: 'Advertisement created and published successfully',
      });
      
    } catch (error) {
      console.error('Error creating advertisement:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Authentication required')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message.includes('Failed to get upload signature')) {
        errorMessage = 'Unable to get upload authorization. Please try again.';
      } else if (error.message.includes('Image upload failed')) {
        errorMessage = 'Image upload failed. Please check your internet connection and try again.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
      setUploadProgress('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type immediately
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
          variant: 'destructive'
        });
        e.target.value = '';
        return;
      }
      
      // Check file size
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Image file size must be less than 5MB',
          variant: 'destructive'
        });
        e.target.value = '';
        return;
      }
      
      setImage(file);
    }
  };

  const updateAdStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      toast({
        title: 'Success',
        description: `Advertisement ${status}`,
      });
      
      setAds(ads.map(ad => 
        ad._id === id ? { ...ad, status } : ad
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete advertisement');
      }
      
      toast({
        title: 'Success',
        description: 'Advertisement deleted successfully',
      });
      
      setAds(ads.filter(ad => ad._id !== id));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusStats = () => {
    const pending = ads.filter(ad => ad.status === 'pending').length;
    const approved = ads.filter(ad => ad.status === 'approved').length;
    
    return { pending, approved };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-gray-600">Loading advertisements...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Advertisement Management
                </h1>
                <p className="text-gray-600">Create and manage advertisements</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Advertisement'}
            </Button>
          </div>

          {/* Stats Cards - Removed Rejected Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-yellow-100/50 border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-100/50 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Advertisement Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Create New Advertisement</h2>
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleCreateAd} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Advertisement Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title for your advertisement"
                    required
                    maxLength={100}
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Make it catchy and memorable</p>
                    <p className={`text-sm font-medium ${title.length > 80 ? 'text-red-500' : 'text-gray-500'}`}>
                      {title.length}/100
                    </p>
                  </div>
                </div>

                {/* URL Field */}
                <div className="space-y-3">
                  <Label htmlFor="url" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Destination URL
                  </Label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      required
                      className="h-12 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl pl-12 pr-4"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Where users will be directed when they click your ad</p>
                </div>

                {/* Image Upload Field */}
                <div className="space-y-3">
                  <Label htmlFor="image" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Advertisement Image
                  </Label>
                  
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                      {!image ? (
                        <div className="space-y-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                            <Upload className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-700 mb-2">Choose your advertisement image</p>
                            <p className="text-sm text-gray-500">JPEG, PNG, GIF, or WebP • Max 5MB</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                            <ImageIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-lg font-medium text-green-700">Image ready for upload</p>
                        </div>
                      )}
                      
                      <Input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {image && (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <div className="flex items-center gap-4">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt="Preview" 
                          className="w-24 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 truncate">{image.name}</p>
                          <p className="text-sm text-gray-600">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800">Processing...</p>
                        <p className="text-blue-700 text-sm">{uploadProgress}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isCreating || !title || !url || !image}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Create & Publish Advertisement
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 h-12 border-2 border-gray-200 hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-800">All Advertisements</h2>
              </div>
              <div className="text-sm text-gray-500">
                {ads.length} total advertisements
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-4">Title</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Destination</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Preview</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Advertiser</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{ad.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <a 
                        href={ad.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="max-w-xs truncate">{ad.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="relative group">
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="w-20 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(ad.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {ad.user?.firstName || 'Admin'} {ad.user?.lastName || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-9 w-9 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {ad.status !== 'approved' && (
                            <DropdownMenuItem 
                              onClick={() => updateAdStatus(ad._id, 'approved')}
                              className="flex items-center gap-2 cursor-pointer hover:bg-green-50 text-green-700"
                            >
                              <Check className="h-4 w-4" /> 
                              Approve Advertisement
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteAd(ad._id)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-700"
                          >
                            <Trash2 className="h-4 w-4" /> 
                            Delete Advertisement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {ads.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
              <p className="text-gray-500">
                Click "Create Advertisement" to add your first advertisement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAdsPage;