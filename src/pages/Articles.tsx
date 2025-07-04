import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, CardContent, Typography, Grid, Container, Button,
  Box, Avatar, Chip, CircularProgress, Alert, AlertTitle,
  Fade, useTheme, alpha, IconButton, Tooltip
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles');
      
        let articlesData;
        if (response.data.data && Array.isArray(response.data.data)) {
          articlesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          articlesData = response.data;
        } else if (response.data.articles && Array.isArray(response.data.articles)) {
          articlesData = response.data.articles;
        } else {
          articlesData = [];
        }
        
        setArticles(articlesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          {t('loading') || 'Loading articles...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{t('error') || 'Error'}</AlertTitle>
          {error}
        </Alert>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRefresh} color="primary">
          {t('retry') || 'Retry'}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}
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
              {t('articles') || 'Articles'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {articles.length} {t('articles_available') || 'articles available'}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title={t('refresh') || 'Refresh'}>
          <IconButton onClick={handleRefresh}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      <Fade in={!loading}>
        <Grid container spacing={3}>
          {articles && articles.length > 0 ? (
            articles.map((article) => (
              <Grid item key={article._id} xs={12} sm={6} md={4}>
                <Card elevation={3}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    }
                  }}
                >
                  {article.image ? (
                    <Box sx={{ height: 200, overflow: 'hidden' }}>
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: 200, 
                      backgroundColor: 'grey.100', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <ArticleIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Typography gutterBottom variant="h6" component="div" fontWeight="bold"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3.5rem'
                      }}
                    >
                      {article.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flexGrow: 1
                      }}
                    >
                      {article.content}
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {article.author 
                            ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() 
                            : t('unknown_author') || 'Unknown Author'
                          }
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Chip 
                          label={article.createdAt 
                            ? new Date(article.createdAt).toLocaleDateString()
                            : t('no_date') || 'No Date'
                          }
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 'medium',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>

                    <Button 
                      component={Link} 
                      to={`/article/${article._id}`} 
                      variant="contained"
                      endIcon={<ReadMoreIcon />}
                      fullWidth
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 'medium',
                        boxShadow: theme.shadows[2],
                        '&:hover': {
                          boxShadow: theme.shadows[6],
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {t('read_more') || 'Read More'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card elevation={3}
                sx={{ 
                  borderRadius: 3,
                  p: 6,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.8)} 100%)`
                }}
              >
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: alpha(theme.palette.grey[400], 0.2),
                  mx: 'auto',
                  mb: 3
                }}>
                  <ArticleIcon sx={{ fontSize: 40, color: theme.palette.grey[400] }} />
                </Avatar>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {t('no_articles_found') || 'No articles found'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {t('check_back_later') || 'Check back later for new articles'}
                </Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}
                  sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none' }}
                >
                  {t('refresh') || 'Refresh'}
                </Button>
              </Card>
            </Grid>
          )}
        </Grid>
      </Fade>
    </Container>
  );
};

export default Articles;