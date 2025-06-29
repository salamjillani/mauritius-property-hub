import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Grid, Container, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles');
        
        // Debug: Log the response structure
        console.log('API Response:', response.data);
        
        // Handle different possible response structures
        let articlesData;
        if (response.data.data && Array.isArray(response.data.data)) {
          articlesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          articlesData = response.data;
        } else if (response.data.articles && Array.isArray(response.data.articles)) {
          articlesData = response.data.articles;
        } else {
          // Fallback to empty array if structure is unexpected
          articlesData = [];
          console.warn('Unexpected API response structure:', response.data);
        }
        
        setArticles(articlesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>{t('articles')}</Typography>
      <Grid container spacing={4}>
        {/* Add additional safety check */}
        {articles && articles.length > 0 ? (
          articles.map((article) => (
            <Grid item key={article._id} xs={12} sm={6} md={4}>
              <Card>
                {article.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={article.image}
                    alt={article.title}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {article.content}
                  </Typography>
                  <Button component={Link} to={`/article/${article._id}`} color="primary">
                    {t('read_more')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              {t('no_articles_found') || 'No articles found'}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Articles;