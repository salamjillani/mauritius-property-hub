const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImages,
  getCloudinarySignature
} = require('../controllers/projects');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize('promoter', 'admin'), createProject);

router.get('/cloudinary-signature', protect, getCloudinarySignature);

router.route('/:id')
  .get(getProject)
  .put(protect, authorize('promoter', 'admin'), updateProject)
  .delete(protect, authorize('promoter', 'admin'), deleteProject);

router.route('/:id/images')
  .post(protect, authorize('promoter', 'admin'), uploadProjectImages);

module.exports = router;