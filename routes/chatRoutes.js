const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');
const { getProjectMessages } = require('../controllers/chatController');

router.get('/:projectId/messages', restrictToLoggedInUserOnly, getProjectMessages);

module.exports = router;