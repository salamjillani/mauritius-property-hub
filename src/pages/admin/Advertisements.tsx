import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get('/api/advertisements');
        
        // Handle different possible response structures
        let adsData;
        if (response.data.data) {
          adsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          adsData = response.data;
        } else {
          adsData = [];
        }
        
        // Ensure we always have an array
        setAds(Array.isArray(adsData) ? adsData : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/advertisements/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAds(ads.filter(ad => ad._id !== id));
    } catch (err) {
      console.error('Error deleting advertisement:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Button variant="contained" color="primary" component={Link} to="/admin/advertisement/new" style={{ marginBottom: '20px' }}>
        {t('create_advertisement')}
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('title')}</TableCell>
              <TableCell>{t('image')}</TableCell>
              <TableCell>{t('link')}</TableCell>
              <TableCell>{t('active')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell>
                    {ad.image && <img src={ad.image} alt={ad.title} style={{ width: '100px' }} />}
                  </TableCell>
                  <TableCell>{ad.link}</TableCell>
                  <TableCell>{ad.isActive ? t('yes') : t('no')}</TableCell>
                  <TableCell>
                    <IconButton component={Link} to={`/admin/advertisement/edit/${ad._id}`}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(ad._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                  {t('no_advertisements_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminAdvertisements;