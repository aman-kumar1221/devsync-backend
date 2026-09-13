const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');
const { createTask, updateTaskStatus, getProjectTasks } = require('../controllers/workspaceController');

router.get('/:projectId/tasks', restrictToLoggedInUserOnly, getProjectTasks);
router.post('/task', restrictToLoggedInUserOnly, createTask);
router.patch('/task/status', restrictToLoggedInUserOnly, updateTaskStatus);

module.exports = router;