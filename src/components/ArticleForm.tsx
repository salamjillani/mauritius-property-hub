import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  AlertTitle,
  Fade,
  useTheme,
  alpha,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Article as ArticleIcon,
  Title as TitleIcon,
  Description as ContentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ArticleForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({ title: '', content: '' });
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

      const dataToSend = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      };

      let response;
      if (id) {
        response = await axios.put(`/api/articles/${id}`, dataToSend, config);
        toast({ 
          title: t('success'), 
          description: t('article_updated') || 'Article updated successfully' 
        });
      } else {
        response = await axios.post('/api/articles', dataToSend, config);
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
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          {t('loading') || 'Loading...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
            <ArticleIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {id ? t('edit_article') || 'Edit Article' : t('create_article') || 'Create Article'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {id ? t('update_article_details') || 'Update article details' : t('create_new_article') || 'Create a new article'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form Section */}
      <Fade in={!isLoading}>
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap={4}>
                
                {/* Title Field */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TitleIcon color="primary" />
                    {t('title') || 'Title'}
                    <Chip label="Required" size="small" color="error" variant="outlined" />
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter article title"
                    required
                    disabled={isSubmitting}
                    inputProps={{ maxLength: 200 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {formData.title.length}/200
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Content Field */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ContentIcon color="primary" />
                    {t('content') || 'Content'}
                    <Chip label="Required" size="small" color="error" variant="outlined" />
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Write your article content here..."
                    required
                    disabled={isSubmitting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Submit Buttons */}
                <Box display="flex" gap={2} justifyContent="flex-end" pt={2}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/admin/articles')}
                    disabled={isSubmitting}
                    startIcon={<CancelIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {t('cancel') || 'Cancel'}
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: theme.shadows[4],
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isSubmitting ? (
                      t('submitting') || 'Submitting...'
                    ) : (
                      id ? t('update') || 'Update' : t('create') || 'Create'
                    )}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ArticleForm;