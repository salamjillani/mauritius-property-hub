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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
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
      setError(null);
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ad) => {
    setAdToDelete(ad);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adToDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/advertisements/${adToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted ad from the state
      setAds(ads.filter(ad => ad._id !== adToDelete._id));
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    } catch (err) {
      console.error('Error deleting advertisement:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete advertisement');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const ImageCell = ({ ad }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    if (!ad.image || imageError) {
      return (
        <div className="flex items-center justify-center w-24 h-16 bg-gray-200 rounded text-gray-500 text-xs">
          No Image
        </div>
      );
    }

    return (
      <img 
        src={ad.image} 
        alt={ad.title} 
        className="w-24 h-16 object-cover rounded shadow-sm"
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mb={2}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <h1 className="text-2xl font-bold">{t('advertisements') || 'Advertisements'}</h1>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/admin/advertisement/new"
        >
          {t('create_advertisement') || 'Create Advertisement'}
        </Button>
      </Box>
      
      {error && (
        <Box mb={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('title') || 'Title'}</TableCell>
              <TableCell>{t('image') || 'Image'}</TableCell>
              <TableCell>{t('link') || 'Link'}</TableCell>
              <TableCell>{t('status') || 'Status'}</TableCell>
              <TableCell>{t('created') || 'Created'}</TableCell>
              <TableCell>{t('actions') || 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <TableRow key={ad._id} hover>
                  <TableCell>
                    <div className="font-medium">{ad.title}</div>
                  </TableCell>
                  <TableCell>
                    <ImageCell ad={ad} />
                  </TableCell>
                  <TableCell>
                    <a 
                      href={ad.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline max-w-xs truncate block"
                    >
                      {ad.link}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ad.isActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                      color={ad.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(ad.createdAt)}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      component={Link} 
                      to={`/admin/advertisement/edit/${ad._id}`}
                      color="primary"
                      size="small"
                      title={t('edit') || 'Edit'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(ad)}
                      color="error"
                      size="small"
                      title={t('delete') || 'Delete'}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {ad.link && (
                      <IconButton 
                        component="a"
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="info"
                        size="small"
                        title={t('view') || 'View'}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="text-gray-500">
                    {t('no_advertisements_found') || 'No advertisements found'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('confirm_delete') || 'Confirm Delete'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('delete_advertisement_warning') || 
             `Are you sure you want to delete the advertisement "${adToDelete?.title}"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            {t('cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? (t('deleting') || 'Deleting...') : (t('delete') || 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminAdvertisements;