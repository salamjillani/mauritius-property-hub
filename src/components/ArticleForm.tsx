import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';

const ArticleForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
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

          const response = await axios.get(`/api/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const articleData = response.data.data;
          setFormData({
            title: articleData.title || '',
            content: articleData.content || ''
          });
          
          if (articleData.image) {
            setImagePreview(articleData.image);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching article:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load article';
          toast({ 
            title: t('error'), 
            description: errorMessage, 
            variant: 'destructive' 
          });
          setIsLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, toast, t, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('error'),
          description: 'Please select an image file',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: t('error'),
          description: 'Image size should be less than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: t('error'),
        description: 'Title is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.content.trim()) {
      toast({
        title: t('error'),
        description: 'Content is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!id && !image) {
      toast({
        title: t('error'),
        description: 'Image is required for new articles',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      
      if (image) {
        formDataToSend.append('image', image);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      };

      let response;
      if (id) {
        response = await axios.put(`/api/articles/${id}`, formDataToSend, config);
        toast({ 
          title: t('success'), 
          description: t('article_updated') || 'Article updated successfully' 
        });
      } else {
        response = await axios.post('/api/articles', formDataToSend, config);
        toast({ 
          title: t('success'), 
          description: t('article_created') || 'Article created successfully' 
        });
      }

      console.log('Article operation successful:', response.data);
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error submitting article:', error);
      
      let errorMessage;
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast({ 
        title: t('error'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? t('edit_article') : t('create_article')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            {t('title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter article title"
            required
            disabled={isSubmitting}
            maxLength={200}
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            {t('content')} <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows={12}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your article content here..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            {t('image')} {!id && <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <div className="text-sm text-gray-500 mt-1">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </div>
          
          {imagePreview && (
            <div className="mt-4">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-md h-48 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('submitting') || 'Submitting...'}
              </div>
            ) : (
              t('submit')
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;