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
            image: null, // Don't set existing image file
            link: adData.link || '',
            isActive: adData.isActive !== undefined ? adData.isActive : true
          });
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

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('isActive', formData.isActive);
      
      if (formData.image) {
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">{t('title')}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">{t('link')}</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">{t('image')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            required={!id}
            disabled={isSubmitting}
          />
          {id && (
            <p className="text-sm text-gray-600 mt-1">
              Leave empty to keep current image
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">{t('status')}</label>
          <select
            value={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            <option value="true">{t('active')}</option>
            <option value="false">{t('inactive')}</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (t('submitting') || 'Submitting...') : t('submit')}
        </button>
      </form>
    </div>
  );
};

export default AdvertisementForm;