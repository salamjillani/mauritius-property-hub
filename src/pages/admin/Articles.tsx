import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fixed: Use /api/articles instead of /articles
        const response = await axios.get('/api/articles'); 
        
        console.log('API Response:', response.data);
        
        // Handle different possible response structures
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
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this article?')) {
      return;
    }

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        <p>{t('error')}: {error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('retry') || 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/admin/article/new" 
        style={{ marginBottom: '20px' }}
      >
        {t('create_article') || 'Create Article'}
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('title') || 'Title'}</TableCell>
              <TableCell>{t('author') || 'Author'}</TableCell>
              <TableCell>{t('date') || 'Date'}</TableCell>
              <TableCell>{t('actions') || 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article._id || article.id}>
                  <TableCell>{article.title || 'Untitled'}</TableCell>
                  <TableCell>
                    {article.author 
                      ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() 
                      : t('unknown_author') || 'Unknown Author'
                    }
                  </TableCell>
                  <TableCell>
                    {article.createdAt 
                      ? new Date(article.createdAt).toLocaleDateString()
                      : t('no_date') || 'No Date'
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      component={Link} 
                      to={`/admin/article/edit/${article._id || article.id}`}
                      title={t('edit') || 'Edit'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(article._id || article.id)}
                      title={t('delete') || 'Delete'}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  {t('no_articles') || 'No articles found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminArticles;