import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container, Box } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Article = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/api/articles/${id}`);
        setArticle(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!article) return <div>Article not found</div>;

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h3" gutterBottom>
        {article.title}
      </Typography>
      {article.image && (
        <Box my={2}>
          <img src={article.image} alt={article.title} style={{ width: '100%', height: 'auto' }} />
        </Box>
      )}
      <Typography variant="body1" paragraph>
        {article.content}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        {t('published_on')} {new Date(article.createdAt).toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default Article;