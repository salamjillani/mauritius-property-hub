// src/components/PropertyImageUpload.jsx
import { useState } from 'react';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { uploadMultipleImages } from '@/utils/cloudinaryService';

const PropertyImageUpload = ({ onImagesUploaded }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files (only images, size limit)
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a valid image or exceeds 5MB`,
          variant: "destructive"
        });
      }
      return isValid;
    });

    // Create previews for valid files
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove a file from selection
  const removeFile = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index].preview);
    
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to Cloudinary
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to upload",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload all images to Cloudinary
      const uploadedImages = await uploadMultipleImages(files);
      
      // Pass uploaded images back to parent component
      onImagesUploaded(uploadedImages);
      
      // Clear selection after successful upload
      setPreviews([]);
      setFiles([]);
      
      toast({
        title: "Upload successful",
        description: `${uploadedImages.length} images uploaded successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Property Images</h3>
        <Button
          variant="outline"
          onClick={handleUpload}
          disabled={loading || files.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </>
          )}
        </Button>
      </div>

      {/* File input wrapped in a custom button */}
      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer"
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="text-center">
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-1 text-sm text-gray-600">
            Click to select images or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WEBP up to 5MB
          </p>
          <input 
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Preview selected images */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview.preview} 
                alt={`Preview ${index}`} 
                className="h-24 w-full object-cover rounded-md" 
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 bg-blue-600 text-xs text-white px-2 py-1 rounded-tr-md">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload;