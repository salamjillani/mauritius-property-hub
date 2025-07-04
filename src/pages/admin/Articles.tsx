import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Fade,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles'); 
        
        console.log('API Response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setArticles(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setArticles(response.data.data);
        } else if (response.data && response.data.articles && Array.isArray(response.data.articles)) {
          setArticles(response.data.articles);
        } else {
          console.warn('Unexpected API response structure:', response.data);
          setArticles([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
        setLoading(false);
        setArticles([]);
      }
    };
    
    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setArticles(prevArticles => prevArticles.filter(article => article._id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
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
          {t('loading') || 'Loading articles...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{t('error') || 'Error'}</AlertTitle>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          color="primary"
        >
          {t('retry') || 'Retry'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <ArticleIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {t('manage_articles') || 'Manage Articles'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {articles.length} {t('articles_total') || 'articles total'}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          size="large"
          startIcon={<AddIcon />}
          component={Link} 
          to="/admin/article/new"
          sx={{
            borderRadius: 2,
            px: 3,
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
          {t('create_article') || 'Create Article'}
        </Button>
      </Box>

      {/* Articles Table */}
      <Fade in={!loading}>
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <ArticleIcon fontSize="small" />
                      {t('title') || 'Title'}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" />
                      {t('author') || 'Author'}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarTodayIcon fontSize="small" />
                      {t('date') || 'Date'}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                    align="center"
                  >
                    {t('actions') || 'Actions'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles && articles.length > 0 ? (
                  articles.map((article, index) => (
                    <TableRow 
                      key={article._id || article.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'scale(1.001)',
                        },
                        transition: 'all 0.2s ease',
                        '&:nth-of-type(odd)': {
                          backgroundColor: alpha(theme.palette.grey[100], 0.5)
                        }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {article.title || 'Untitled'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                            {article.author 
                              ? `${article.author.firstName?.[0] || ''}${article.author.lastName?.[0] || ''}`.trim() || 'U'
                              : 'U'
                            }
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {article.author 
                                ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() 
                                : t('unknown_author') || 'Unknown Author'
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={article.createdAt 
                            ? new Date(article.createdAt).toLocaleDateString()
                            : t('no_date') || 'No Date'
                          }
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title={t('edit') || 'Edit'}>
                            <IconButton 
                              component={Link} 
                              to={`/admin/article/edit/${article._id || article.id}`}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('delete') || 'Delete'}>
                            <IconButton 
                              onClick={() => handleDelete(article._id || article.id)}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center" 
                        py={8}
                        gap={2}
                      >
                        <Avatar sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: alpha(theme.palette.grey[400], 0.2) 
                        }}>
                          <ArticleIcon sx={{ fontSize: 40, color: theme.palette.grey[400] }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary">
                          {t('no_articles') || 'No articles found'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('create_first_article') || 'Create your first article to get started'}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />}
                          component={Link} 
                          to="/admin/article/new"
                          sx={{ mt: 2 }}
                        >
                          {t('create_article') || 'Create Article'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>
    </Box>
  );
};

export default AdminArticles;