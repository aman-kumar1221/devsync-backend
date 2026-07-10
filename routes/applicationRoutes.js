const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Project = require('../models/Project');
//  CORRECT: Unpacks the function with curly braces from the right folder
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');

// 1. APPLY TO A PROJECT (Protected)
router.post('/apply/:projectId', restrictToLoggedInUserOnly, async (req, res) => {
  try {
    const { requestedRole, note } = req.body;
    const projectId = req.params.projectId;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the user is trying to apply to their own project
    if (project.creator.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot apply to your own project' });
    }

    // Create the application record
    const newApplication = new Application({
      project: projectId,
      applicant: req.user.userId,
      requestedRole,
      note
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. REVIEW AN APPLICATION (Accept / Reject) (Protected)
router.patch('/review/:applicationId', restrictToLoggedInUserOnly, async (req, res) => {
  try {
    const { status } = req.body; // Expects 'accepted' or 'rejected'
    const applicationId = req.params.applicationId;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    // Find the application and populate the project data
    const application = await Application.findById(applicationId).populate('project');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Security Check: Make sure the logged-in user is actually the owner of the project
    if (application.project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Only the project creator can review applications' });
    }

    // Update application status
    application.status = status;
    await application.save();

    // If accepted, automatically add the applicant to the project's teamMembers array
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(application.project._id, {
        $addToSet: { teamMembers: application.applicant } // $addToSet avoids adding duplicate entries
      });
    }

    res.status(200).json({ message: `Application status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;