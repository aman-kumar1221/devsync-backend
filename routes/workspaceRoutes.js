const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');
const { createTask, updateTaskStatus } = require('../controllers/workspaceController');

router.post('/task/create', restrictToLoggedInUserOnly, createTask);
router.patch('/task/status', restrictToLoggedInUserOnly, updateTaskStatus);

module.exports = router;