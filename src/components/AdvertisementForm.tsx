import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const AdvertisementForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    link: '',
    isActive: true
  });
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchAdvertisement = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/advertisements/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const adData = response.data.data;
          setFormData({
            title: adData.title || '',
            image: null,
            link: adData.link || '',
            isActive: adData.isActive !== undefined ? adData.isActive : true
          });
          setCurrentImageUrl(adData.image || '');
          setImagePreview(adData.image || '');
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching advertisement:', error);
          toast({ 
            title: t('error'), 
            description: error.response?.data?.message || 'Failed to load advertisement', 
            variant: 'destructive' 
          });
          setIsLoading(false);
        }
      };
      fetchAdvertisement();
    }
  }, [id, toast, t]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ 
          title: t('error'), 
          description: 'Authentication token not found. Please login again.', 
          variant: 'destructive' 
        });
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!formData.title.trim() || !formData.link.trim()) {
        toast({ 
          title: t('error'), 
          description: 'Title and link are required', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      // For new advertisements, image is required
      if (!id && !formData.image) {
        toast({ 
          title: t('error'), 
          description: 'Image is required for new advertisements', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('link', formData.link.trim());
      formDataToSend.append('isActive', formData.isActive.toString());

      // Only append image if a new file is selected
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (id) {
        response = await axios.put(`/api/advertisements/${id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast({ title: t('success'), description: t('ad_updated') || 'Advertisement updated successfully' });
      } else {
        response = await axios.post('/api/advertisements', formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast({ title: t('success'), description: t('ad_created') || 'Advertisement created successfully' });
      }

      console.log('Advertisement operation successful:', response.data);
      navigate('/admin/advertisements');
    } catch (error) {
      console.error('Error submitting advertisement:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast({ 
        title: t('error'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? t('edit_advertisement') : t('create_advertisement')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label className="block mb-2 font-medium">{t('title')} *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isSubmitting}
            placeholder="Enter advertisement title"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">{t('link')} *</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isSubmitting}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">{t('image')} {!id && '*'}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={!id}
            disabled={isSubmitting}
          />
          {id && (
            <p className="text-sm text-gray-600 mt-1">
              Leave empty to keep current image
            </p>
          )}
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img 
                src={imagePreview} 
                alt="Advertisement preview" 
                className="max-w-xs h-auto border border-gray-300 rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png'; // fallback image
                  console.error('Image preview failed to load');
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">{t('status')}</label>
          <select
            value={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="true">{t('active')}</option>
            <option value="false">{t('inactive')}</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (t('submitting') || 'Submitting...') : (id ? t('update') : t('create'))}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/advertisements')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvertisementForm;