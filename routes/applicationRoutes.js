const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');
const { applyToProject, reviewApplication } = require('../controllers/applicationController');

router.post('/apply', restrictToLoggedInUserOnly, applyToProject);
router.patch('/review', restrictToLoggedInUserOnly, reviewApplication);

module.exports = router;