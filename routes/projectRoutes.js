const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');

// Import Clean Controller Blocks
const { 
  createProject, 
  getAllProjects, 
  toggleLikeProject, 
  addCommentToProject 
} = require('../controllers/projectController');

// Core Feed Paths
router.post('/create', restrictToLoggedInUserOnly, createProject);
router.get('/', getAllProjects);

// Social Engagement Paths
router.patch('/:projectId/like', restrictToLoggedInUserOnly, toggleLikeProject);
router.post('/:projectId/comment', restrictToLoggedInUserOnly, addCommentToProject);

module.exports = router;